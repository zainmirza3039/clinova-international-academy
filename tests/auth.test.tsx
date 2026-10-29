import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AuthProvider, ProtectedStudentRoute } from '@/auth/AuthProvider';

const makeClient = () => {
  let listener: ((event: string, session: unknown) => void) | undefined;
  const session = { user: { id: 'user-1', email: 'student@example.test' }, access_token: 'test-token' };
  const auth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn((callback: typeof listener) => { listener = callback; return { data: { subscription: { unsubscribe: vi.fn() } } }; }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: { user: session.user }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  };
  return { auth, session, emit: (event: string, next = session) => listener?.(event, next) } as unknown as SupabaseClient & { session: typeof session; emit: (event: string, next?: typeof session) => void };
};

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('auth foundation', () => {
  it('is unavailable by default and never constructs a client', () => {
    const client = makeClient();
    render(<AuthProvider client={null}><MemoryRouter><ProtectedStudentRoute><p>private</p></ProtectedStudentRoute></MemoryRouter></AuthProvider>);
    expect(screen.getByText('Student access unavailable')).toBeTruthy();
    expect(screen.queryByText('private')).toBeNull();
    expect(client.auth.getSession).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated enabled visitors to auth with a safe student target', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://ssxpmcbqfdggfsoqbxac.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-key');
    vi.resetModules();
    const { AuthProvider: Provider, ProtectedStudentRoute: Guard } = await import('@/auth/AuthProvider');
    const client = makeClient();
    render(<Provider client={client}><MemoryRouter initialEntries={['/student?returnTo=https://evil.test']}><Routes><Route path="/student" element={<Guard><p>private</p></Guard>} /><Route path="/sign-in" element={<p>auth-screen</p>} /></Routes></MemoryRouter></Provider>);
    await waitFor(() => expect(screen.getByText('auth-screen')).toBeTruthy());
    expect(screen.queryByText('private')).toBeNull();
  });

  it('accepts a recovery event and allows update, but rejects ordinary sessions', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://ssxpmcbqfdggfsoqbxac.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-key');
    vi.resetModules();
    const { AuthProvider: Provider } = await import('@/auth/AuthProvider');
    const { useAuth } = await import('@/auth/authContext');
    const client = makeClient();
    function Probe() { const auth = useAuth(); return <><button onClick={() => void auth.updatePassword('new-password')}>update</button><button onClick={() => void auth.signOut()}>out</button><span>{auth.recovery ? 'recovery' : 'ordinary'}</span></>; }
    render(<Provider client={client}><Probe /></Provider>);
    await waitFor(() => expect(screen.getByText('ordinary')).toBeTruthy());
    expect((await (async () => { const button = screen.getByText('update'); button.click(); await Promise.resolve(); return client.auth.updateUser; })())).not.toHaveBeenCalled();
    client.emit('PASSWORD_RECOVERY');
    await waitFor(() => expect(screen.getByText('recovery')).toBeTruthy());
    screen.getByText('update').click();
    await waitFor(() => expect(client.auth.updateUser).toHaveBeenCalledWith({ password: 'new-password' }));
    screen.getByText('out').click();
    await waitFor(() => expect(client.auth.signOut).toHaveBeenCalled());
  });
});
