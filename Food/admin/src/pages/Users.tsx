import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, apiRequestWithMeta } from '../api';
import type { PageMeta, PublicUser } from '../types';

export function Users() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const usersQ = useQuery({
    queryKey: ['admin', 'users', page, debounced],
    queryFn: () =>
      apiRequestWithMeta<PublicUser[]>('/admin/users', {
        query: { page, limit: 20, search: debounced || undefined, sort: '-createdAt' },
      }),
    placeholderData: (prev) => prev,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: { disabled } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const meta = usersQ.data?.meta as PageMeta | undefined;
  const users = usersQ.data?.data ?? [];

  const onToggle = (u: PublicUser) => {
    const currentlyDisabled = (u as unknown as { disabled?: boolean }).disabled === true;
    const next = !currentlyDisabled;
    const label = next ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${label} ${u.fullName}?`)) return;
    toggleStatus.mutate({ id: u.id, disabled: next });
  };

  return (
    <div>
      <h1 className="page-title">Users</h1>
      <p className="page-sub">Search accounts and manage access.</p>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search users"
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Level</th>
                <th>Joined</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usersQ.isLoading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">Loading…</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <h3>No users found</h3>
                      <p>Try a different search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const disabled = (u as unknown as { disabled?: boolean }).disabled === true;
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>{u.fullName}</td>
                      <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'warning' : 'accent'}`}>{u.role}</span>
                      </td>
                      <td style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{u.experienceLevel ?? '—'}</td>
                      <td style={{ color: 'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${disabled ? 'error' : 'success'}`}>{disabled ? 'disabled' : 'active'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className={`btn sm ${disabled ? 'secondary' : 'danger'}`}
                          disabled={toggleStatus.isPending}
                          onClick={() => onToggle(u)}
                        >
                          {disabled ? 'Enable' : 'Disable'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta ? (
        <div className="pager">
          <span>
            Page {meta.page} of {meta.totalPages || 1} · {meta.total} users
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn secondary sm" disabled={!meta.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            <button type="button" className="btn secondary sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
