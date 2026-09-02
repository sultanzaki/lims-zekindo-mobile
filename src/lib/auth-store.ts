import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { apiUrl } from '@/lib/env';

const REFRESH_TOKEN_KEY = 'lims_refresh_token';

export type MobileUser = {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  initials: string;
  role: string;
  section: string;
  accessRole: string;
};

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type AuthState = {
  accessToken: string | null;
  user: MobileUser | null;
  status: AuthStatus;
};

// Plain module-level store (not React state) so api-client.ts can read/
// refresh the access token without importing React or creating a circular
// dependency with auth-context.tsx, which just wraps this in
// useSyncExternalStore for components that need to re-render on changes.
let state: AuthState = { accessToken: null, user: null, status: 'loading' };
const listeners = new Set<() => void>();

function setState(next: Partial<AuthState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState() {
  return state;
}

async function postJson<T>(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(`${apiUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

type LoginResponse = { accessToken: string; refreshToken: string; user: MobileUser };

async function refreshSession(refreshToken: string): Promise<boolean> {
  const { ok, data } = await postJson<LoginResponse>('/api/mobile/auth/refresh', { refreshToken });
  if (!ok || !data) {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    return false;
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
  setState({ accessToken: data.accessToken, user: data.user, status: 'signedIn' });
  return true;
}

// Called on cold start: try to resume a session from the stored refresh
// token before showing the login screen. This runs fire-and-forget from a
// useEffect with no caller able to catch a rejection, so any startup error
// (e.g. EXPO_PUBLIC_API_URL missing from this build, or a network failure)
// must be handled here — otherwise it would go uncaught on every cold start
// for any device that already has a stored refresh token.
export async function bootstrap() {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      setState({ status: 'signedOut' });
      return;
    }
    const resumed = await refreshSession(refreshToken);
    if (!resumed) {
      setState({ status: 'signedOut', accessToken: null, user: null });
    }
  } catch (err) {
    console.error('[auth] bootstrap failed:', err);
    setState({ status: 'signedOut', accessToken: null, user: null });
  }
}

export async function login(identifier: string, password: string) {
  const { ok, status, data } = await postJson<LoginResponse & { error?: string }>('/api/mobile/auth/login', {
    identifier,
    password,
    deviceLabel: Platform.OS,
  });
  if (!ok || !data) {
    throw new Error(status === 401 ? 'Invalid email/employee ID or password.' : 'Login failed. Try again.');
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
  setState({ accessToken: data.accessToken, user: data.user, status: 'signedIn' });
}

export async function logout() {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  setState({ accessToken: null, user: null, status: 'signedOut' });
  if (refreshToken) {
    // Best-effort server-side revoke — the client is already signed out
    // locally regardless of whether this call succeeds.
    postJson('/api/mobile/auth/logout', { refreshToken }).catch(() => {});
  }
}

// Used by api-client.ts to get a fresh access token after a 401.
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;
  const resumed = await refreshSession(refreshToken);
  return resumed ? getState().accessToken : null;
}
