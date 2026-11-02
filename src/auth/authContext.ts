import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export type AuthStatus = 'loading' | 'ready' | 'disabled' | 'error';
export type AuthActionResult = { error: Error | null; emailVerificationPending?: boolean };

export type AuthContextValue = {
  enabled: boolean;
  status: AuthStatus;
  session: Session | null;
  emailVerified: boolean;
  error: string | null;
  recovery: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string, redirectTo?: string) => Promise<AuthActionResult>;
  sendPasswordReset: (email: string, redirectTo?: string) => Promise<AuthActionResult>;
  resendEmailVerification: (email: string, redirectTo?: string) => Promise<AuthActionResult>;
  updatePassword: (password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useOptionalAuth() {
  return useContext(AuthContext);
}

export function useAuth() {
  const context = useOptionalAuth();
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
