import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '@/pages/AdminPage';
import { isEnrollmentMarkedCompleted } from '@/lib/certificateEligibility';

const state = vi.hoisted(() => ({
  auth: {
    enabled: true,
    status: 'ready' as 'ready' | 'disabled' | 'loading' | 'error',
    session: { user: { id: 'test-user-id', email: 'student@example.test', email_confirmed_at: '2026-10-30T00:00:00Z' as string | null, app_metadata: { role: 'student' } } },
    emailVerified: true,
    error: null as string | null,
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  learnerDataEnabled: false,
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
}));
vi.mock('@/auth/authContext', () => ({ useAuth: () => state.auth }));
vi.mock('@/lib/siteConfig', () => ({ get learnerDataEnabled() { return state.learnerDataEnabled; } }));
vi.mock('@/lib/supabase', () => ({ supabase: { from: state.from } }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));

afterEach(() => {
  cleanup();
  state.auth.enabled = true;
  state.auth.status = 'ready';
  state.auth.emailVerified = true;
  state.auth.session.user.email_confirmed_at = '2026-10-30T00:00:00Z';
  state.auth.session.user.app_metadata.role = 'student';
  state.learnerDataEnabled = false;
  vi.clearAllMocks();
});

describe('admin role and data gates', () => {
  it('keeps the completed-status predicate separate from certificate eligibility or authorization', () => {
    expect(isEnrollmentMarkedCompleted('completed')).toBe(true);
    expect(isEnrollmentMarkedCompleted('pending')).toBe(false);
    expect(isEnrollmentMarkedCompleted('active')).toBe(false);
    expect(isEnrollmentMarkedCompleted('withdrawn')).toBe(false);
    expect(isEnrollmentMarkedCompleted(undefined)).toBe(false);
  });

  it('denies a signed-in student and does not query private tables', () => {
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Admin access denied' })).toBeTruthy();
    expect(state.from).not.toHaveBeenCalled();
  });

  it('requires a verified email before exposing admin tools or making queries', () => {
    state.auth.session.user.app_metadata.role = 'admin';
    state.auth.emailVerified = false;
    state.auth.session.user.email_confirmed_at = null;
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Email verification required' })).toBeTruthy();
    expect(state.from).not.toHaveBeenCalled();
  });

  it('renders the source-backed admin panel without querying private data', () => {
    state.auth.session.user.app_metadata.role = 'admin';
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Clinova admin panel' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Admin overview' })).toBeTruthy();
    expect(screen.getByText('Learning guides')).toBeTruthy();
    expect(screen.getByText('CPD courses')).toBeTruthy();
    expect(screen.getByText('Educational articles')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('no separately authorized server-side path is connected');
    expect(state.from).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Courses' }));
    expect(screen.getByRole('heading', { name: 'Courses and learning guides' })).toBeTruthy();
    expect(screen.getAllByRole('status').some(status => status.textContent?.includes('24 of 24 courses shown'))).toBe(true);
  });

  it('keeps applications and inquiries unavailable without a submission backend', () => {
    state.auth.session.user.app_metadata.role = 'admin';
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Applications' }));
    expect(screen.getByRole('heading', { name: 'Application management is unavailable' })).toBeTruthy();
    expect(screen.getByText(/no connected application submission store/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Inquiries' }));
    expect(screen.getByRole('heading', { name: 'Inquiry management is unavailable' })).toBeTruthy();
    expect(screen.getByText(/No inquiry records are available/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /create|save|submit|issue|revoke/i })).toBeNull();
    expect(state.from).not.toHaveBeenCalled();
  });

  it('shows source-backed article search and honest empty events/faculty and settings states', () => {
    state.auth.session.user.app_metadata.role = 'admin';
    render(<MemoryRouter><AdminPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Content' }));
    expect(screen.getByRole('heading', { name: 'Educational content' })).toBeTruthy();
    expect(screen.getAllByRole('status').some(status => status.textContent?.includes('15 of 15 articles shown'))).toBe(true);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search articles' }), { target: { value: 'no-matching-article' } });
    expect(screen.getAllByRole('status').some(status => status.textContent?.includes('0 of 15 articles shown'))).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Events' }));
    expect(screen.getByRole('heading', { name: 'No confirmed events are available' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Faculty' }));
    expect(screen.getByRole('heading', { name: 'No verified faculty profiles are available' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy();
    expect(screen.getByText(/cannot be changed from this panel/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /save|update|delete|publish/i })).toBeNull();
    expect(state.from).not.toHaveBeenCalled();
  });

  it('never queries broad learner or certificate tables from the browser admin page', () => {
    state.auth.session.user.app_metadata.role = 'admin';
    state.learnerDataEnabled = true;
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Certificates' }));
    expect(screen.getByRole('heading', { name: 'Certificate access and issuance are unavailable' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /issue|revoke/i })).toBeNull();
    expect(screen.queryByLabelText('Certificate number')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Learners' }));
    expect(screen.getByRole('heading', { name: 'Learner record access is unavailable' })).toBeTruthy();
    expect(screen.queryByText(/Example completed guide|Example active guide/)).toBeNull();
    expect(state.from).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
    expect(state.update).not.toHaveBeenCalled();
    expect(state.upsert).not.toHaveBeenCalled();
  });

  it('does not offer auth or records while authentication is disabled', () => {
    state.auth.enabled = false;
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Administration is not enabled' })).toBeTruthy();
    expect(state.from).not.toHaveBeenCalled();
  });
});
