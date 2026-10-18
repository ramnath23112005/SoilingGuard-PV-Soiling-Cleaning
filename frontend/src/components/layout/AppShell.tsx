import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar, SidebarRail } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/context/AuthContext";

export function AppShell() {
  const [navOpen, setNavOpen] = React.useState(false);
  const mainRef = React.useRef<HTMLElement>(null);
  const location = useLocation();

  React.useEffect(() => {
    setNavOpen(false);
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  React.useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <div className="h-screen w-full overflow-hidden bg-surface">
      {/* Always-visible slim icon rail (desktop) */}
      <SidebarRail />

      {/* Overlay drawer (fixed, translateX toggled) */}
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Main content wrapper: viewport-sized, scrolls internally */}
      <main ref={mainRef} className="h-full w-full overflow-y-auto">
        <Topbar onOpenMenu={() => setNavOpen(true)} />
        <div className="lg:pl-[72px]">
          <div className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 sm:py-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { user, token, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-solar-600" />
          <p className="text-xs text-slate-500">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children ?? <Outlet />}</>;
}
