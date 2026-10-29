// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient }));

const validEnv = () => {
  vi.stubEnv('VITE_AUTH_ENABLED', 'true');
  vi.stubEnv('VITE_SUPABASE_URL', 'https://ssxpmcbqfdggfsoqbxac.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
};

function makeClient(options: { session?: unknown; getSession?: Promise<unknown> } = {}) {
  let listener: ((event: string, session: unknown) => void) | undefined;
  const session = options.session ?? { user: { id: 'u1', email: 'student@example.test' }, access_token: 'token' };
  const sessionResult = options.getSession ?? Promise.resolve({ data: { session: null }, error: null });
  const unsubscribe = vi.fn();
  const auth = {
    getSession: vi.fn(() => sessionResult),
    onAuthStateChange: vi.fn((callback: (event: string, session: unknown) => void) => {
      listener = callback;
      return { data: { subscription: { unsubscribe } } };
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: { user: (session as { user?: unknown })?.user }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
  return { auth, session, unsubscribe, emit: (event: string, next: unknown = session) => listener?.(event, next) };
}

async function loadAuth() {
  vi.resetModules();
  return {
    ...(await import('@/auth/AuthProvider')),
    ...(await import('@/auth/authContext')),
    ...(await import('@/auth/authUtils')),
  };
}
async function loadBoth() {
  vi.resetModules();
  return {
    ...(await import('@/auth/AuthProvider')),
    ...(await import('@/auth/authContext')),
    ...(await import('@/auth/authUtils')),
    AuthPage: (await import('@/pages/AuthPage')).default,
    MemoryRouter: (await import('react-router-dom')).MemoryRouter,
  };
}
function Probe({ useAuth }: { useAuth: typeof import('@/auth/authContext').useAuth }) {
  const auth = useAuth();
  return <><span data-testid="status">{auth.status}</span><span data-testid="session">{auth.session ? 'session' : 'none'}</span><span data-testid="recovery">{String(auth.recovery)}</span></>;
}

beforeEach(() => { createClient.mockReset(); });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe('AuthProvider safety and session lifecycle', () => {
  it('hydrates a persisted session returned by getSession', async () => {
    validEnv();
    const client = makeClient({ getSession: Promise.resolve({ data: { session: { user: { id: 'persisted' } }, error: null } }) });
    const { AuthProvider, useAuth } = await loadAuth();
    render(<AuthProvider client={client as unknown as SupabaseClient}><Probe useAuth={useAuth} /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toContain('ready'));
    expect(screen.getByTestId('session').textContent).toContain('session');
    expect(client.auth.getSession).toHaveBeenCalledTimes(1);
  });

  it('fails closed when getSession returns an error', async () => {
    validEnv();
    const client = makeClient({ getSession: Promise.resolve({ data: { session: null }, error: new Error('session unavailable') }) });
    const { AuthProvider, useAuth } = await loadAuth();
    function ErrorProbe() { const auth = useAuth(); return <><span>{auth.status}</span><span>{auth.error}</span></>; }
    render(<AuthProvider client={client as unknown as SupabaseClient}><ErrorProbe /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('error')).toBeTruthy());
    expect(screen.getByText('session unavailable')).toBeTruthy();
  });

  it('does not let a stale getSession overwrite SIGNED_OUT or PASSWORD_RECOVERY', async () => {
    validEnv();
    let resolveSession!: (value: unknown) => void;
    const pending = new Promise(resolve => { resolveSession = resolve; });
    const client = makeClient({ getSession: pending });
    const { AuthProvider, useAuth } = await loadAuth();
    render(<AuthProvider client={client as unknown as SupabaseClient}><Probe useAuth={useAuth} /></AuthProvider>);
    await act(async () => { client.emit('SIGNED_OUT', null); });
    await waitFor(() => expect(screen.getByTestId('status').textContent).toContain('ready'));
    expect(screen.getByTestId('session').textContent).toContain('none');
    await act(async () => { resolveSession({ data: { session: client.session }, error: null }); await Promise.resolve(); });
    expect(screen.getByTestId('session').textContent).toContain('none');

    let resolveRecovery!: (value: unknown) => void;
    const recoveryPending = new Promise(resolve => { resolveRecovery = resolve; });
    const recoveryClient = makeClient({ getSession: recoveryPending });
    cleanup();
    render(<AuthProvider client={recoveryClient as unknown as SupabaseClient}><Probe useAuth={useAuth} /></AuthProvider>);
    await act(async () => { recoveryClient.emit('PASSWORD_RECOVERY'); });
    await waitFor(() => expect(screen.getByTestId('recovery').textContent).toContain('true'));
    await act(async () => { resolveRecovery({ data: { session: recoveryClient.session }, error: null }); await Promise.resolve(); });
    expect(screen.getByTestId('recovery').textContent).toContain('true');
  });

  it('unsubscribes the auth listener on unmount', async () => {
    validEnv();
    const client = makeClient();
    const { AuthProvider, useAuth } = await loadAuth();
    const view = render(<AuthProvider client={client as unknown as SupabaseClient}><Probe useAuth={useAuth} /></AuthProvider>);
    await waitFor(() => expect(client.auth.onAuthStateChange).toHaveBeenCalled());
    view.unmount();
    expect(client.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('uses the exact browser-origin reset-password redirect', async () => {
    validEnv();
    const client = makeClient();
    const { AuthProvider, useAuth } = await loadAuth();
    function Reset() { const auth = useAuth(); return <button onClick={() => void auth.sendPasswordReset('student@example.test')}>reset</button>; }
    render(<AuthProvider client={client as unknown as SupabaseClient}><Reset /></AuthProvider>);
    await act(async () => { fireEvent.click(screen.getByText('reset')); });
    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith('student@example.test', { redirectTo: `${window.location.origin}/reset-password` });
  });

  it('does not construct an SDK client for wrong project configuration', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://other-project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
    const { AuthProvider, useAuth } = await loadAuth();
    render(<AuthProvider><Probe useAuth={useAuth} /></AuthProvider>);
    expect(createClient).not.toHaveBeenCalled();
    expect(screen.getByTestId('status').textContent).toContain('disabled');
  });

  it('permits update only after PASSWORD_RECOVERY and clears recovery after success', async () => {
    validEnv();
    const client = makeClient();
    const { AuthProvider, useAuth } = await loadAuth();
    function Controls() { const auth = useAuth(); return <><button onClick={() => void auth.updatePassword('new-password')}>update</button><span>{String(auth.recovery)}</span></>; }
    render(<AuthProvider client={client as unknown as SupabaseClient}><Controls /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('false')).toBeTruthy());
    await act(async () => { fireEvent.click(screen.getByText('update')); });
    expect(client.auth.updateUser).not.toHaveBeenCalled();
    await act(async () => { client.emit('PASSWORD_RECOVERY'); });
    await waitFor(() => expect(screen.getByText('true')).toBeTruthy());
    await act(async () => { fireEvent.click(screen.getByText('update')); });
    expect(client.auth.updateUser).toHaveBeenCalledWith({ password: 'new-password' });
    await waitFor(() => expect(screen.getByText('false')).toBeTruthy());
  });
});

describe('safe return targets and AuthPage validation', () => {
  it('renders a noninteractive loading state until authentication is ready', async () => {
    validEnv();
    let resolveSession!: (value: unknown) => void;
    const client = makeClient({ getSession: new Promise(resolve => { resolveSession = resolve; }) });
    const { AuthProvider, AuthPage, MemoryRouter } = await loadBoth();
    render(<AuthProvider client={client as unknown as SupabaseClient}><MemoryRouter><AuthPage mode="sign-in" /></MemoryRouter></AuthProvider>);
    expect(screen.getByRole('status').textContent).toContain('Checking your student session');
    expect(screen.queryByRole('form')).toBeNull();
    await act(async () => { resolveSession({ data: { session: null }, error: null }); });
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('allows a same-origin admin return target for the role-gated admin page', async () => {
    const { safeReturnTarget } = await loadAuth();
    expect(safeReturnTarget('/admin')).toBe('/admin');
    expect(safeReturnTarget('/admin/certificates')).toBe('/admin/certificates');
  });

  it.each(['https://evil.test', '//evil.test/student', '/student/../sign-in', '/student/%2e%2e/sign-in', '/student\\evil'])('rejects unsafe return target %s', async target => {
    const { safeReturnTarget } = await loadAuth();
    expect(safeReturnTarget(target)).toBe('/student');
  });

  it('validates email and password, and ignores duplicate pending submits', async () => {
    validEnv();
    const client = makeClient();
    let resolveSignIn!: (value: unknown) => void;
    client.auth.signInWithPassword.mockReturnValueOnce(new Promise(resolve => { resolveSignIn = resolve; }));
    const { AuthProvider, AuthPage, MemoryRouter } = await loadBoth();
    render(<AuthProvider client={client as unknown as SupabaseClient}><MemoryRouter><AuthPage mode="sign-in" /></MemoryRouter></AuthProvider>);
    const form = await waitFor(() => {
      const currentForm = document.querySelector('form');
      if (!currentForm) throw new Error('Auth form is still loading');
      return currentForm;
    });
    const email = form.querySelector('input[type="email"]')!;
    const password = form.querySelector('input[type="password"]')!;
    fireEvent.change(email, { target: { value: 'not-an-email' } });
    fireEvent.change(password, { target: { value: 'secret' } });
    await act(async () => { fireEvent.submit(form); });
    expect(screen.getByRole('alert').textContent).toContain('Enter a valid email address.');
    fireEvent.change(email, { target: { value: ' student@example.test ' } });
    await act(async () => { fireEvent.submit(form); fireEvent.submit(form); });
    expect(client.auth.signInWithPassword).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button').textContent).toContain('Please wait');
    await act(async () => { resolveSignIn({ data: { session: client.session }, error: null }); });
  });
});
