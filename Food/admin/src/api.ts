const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const ACCESS_KEY = 'fittrack.admin.access';
const REFRESH_KEY = 'fittrack.admin.refresh';

export function getAccess(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefresh(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}
export function storeTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query): string {
  const url = `${API_BASE}/api/v1${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const refreshToken = getRefresh();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const json = (await res.json()) as { data?: { accessToken?: string; refreshToken?: string } };
        const access = json.data?.accessToken;
        const refresh = json.data?.refreshToken;
        if (access && refresh) {
          storeTokens(access, refresh);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    query?: Query;
    auth?: boolean;
    retry?: boolean;
  } = {}
): Promise<T> {
  const { method = 'GET', body, query, auth = true, retry = true } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getAccess();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Unable to reach the server.');
  }

  if (res.status === 401 && auth && retry) {
    const ok = await tryRefresh();
    if (ok) return apiRequest<T>(path, { ...options, retry: false });
    clearTokens();
    throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired.');
  }

  if (res.status === 204) return undefined as T;

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, 'INVALID_RESPONSE', 'Unreadable response.');
  }

  if (!res.ok) {
    const err = json as { error?: { code?: string; message?: string } };
    throw new ApiError(res.status, err.error?.code ?? 'ERROR', err.error?.message ?? `Request failed (${res.status})`);
  }

  const parsed = json as { data: T; meta?: unknown };
  return parsed.data;
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: { method?: string; body?: unknown; query?: Query } = {}
): Promise<{ data: T; meta?: unknown }> {
  const { method = 'GET', body, query } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getAccess();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Unable to reach the server.');
  }

  if (res.status === 401) {
    const ok = await tryRefresh();
    if (ok) return apiRequestWithMeta<T>(path, options);
    clearTokens();
    throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired.');
  }

  const json = (await res.json().catch(() => null)) as { data: T; meta?: unknown; error?: { message?: string } } | null;
  if (!res.ok || !json) {
    throw new ApiError(res.status, 'ERROR', json?.error?.message ?? `Request failed (${res.status})`);
  }
  return { data: json.data, meta: json.meta };
}
