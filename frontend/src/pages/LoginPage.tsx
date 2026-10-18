import * as React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertOctagon, Eye, EyeOff, Loader2, Lock, Sun, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const HIGHLIGHTS = [
  "Computer-vision soiling classification with transparent confidence",
  "Electrical + visual sensor fusion with evidence-backed decisions",
  "Condition-based cleaning controls with interlocks and audit logs",
  "Fully usable demo mode when no hardware is attached",
];

const DEMO_ACCOUNTS = [
  { user: "admin", pass: "admin123", role: "admin" },
  { user: "operator", pass: "operator123", role: "operator" },
  { user: "viewer", pass: "viewer123", role: "viewer" },
];

export default function LoginPage() {
  const { login, user, token, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  if (!initializing && token && user) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from !== "/login" ? from : "/"} replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 3) {
      setError("Password must be at least 3 characters.");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== "/login" ? from : "/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-navy-900 p-10 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar-600">
              <Sun className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="text-lg font-bold text-white">SoilingGuard</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                PV Soiling &amp; Automatic Cleaning
              </p>
            </div>
          </div>

          <h1 className="mt-14 max-w-md text-2xl font-semibold leading-snug text-white">
            AI-assisted solar panel soiling detection and condition-based cleaning
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            Visual monitoring, electrical telemetry, sensor fusion and safe actuator control in one
            operations console.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-solar-400" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Research project
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            “AI-Assisted Solar Panel Soiling Detection and Condition-Based Automatic Cleaning Using Visual
            and Electrical Monitoring”
          </p>
        </div>
      </div>

      {/* Sign-in panel */}
      <div className="flex items-center justify-center bg-surface px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-solar-600">
              <Sun className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">SoilingGuard</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">PV Soiling Monitor</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
            <p className="mt-1 text-xs text-slate-500">
              Operator access is required to issue cleaning commands.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-xs leading-relaxed text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="pl-8"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-8 pr-9"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Seeded demo accounts
              </p>
              <Badge variant="secondary" size="sm">development</Badge>
            </div>
            <ul className="mt-2 space-y-1.5">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.user} className="flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    className="font-mono text-slate-700 hover:text-solar-700 hover:underline"
                    onClick={() => {
                      setUsername(a.user);
                      setPassword(a.pass);
                    }}
                    title={`Fill sign-in form with ${a.user}`}
                  >
                    {a.user} / {a.pass}
                  </button>
                  <Badge variant="outline" size="sm">{a.role}</Badge>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
              Change or disable these accounts before any real deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
