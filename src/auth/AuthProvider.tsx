import { type AuthChangeEvent, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { authConfig, createAuthClient } from './authConfig';
import { AuthContext, useAuth, type AuthActionResult, type AuthContextValue, type AuthStatus } from './authContext';
import { safeReturnTarget } from './authUtils';

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export function AuthProvider({ children, client }: { children: ReactNode; client?: SupabaseClient | null }) {
  const [configuredClient] = useState<SupabaseClient | null>(() => client === undefined ? createAuthClient() : client);
  const enabled = authConfig.enabled && configuredClient !== null;
  const [status, setStatus] = useState<AuthStatus>(enabled ? 'loading' : 'disabled');
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (!enabled || !configuredClient) return;
    let active = true;
    let authEventVersion = 0;
    const requestedVersion = authEventVersion;
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const result = configuredClient.auth.onAuthStateChange((event: AuthChangeEvent, nextSession: Session | null) => {
        if (!active) return;
        authEventVersion += 1;
        setError(null);
        setSession(nextSession);
        setRecovery(event === 'PASSWORD_RECOVERY' && Boolean(nextSession));
        setStatus('ready');
      });
      subscription = result.data.subscription;
    } catch (reason) {
      if (active) { setError(errorMessage(reason)); setStatus('error'); }
      return () => { active = false; subscription?.unsubscribe(); };
    }
    Promise.resolve().then(() => configuredClient.auth.getSession()).then(({ data, error: sessionError }) => {
      if (!active || requestedVersion !== authEventVersion) return;
      if (sessionError) { setError(errorMessage(sessionError)); setStatus('error'); return; }
      setSession(data.session); setRecovery(false); setStatus('ready');
    }).catch((reason) => {
      if (active && requestedVersion === authEventVersion) { setError(errorMessage(reason)); setStatus('error'); }
    });
    return () => { active = false; subscription?.unsubscribe(); };
  }, [configuredClient, enabled]);

  const call = useCallback(async (operation: () => Promise<{ error: unknown }>): Promise<AuthActionResult> => {
    if (!enabled || !configuredClient) return { error: new Error('Authentication is currently unavailable.') };
    setError(null);
    try {
      const result = await operation();
      if (result.error) { const next = new Error(errorMessage(result.error)); setError(next.message); return { error: next }; }
      return { error: null };
    } catch (reason) { const next = new Error(errorMessage(reason)); setError(next.message); return { error: next }; }
  }, [configuredClient, enabled]);

  const value = useMemo<AuthContextValue>(() => ({
    enabled, status, session, error, recovery,
    signIn: (email, password) => call(() => configuredClient!.auth.signInWithPassword({ email, password })),
    signUp: (email, password) => call(() => configuredClient!.auth.signUp({ email, password })),
    sendPasswordReset: (email) => call(() => configuredClient!.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })),
    updatePassword: (password) => {
      if (!recovery || !session) return Promise.resolve({ error: new Error('Password recovery must be started from a valid recovery link.') });
      return call(() => configuredClient!.auth.updateUser({ password })).then(result => { if (!result.error) setRecovery(false); return result; });
    },
    signOut: () => call(() => configuredClient!.auth.signOut()),
  }), [call, configuredClient, enabled, error, recovery, session, status]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function ProtectedStudentRoute({ children }: { children?: ReactNode }) {
  const { enabled, status, session, error } = useAuth();
  const location = useLocation();
  useSEO({ title: 'Student area', description: 'Clinova student area.', noindex: true });
  if (!enabled) return <UnavailableAuth message="Student access is currently unavailable." />;
  if (status === 'loading') return <UnavailableAuth message="Checking your student session…" />;
  if (status === 'error') return <UnavailableAuth message={error ?? 'Unable to check your session.'} />;
  if (!session) return <Navigate to={`/sign-in?returnTo=${encodeURIComponent(safeReturnTarget(`${location.pathname}${location.search}`))}`} replace state={{ from: location }} />;
  return <>{children}</>;
}

export function UnavailableAuth({ message }: { message: string }) {
  useSEO({ title: 'Authentication unavailable', description: 'Authentication is currently unavailable.', noindex: true });
  return <section className="mx-auto max-w-3xl px-6 py-20 text-center" role="status"><h1 className="text-3xl font-bold text-navy-900">Student access unavailable</h1><p className="mt-4 text-navy-600">{message}</p></section>;
}
