import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { api, loadToken, saveToken, setUnauthorizedHandler } from './api';
import type { HomeData } from './types';

type Status = 'loading' | 'signedOut' | 'signedIn';

type AuthValue = {
  status: Status;
  home: HomeData | null; // the data behind Home, Me and the tab badges
  error: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [home, setHome] = useState<HomeData | null>(null);
  const [error, setError] = useState('');

  const clearSession = useCallback(async () => {
    await saveToken(null);
    setHome(null);
    setStatus('signedOut');
  }, []);

  const refresh = useCallback(async () => {
    try {
      setHome(await api<HomeData>('/home'));
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  // On start: do we already have a saved token?
  useEffect(() => {
    setUnauthorizedHandler(clearSession);

    (async () => {
      const saved = await loadToken();

      if (!saved) {
        setStatus('signedOut');
        return;
      }

      setStatus('signedIn');
      refresh();
    })();
  }, [clearSession, refresh]);

  // Refresh when the app comes back to the foreground
  useEffect(() => {
    if (status !== 'signedIn') return;

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => sub.remove();
  }, [status, refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await api<{ token: string }>('/login', {
      method: 'POST',
      body: { email, password, device_name: Platform.OS },
    });

    await saveToken(res.token);
    setStatus('signedIn');
    await refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await api('/logout', { method: 'POST' });
    } catch {}

    await clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({ status, home, error, signIn, signOut, refresh }), [status, home, error, signIn, signOut, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');

  return ctx;
}