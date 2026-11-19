import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from './auth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Exercises } from './pages/Exercises';
import { Programs } from './pages/Programs';

function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <div className="brand-name">FitTrack</div>
            <div className="brand-sub">Admin console</div>
          </div>
        </div>
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span>▦</span> Dashboard
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span>👤</span> Users
        </NavLink>
        <NavLink to="/exercises" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span>🏋</span> Exercises
        </NavLink>
        <NavLink to="/programs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span>📋</span> Programs
        </NavLink>
        <div className="sidebar-footer">
          <div style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{user?.fullName}</div>
          <div style={{ marginBottom: 10 }}>{user?.email}</div>
          <button className="btn secondary sm" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="login-wrap">
        <div className="login-card">Loading…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  const { user, loading } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user && !loading ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/users"
        element={
          <RequireAuth>
            <Users />
          </RequireAuth>
        }
      />
      <Route
        path="/exercises"
        element={
          <RequireAuth>
            <Exercises />
          </RequireAuth>
        }
      />
      <Route
        path="/programs"
        element={
          <RequireAuth>
            <Programs />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
