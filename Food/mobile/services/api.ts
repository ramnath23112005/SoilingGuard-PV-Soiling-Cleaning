import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/api';
import type { ApiErrorBody } from '../types';

const ACCESS_KEY = 'fittrack.access';
const REFRESH_KEY = 'fittrack.refresh';

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_KEY);
  } catch {
    return null;
  }
}

export async function storeTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch {
    /* noop */
  }
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) return false;
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const body = await res.json();
        await storeTokens(body.data.accessToken, body.data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      }
    })();
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  retry?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Fetch wrapper: attaches bearer token, transparently refreshes once on 401,
 * normalizes errors to ApiClientError.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true, retry = true, signal } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiClientError(0, 'NETWORK_ERROR', 'Unable to reach the server. Check your connection.');
  }

  if (res.status === 401 && auth && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiRequest<T>(path, { ...options, retry: false });
    await clearTokens();
    for (const l of sessionExpiredListeners) l();
    throw new ApiClientError(401, 'SESSION_EXPIRED', 'Your session expired. Please log in again.');
  }

  if (res.status === 204) return undefined as T;

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiClientError(res.status, 'INVALID_RESPONSE', 'Server returned an unreadable response.');
  }

  if (!res.ok) {
    const errBody = json as Partial<ApiErrorBody>;
    throw new ApiClientError(
      res.status,
      errBody.error?.code ?? 'ERROR',
      errBody.error?.message ?? `Request failed (${res.status})`,
      errBody.error?.details
    );
  }

  const parsed = json as { data: T; meta?: unknown };
  return parsed.data;
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta?: unknown }> {
  const { method = 'GET', body, query, auth = true, retry = true } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiClientError(0, 'NETWORK_ERROR', 'Unable to reach the server. Check your connection.');
  }

  if (res.status === 401 && auth && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiRequestWithMeta<T>(path, { ...options, retry: false });
    await clearTokens();
    for (const l of sessionExpiredListeners) l();
    throw new ApiClientError(401, 'SESSION_EXPIRED', 'Your session expired. Please log in again.');
  }

  const json = (await res.json().catch(() => null)) as
    | { data: T; meta?: unknown; error?: { code: string; message: string; details?: unknown } }
    | null;

  if (!res.ok || !json) {
    throw new ApiClientError(
      res.status,
      json?.error?.code ?? 'ERROR',
      json?.error?.message ?? `Request failed (${res.status})`,
      json?.error?.details
    );
  }
  return { data: json.data, meta: json.meta };
}
