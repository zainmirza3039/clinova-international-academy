import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboardPage from '@/pages/StudentDashboardPage';

const state = vi.hoisted(() => ({
  auth: { enabled: false, status: 'ready', emailVerified: false, session: null as null | { user: { id: string; email?: string } } },
  signOut: vi.fn().mockResolvedValue({ error: null }),
  from: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock('@/auth/authContext', () => ({ useAuth: () => ({ ...state.auth, signOut: state.signOut }) }));
vi.mock('@/lib/supabase', () => ({ supabase: { from: state.from, rpc: state.rpc } }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));

function renderDashboard() { return render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>); }
afterEach(() => { cleanup(); vi.clearAllMocks(); state.signOut.mockResolvedValue({ error: null }); state.auth = { enabled: false, status: 'ready', emailVerified: false, session: null }; });

describe('candidate and learner portal gate', () => {
  it('shows distinct CPD and certification service states without displaying candidate records', () => {
    state.auth = { enabled: false, status: 'ready', emailVerified: false, session: { user: { id: 'user-1', email: 'learner@example.test' } } };
    const { container } = renderDashboard();
    expect(screen.getByRole('heading', { name: 'Account services are not connected' })).toBeTruthy();
    expect(screen.getByText('Signed in as learner@example.test')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'CPD system status' }).getAttribute('href')).toBe('/cpd-courses');
    expect(screen.getByRole('link', { name: 'Certification status' }).getAttribute('href')).toBe('/certification');
    expect(screen.getByText(/authentication, candidate data, course enrollment, examination, credential downloads and renewal reminders are disabled/i)).toBeTruthy();
    expect(container.querySelector('form,input,select,textarea,[download]')).toBeNull();
    expect(state.from).not.toHaveBeenCalled();
    expect(state.rpc).not.toHaveBeenCalled();
  });

  it('supports sign-out without enabling learner data access', () => {
    state.auth = { enabled: false, status: 'ready', emailVerified: false, session: { user: { id: 'user-1', email: 'learner@example.test' } } };
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(state.signOut).toHaveBeenCalledOnce();
    expect(state.from).not.toHaveBeenCalled();
    expect(state.rpc).not.toHaveBeenCalled();
  });

  it('does not show private identity when no session exists', () => {
    const { container } = renderDashboard();
    expect(screen.getByRole('heading', { name: 'Account services are not connected' })).toBeTruthy();
    expect(container.textContent).not.toContain('learner@example.test');
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull();
    expect(state.from).not.toHaveBeenCalled();
    expect(state.rpc).not.toHaveBeenCalled();
  });
});
