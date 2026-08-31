import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';

import * as authStore from '@/lib/auth-store';

type AuthContextValue = ReturnType<typeof authStore.getState> & {
  login: typeof authStore.login;
  logout: typeof authStore.logout;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    authStore.bootstrap();
  }, []);

  const state = useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);

  const value: AuthContextValue = {
    ...state,
    login: authStore.login,
    logout: authStore.logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
