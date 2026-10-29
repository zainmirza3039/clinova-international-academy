import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '@/pages/AdminPage';

const state = vi.hoisted(() => ({
  auth: {
    enabled: true,
    status: 'ready' as 'ready' | 'disabled' | 'loading' | 'error',
    session: { user: { id: 'test-user-id', email: 'student@example.test', app_metadata: { role: 'student' } } },
    error: null as string | null,
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn(),
}));
vi.mock('@/auth/AuthProvider', () => ({ useAuth: () => state.auth }));
vi.mock('@/lib/siteConfig', () => ({ learnerDataEnabled: false }));
vi.mock('@/lib/supabase', () => ({ supabase: { from: state.from } }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));

afterEach(() => {
  cleanup();
  state.auth.enabled = true;
  state.auth.status = 'ready';
  state.auth.session.user.app_metadata.role = 'student';
  vi.clearAllMocks();
});

describe('admin role and data gates', () => {
  it('denies a signed-in student and does not query private tables', () => {
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Admin access denied' })).toBeTruthy();
    expect(state.from).not.toHaveBeenCalled();
  });

  it('keeps database access disabled even for an admin claim until explicitly enabled', () => {
    state.auth.session.user.app_metadata.role = 'admin';
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Admin data access is disabled' })).toBeTruthy();
    expect(state.from).not.toHaveBeenCalled();
  });

  it('does not offer auth or records while authentication is disabled', () => {
    state.auth.enabled = false;
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Administration is not enabled' })).toBeTruthy();
    expect(state.from).not.toHaveBeenCalled();
  });
});
