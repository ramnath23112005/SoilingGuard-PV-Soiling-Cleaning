import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, apiRequestWithMeta } from '../api';
import type { DashboardStats, PublicUser } from '../types';

export function Dashboard() {
  const statsQ = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiRequest<DashboardStats>('/admin/dashboard'),
  });

  const usersQ = useQuery({
    queryKey: ['admin', 'users', 'recent'],
    queryFn: () => apiRequestWithMeta<PublicUser[]>('/admin/users', { query: { limit: 8, sort: '-createdAt' } }),
  });

  const stats = statsQ.data;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Platform health and recent activity.</p>

      {statsQ.isLoading ? (
        <div className="card">Loading stats…</div>
      ) : statsQ.isError ? (
        <div className="card error-text">{(statsQ.error as Error).message}</div>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total users</div>
            <div className="stat-value">{stats?.users ?? 0}</div>
            <div className="stat-hint">{stats?.activeUsers ?? 0} active</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Workout sessions</div>
            <div className="stat-value">{stats?.sessions ?? 0}</div>
            <div className="stat-hint">{stats?.completedSessions ?? 0} completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Exercises</div>
            <div className="stat-value">{stats?.exercises ?? 0}</div>
            <div className="stat-hint">in library</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Programs</div>
            <div className="stat-value">{stats?.programs ?? 0}</div>
            <div className="stat-hint">published plans</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total volume</div>
            <div className="stat-value">{Math.round(stats?.totalVolumeKg ?? 0).toLocaleString()}</div>
            <div className="stat-hint">kg lifted (all time)</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg session</div>
            <div className="stat-value">{Math.round(stats?.avgSessionMinutes ?? 0)}</div>
            <div className="stat-hint">minutes</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Recent signups</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(usersQ.data?.data ?? []).map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700 }}>{u.fullName}</td>
                  <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'warning' : 'accent'}`}>{u.role}</span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!usersQ.isLoading && (usersQ.data?.data?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty">No users yet.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
