import * as React from "react";
import type { TelemetryPoint } from "@/lib/types";

export type DirectState = "off" | "connecting" | "live" | "unreachable";

export function esp32Base(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function pct(value: number | null): number | null {
  if (value == null) return null;
  return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
}

type MappedPoint = Omit<TelemetryPoint, "ts">;

export function mapEsp32Payload(payload: Record<string, unknown>): MappedPoint {
  const sensors = (
    payload.sensors && typeof payload.sensors === "object" ? payload.sensors : {}
  ) as Record<string, unknown>;
  const quality: TelemetryPoint["quality"] =
    payload.quality === "stale" || payload.quality === "missing" || payload.quality === "good"
      ? payload.quality
      : "good";

  if ("voltage_v" in payload || "light_level" in payload) {
    return {
      voltage_v: num(payload.voltage_v),
      current_a: num(payload.current_a),
      power_w: num(payload.power_w),
      panel_temp_c: num(payload.panel_temp_c) ?? num(payload.temperature),
      ambient_temp_c: num(payload.ambient_temp_c),
      humidity_pct: num(payload.humidity_pct),
      irradiance_wm2: num(payload.irradiance_wm2),
      light_level: num(payload.light_level),
      source: "measured",
      quality,
    };
  }

  const currentMa = num(payload.current);
  const powerMw = num(payload.power);
  const rawLight = num(payload.light);
  const complete = Boolean(sensors.ina219) && Boolean(sensors.ds18b20);

  return {
    voltage_v: num(payload.voltage),
    current_a: currentMa == null ? null : currentMa / 1000,
    power_w: powerMw == null ? null : powerMw / 1000,
    panel_temp_c: num(payload.panel_temperature),
    ambient_temp_c: num(payload.ambient_temperature),
    humidity_pct: num(payload.humidity),
    irradiance_wm2: null,
    light_level: rawLight == null ? null : pct((rawLight / 4095) * 100),
    source: "measured",
    quality: complete ? "good" : "missing",
  };
}

const HISTORY_MS = 130_000;
const HISTORY_MAX = 600;

export function useEsp32Direct(
  base: string | null,
  enabled: boolean,
  pollMs = 300,
): { point: TelemetryPoint | null; state: DirectState; history: TelemetryPoint[] } {
  const [point, setPoint] = React.useState<TelemetryPoint | null>(null);
  const [state, setState] = React.useState<DirectState>("off");
  const [history, setHistory] = React.useState<TelemetryPoint[]>([]);
  const pathRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const blocked =
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      Boolean(base?.startsWith("http://"));

    if (!enabled || !base || blocked) {
      setState("off");
      setPoint(null);
      setHistory([]);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ctrl: AbortController | null = null;
    const buffer: TelemetryPoint[] = [];

    setState("connecting");

    const fetchPoint = async (): Promise<TelemetryPoint> => {
      const paths = pathRef.current ? [pathRef.current] : ["/data", "/api/state"];
      let lastError: unknown = null;
      for (const path of paths) {
        const controller = new AbortController();
        ctrl = controller;
        const abort = setTimeout(() => controller.abort(), 1500);
        try {
          const res = await fetch(`${base}${path}`, { cache: "no-store", signal: controller.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const payload = (await res.json()) as Record<string, unknown>;
          pathRef.current = path;
          return { ts: new Date().toISOString(), ...mapEsp32Payload(payload) };
        } catch (err) {
          lastError = err;
        } finally {
          clearTimeout(abort);
        }
      }
      throw lastError ?? new Error("unreachable");
    };

    const tick = async () => {
      try {
        const next = await fetchPoint();
        if (cancelled) return;
        setPoint(next);
        setState("live");
        const cutoff = Date.now() - HISTORY_MS;
        buffer.push(next);
        while (buffer.length && new Date(buffer[0].ts).getTime() < cutoff) buffer.shift();
        if (buffer.length > HISTORY_MAX) buffer.splice(0, buffer.length - HISTORY_MAX);
        setHistory([...buffer]);
      } catch {
        if (cancelled) return;
        setState("unreachable");
        pathRef.current = null;
      } finally {
        if (!cancelled) timer = setTimeout(tick, pollMs);
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      ctrl?.abort();
    };
  }, [base, enabled, pollMs]);

  return { point, state, history };
}
