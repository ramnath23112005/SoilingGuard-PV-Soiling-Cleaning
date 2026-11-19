"""Health, system status and overview endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..schemas import HealthResponse, OverviewResponse, SystemStatus
from ..security import CurrentUser
from ..services.inference import classifier
from ..services.mqtt_adapter import mqtt_adapter
from ..services.settings_service import load_settings
from ..services.system_service import build_overview, build_system_status, resolve_device_id

router = APIRouter(prefix="/api", tags=["system"])
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
def health(db: Session = Depends(get_db)):
    cfg = load_settings(db)
    db_name = "sqlite" if settings.database_url.startswith("sqlite") else "postgresql"
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        demo_mode=bool(cfg.get("demo_mode", True)),
        database=db_name,
        model_available=classifier.available,
        mqtt_connected=mqtt_adapter.connected,
        time=datetime.now(timezone.utc),
    )


@router.get("/system/status", response_model=SystemStatus)
def system_status(_: CurrentUser, db: Session = Depends(get_db)):
    return SystemStatus(**build_system_status(db))


@router.get("/overview", response_model=OverviewResponse)
def overview(_: CurrentUser, device_id: str | None = Query(default=None), db: Session = Depends(get_db)):
    resolved = resolve_device_id(db, device_id)
    if resolved is None:
        raise HTTPException(status_code=404, detail="No device is registered yet.")
    try:
        return OverviewResponse(**build_overview(db, resolved))
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from None


@router.post("/system/ping-esp32")
def ping_esp32(
    _: CurrentUser,
    db: Session = Depends(get_db),
):
    """Test reachability of the configured ESP32 URL.

    POSTs to <esp32_url>/api/device/status with the configured device key
    so the firmware's authentication layer also runs. Returns latency_ms on
    success or a descriptive error on failure.
    """
    import time

    try:
        import httpx
    except ImportError:
        raise HTTPException(status_code=500, detail="httpx is not installed; cannot reach the ESP32.")

    cfg = load_settings(db)
    base = (cfg.get("esp32_url") or "").rstrip("/")
    key = cfg.get("esp32_device_key") or settings.iot_device_key

    if not base:
        raise HTTPException(status_code=422, detail="esp32_url is not configured. Set it in Settings first.")
    if not (base.startswith("http://") or base.startswith("https://")):
        raise HTTPException(status_code=422, detail="esp32_url must start with http:// or https://.")

    target = f"{base}/api/device/status"
    t0 = time.monotonic()
    try:
        with httpx.Client(timeout=6.0) as client:
            res = client.post(
                target,
                json={"online": True},
                headers={"X-Device-Key": key},
            )
        latency_ms = round((time.monotonic() - t0) * 1000, 1)
        if res.status_code == 401:
            return {"ok": False, "detail": f"ESP32 reachable but rejected the device key (HTTP 401). Latency: {latency_ms} ms."}
        if not res.is_success:
            return {"ok": False, "detail": f"ESP32 answered HTTP {res.status_code}. Latency: {latency_ms} ms."}
        return {"ok": True, "detail": f"ESP32 is online and authenticated. Latency: {latency_ms} ms.", "latency_ms": latency_ms}
    except httpx.ConnectError:
        return {"ok": False, "detail": f"Cannot connect to {target}. Check the IP address and that the ESP32 is on the same network."}
    except httpx.TimeoutException:
        return {"ok": False, "detail": f"Connection to {target} timed out after 6 s. The ESP32 may be offline or unreachable."}
    except Exception as exc:
        return {"ok": False, "detail": f"Unexpected error: {type(exc).__name__}: {exc}"}

