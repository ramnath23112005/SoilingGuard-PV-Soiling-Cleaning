"""Direct-IP link to the ESP32 controller.

When demo mode is off and an ESP32 base URL is configured, the backend polls the
firmware's own web server and stores the readings as real telemetry. Two device
APIs are supported:

* ``GET /data``      - the standalone Soiling Guard sketch (voltage V, current mA,
                       power mW, panel/ambient temperature, humidity, raw LDR ADC,
                       motor STOP/FORWARD/REVERSE.)
* ``GET /api/state`` - the SoilingGuard_ESP32 sketch (voltage V, current A, power W,
                       light %, temperature, sensor flags.)

Motor control goes through the same device server (``GET /motor?action=...`` on
the standalone sketch) so cleaning jobs queued from the dashboard actually run.

Nothing is invented: missing sensor keys are stored as NULL, and an unreachable
device leaves the last real reading in place while the link shows as unreachable.
"""

from __future__ import annotations

import logging
import threading
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from sqlalchemy import select

from ..config import get_settings
from ..models import CleaningJob, TelemetryReading
from .settings_service import load_settings

logger = logging.getLogger("soilingguard.esp32_link")
settings = get_settings()

POLL_INTERVAL_S = 5.0
REQUEST_TIMEOUT_S = 4.0
DEDUPE_WINDOW_S = 8.0
HARD_MAX_RUNTIME_S = 600.0
MOTOR_FORWARD = "FORWARD"
MOTOR_STOP = "STOP"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _num(value: Any) -> float | None:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _normalize(payload: dict[str, Any], default_device: str) -> dict[str, Any]:
    """Map either firmware API onto the canonical telemetry shape."""
    sensors = payload.get("sensors") if isinstance(payload.get("sensors"), dict) else {}

    # /api/state already speaks the canonical units.
    if "light_level" in payload or "voltage_v" in payload:
        panel_temp = payload.get("panel_temp_c")
        if panel_temp is None:
            panel_temp = payload.get("temperature")
        return {
            "device_id": payload.get("device_id") or default_device,
            "firmware_version": payload.get("firmware_version"),
            "timestamp": payload.get("timestamp"),
            "voltage": _num(payload.get("voltage")),
            "current": _num(payload.get("current")),
            "power": _num(payload.get("power")),
            "light_level": _num(payload.get("light_level")),
            "panel_temp_c": _num(panel_temp),
            "ambient_temp_c": _num(payload.get("ambient_temp_c")),
            "humidity_pct": _num(payload.get("humidity_pct")),
            "motor_status": str(payload.get("motor_status") or ""),
            "quality": payload.get("quality") if payload.get("quality") in ("good", "stale", "missing") else "good",
            "sensors": sensors,
        }

    # Standalone sketch: /data
    raw_light = _num(payload.get("light"))
    light_pct = None
    if raw_light is not None:
        light_pct = round(max(0.0, min(100.0, raw_light / 4095.0 * 100.0)), 1)

    current_ma = _num(payload.get("current"))
    power_mw = _num(payload.get("power"))
    motor = str(payload.get("motor_status") or "").upper()
    complete = bool(sensors.get("ina219")) and bool(sensors.get("ds18b20"))
    epoch = _num(payload.get("timestamp"))
    if epoch is not None and epoch < 1_700_000_000:
        epoch = None

    return {
        "device_id": payload.get("device_id") or default_device,
        "firmware_version": payload.get("firmware_version"),
        "timestamp": epoch,
        "voltage": _num(payload.get("voltage")),
        "current": (current_ma / 1000.0) if current_ma is not None else None,
        "power": (power_mw / 1000.0) if power_mw is not None else None,
        "light_level": light_pct,
        "panel_temp_c": _num(payload.get("panel_temperature")),
        "ambient_temp_c": _num(payload.get("ambient_temperature")),
        "humidity_pct": _num(payload.get("humidity")),
        "motor_status": "running" if motor in ("FORWARD", "REVERSE") else "stopped",
        "quality": "good" if complete else "missing",
        "sensors": {
            "ina219": bool(sensors.get("ina219")),
            "ldr": bool(sensors.get("ldr", raw_light is not None)),
            "ds18b20": bool(sensors.get("ds18b20")),
            "dht11": bool(sensors.get("dht11")),
        },
    }


class Esp32Link:
    """Background poller for the configured ESP32 base URL."""

    def __init__(self, session_factory=None) -> None:
        self._session_factory = session_factory
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._lock = threading.Lock()
        self._pending_stop: dict[str, datetime] = {}
        self._state: dict[str, Any] = {
            "state": "disabled",
            "url": None,
            "device_id": None,
            "api": None,
            "reachable": False,
            "latency_ms": None,
            "last_poll_at": None,
            "last_ok_at": None,
            "last_error": None,
        }

    @property
    def running(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            return dict(self._state)

    def _set(self, **updates: Any) -> None:
        with self._lock:
            self._state.update(updates)

    def start(self) -> None:
        if self._session_factory is None or self.running:
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, name="esp32-link", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=3)
        self._thread = None

    def _run(self) -> None:
        while not self._stop.wait(POLL_INTERVAL_S):
            try:
                self.tick_once()
            except Exception:  # pragma: no cover - keep the poller alive
                logger.exception("ESP32 link iteration failed")

    def tick_once(self) -> dict[str, Any]:
        """Poll the ESP32 once. Safe to call from tests."""
        if self._session_factory is None:
            return self.snapshot()

        db = self._session_factory()
        try:
            cfg = load_settings(db)
            base = str(cfg.get("esp32_url") or "").strip().rstrip("/")

            if bool(cfg.get("demo_mode", True)):
                self._set(
                    state="disabled",
                    url=base or None,
                    reachable=False,
                    last_poll_at=_now(),
                    last_error="Demo mode is on - direct ESP32 link is idle.",
                )
                return self.snapshot()

            if not base:
                self._set(
                    state="not_configured",
                    url=None,
                    reachable=False,
                    last_poll_at=_now(),
                    last_error="No ESP32 base URL configured.",
                )
                return self.snapshot()

            key = str(cfg.get("esp32_device_key") or settings.iot_device_key)
            self._set(url=base)

            started = _now()
            try:
                api, payload = self._fetch(base, key)
            except _LinkError as exc:
                self._set(
                    state="unreachable",
                    api=None,
                    reachable=False,
                    latency_ms=round((_now() - started).total_seconds() * 1000, 1),
                    last_poll_at=_now(),
                    last_error=str(exc),
                )
                return self.snapshot()

            latency_ms = round((_now() - started).total_seconds() * 1000, 1)
            normalized = _normalize(payload, settings.iot_default_device_id)
            device_id = self._ingest(db, normalized)
            self._dispatch(db, base, cfg, device_id)

            self._set(
                state="connected",
                api=api,
                reachable=True,
                device_id=device_id,
                latency_ms=latency_ms,
                last_poll_at=_now(),
                last_ok_at=_now(),
                last_error=None,
            )
            return self.snapshot()
        finally:
            db.close()

    # ------------------------------------------------------------------ HTTP
    def _fetch(self, base: str, key: str) -> tuple[str, dict[str, Any]]:
        if not (base.startswith("http://") or base.startswith("https://")):
            raise _LinkError("ESP32 URL must start with http:// or https://.")

        errors: list[str] = []
        for path in ("/data", "/api/state"):
            target = f"{base}{path}"
            try:
                with httpx.Client(timeout=REQUEST_TIMEOUT_S) as client:
                    res = client.get(target, headers={"X-Device-Key": key})
            except httpx.ConnectError as exc:
                raise _LinkError(f"Cannot connect to {base}: check the IP and network.") from exc
            except httpx.TimeoutException as exc:
                raise _LinkError(f"{base} timed out after {REQUEST_TIMEOUT_S:.0f} s.") from exc
            except Exception as exc:  # pragma: no cover - defensive
                raise _LinkError(f"{type(exc).__name__}: {exc}") from exc

            if res.status_code in (404, 405):
                errors.append(f"{path} -> HTTP {res.status_code}")
                continue
            if res.status_code == 401:
                raise _LinkError("ESP32 rejected the device key (HTTP 401).")
            if res.status_code >= 400:
                raise _LinkError(f"ESP32 answered HTTP {res.status_code} at {path}.")
            try:
                data = res.json()
            except ValueError as exc:
                raise _LinkError(f"{path} did not return JSON.") from exc
            if not isinstance(data, dict):
                raise _LinkError(f"{path} did not return a JSON object.")
            return path, data

        raise _LinkError(
            f"No supported data endpoint on {base} ({', '.join(errors)}). "
            "Flash a sketch that serves /data or /api/state."
        )

    def _send_motor(self, base: str, action: str) -> bool:
        try:
            with httpx.Client(timeout=REQUEST_TIMEOUT_S) as client:
                res = client.get(f"{base}/motor", params={"action": action})
            return res.is_success
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("Motor command %s failed: %s", action, exc)
            return False

    # ----------------------------------------------------------------- ingest
    def _ingest(self, db, payload: dict[str, Any]) -> str:
        from ..routers.iot import _get_or_create_device, _mark_seen, _parse_ts

        device = _get_or_create_device(db, str(payload.get("device_id"))[:64] or settings.iot_default_device_id)

        firmware = payload.get("firmware_version")
        if firmware:
            device.firmware_version = str(firmware)[:32]
        sensors = payload.get("sensors") or {}
        if isinstance(sensors, dict) and "ina219" in sensors:
            device.electrical_sensor_status = "ok" if sensors.get("ina219") else "fault"
        if payload.get("motor_status"):
            device.controller_status = "ok"

        _mark_seen(db, device)

        last_ts = _aware(
            db.execute(
                select(TelemetryReading.ts)
                .where(
                    TelemetryReading.device_id == device.id,
                    TelemetryReading.source == "measured",
                )
                .order_by(TelemetryReading.ts.desc())
                .limit(1)
            ).scalar_one_or_none()
        )
        if last_ts is not None and (_now() - last_ts).total_seconds() < DEDUPE_WINDOW_S:
            # The firmware likely pushed this same sample already; just refresh liveness.
            return device.id

        db.add(
            TelemetryReading(
                device_id=device.id,
                ts=_parse_ts(payload.get("timestamp"), None),
                voltage_v=payload.get("voltage"),
                current_a=payload.get("current"),
                power_w=payload.get("power"),
                panel_temp_c=payload.get("panel_temp_c"),
                ambient_temp_c=payload.get("ambient_temp_c"),
                humidity_pct=payload.get("humidity_pct"),
                light_level=payload.get("light_level"),
                source="measured",
                quality=payload.get("quality") or "good",
            )
        )
        db.commit()
        return device.id

    # ------------------------------------------------------------------ motor
    def _dispatch(self, db, base: str, cfg: dict, device_id: str) -> None:
        from .events import create_alert, log_event

        job = db.execute(
            select(CleaningJob)
            .where(CleaningJob.device_id == device_id, CleaningJob.status.in_(["queued", "running"]))
            .order_by(CleaningJob.requested_at.desc())
            .limit(1)
        ).scalar_one_or_none()
        if job is None:
            return
        if job.simulated:
            return

        max_runtime = float(cfg.get("max_cleaning_runtime_s") or 60.0)
        runtime = max(10.0, min(max_runtime, HARD_MAX_RUNTIME_S))
        now = _now()

        if job.status == "queued":
            if not self._send_motor(base, MOTOR_FORWARD):
                return
            latest_power = db.execute(
                select(TelemetryReading.power_w)
                .where(TelemetryReading.device_id == device_id, TelemetryReading.power_w.is_not(None))
                .order_by(TelemetryReading.ts.desc())
                .limit(1)
            ).scalar_one_or_none()
            job.status = "running"
            job.started_at = now
            job.acknowledged = True
            job.power_before_w = latest_power
            db.commit()
            log_event(
                db,
                "cleaning_dispatched",
                f"START (motor FORWARD) sent directly to the ESP32 at {base}; running up to {runtime:.0f} s.",
                device_id=device_id,
                status="info",
                actor="esp32-link",
                reference=job.id,
            )
            return

        # running
        started = _aware(job.started_at) or now
        deadline = started + timedelta(seconds=runtime)
        stopping = job.error == "STOP_REQUESTED" or now >= deadline

        pending = self._pending_stop.get(job.id)
        if pending is None and stopping:
            if not self._send_motor(base, MOTOR_STOP):
                return
            self._pending_stop[job.id] = now
            log_event(
                db,
                "cleaning_stop_sent",
                f"STOP (motor stopped) sent to the ESP32 at {base}.",
                device_id=device_id,
                status="info",
                actor="esp32-link",
                reference=job.id,
            )
            return

        if pending is not None and (now - pending).total_seconds() >= 3.0:
            latest = db.execute(
                select(TelemetryReading)
                .where(TelemetryReading.device_id == device_id)
                .order_by(TelemetryReading.ts.desc())
                .limit(1)
            ).scalar_one_or_none()
            after_power = latest.power_w if latest else None
            duration = max(0.0, (now - started).total_seconds())
            before = job.power_before_w
            requested_stop = job.error == "STOP_REQUESTED"

            job.status = "stopped" if requested_stop else "completed"
            job.completed_at = now
            job.duration_s = round(duration, 1)
            job.power_after_w = after_power
            if before is not None and before > 0 and after_power is not None:
                job.delta_pct = round((after_power - before) / before * 100.0, 2)
            job.measurement_note = (
                "Measured via the ESP32 direct link (/data); before/after power from real INA219 samples."
            )[:255]
            job.error = None if not requested_stop else "Stopped by the operator."
            db.commit()
            self._pending_stop.pop(job.id, None)

            log_event(
                db,
                f"cleaning_{job.status}",
                f"Cycle {job.id[:8]} {job.status} after {duration:.0f} s"
                + (f"; power {before:.2f} W -> {after_power:.2f} W" if before is not None and after_power is not None else ""),
                device_id=device_id,
                status="success" if not requested_stop else "warning",
                actor="esp32-link",
                reference=job.id,
            )
            create_alert(
                db,
                "info" if not requested_stop else "warning",
                f"Cleaning {job.status} (ESP32 link)",
                f"Direct-IP cycle {job.id[:8]} finished: {duration:.0f} s at {base}.",
                category="cleaning",
                device_id=device_id,
            )


class _LinkError(Exception):
    pass


esp32_link = Esp32Link(None)  # bound in the app lifespan
