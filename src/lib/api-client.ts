import { apiUrl } from '@/lib/env';
import { getState, refreshAccessToken } from '@/lib/auth-store';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, token: string | null, options: RequestInit) {
  return fetch(`${apiUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

// Authenticated fetch for the mobile API routes (src/app/api/mobile/* in the
// lims-zekindo repo). On a 401 it tries exactly one silent refresh-and-retry
// before giving up — a second 401 after a fresh access token means the
// request itself is unauthorized (wrong role, etc.), not an expired token.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = getState().accessToken;
  let res = await request(path, token, options);

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await request(path, newToken, options);
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || (data && data.ok === false)) {
    throw new ApiError(data?.error || 'Request failed.', res.status);
  }
  return data as T;
}
