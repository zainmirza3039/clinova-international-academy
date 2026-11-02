import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboardPage from '@/pages/StudentDashboardPage';

const { mocks, from, rpc, signOut } = vi.hoisted(() => ({
  mocks: {
    learnerDataEnabled: false,
    selfStudyLearningEnabled: false,
    auth: {
      enabled: true as boolean,
      status: 'ready' as string,
      emailVerified: true as boolean,
      session: { user: { id: 'student-test-id', email: 'student@example.test' } } as null | { user: { id: string; email?: string } },
    },
  },
  from: vi.fn(),
  rpc: vi.fn(),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock('@/auth/authContext', () => ({
  useAuth: () => ({ ...mocks.auth, signOut }),
  useOptionalAuth: () => mocks.auth,
}));
vi.mock('@/lib/siteConfig', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/siteConfig')>();
  return {
    ...actual,
    get learnerDataEnabled() { return mocks.learnerDataEnabled; },
    get selfStudyLearningEnabled() { return mocks.selfStudyLearningEnabled; },
  };
});
vi.mock('@/lib/supabase', () => ({ supabase: { from, rpc } }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));

function setAuth(patch: Partial<typeof mocks.auth> = {}) {
  mocks.auth = {
    enabled: true,
    status: 'ready',
    emailVerified: true,
    session: { user: { id: 'student-test-id', email: 'student@example.test' } },
    ...patch,
  };
}

function renderDashboard() {
  return render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  rpc.mockReset();
  from.mockReset();
  signOut.mockReset().mockResolvedValue({ error: null });
  mocks.learnerDataEnabled = false;
  mocks.selfStudyLearningEnabled = false;
  setAuth();
});

describe('student dashboard data gate', () => {
  it('keeps learner queries disabled by default and displays honest empty/disabled states', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeTruthy();
    expect(screen.getByText('student@example.test')).toBeTruthy();
    expect(screen.getByText('Profile details are not available yet.')).toBeTruthy();
    expect(screen.getByText('Self-study enrollment and reading progress are not available in this build.')).toBeTruthy();
    expect(screen.getByText('No enrolment information is available yet.')).toBeTruthy();
    expect(screen.getByText('Progress information will appear when an authorized record exists.')).toBeTruthy();
    expect(screen.getByText('No issued certificate records are available.')).toBeTruthy();
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('supports sign-out without enabling learner record queries', async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalledOnce();
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('never requests learner records while signed out', async () => {
    mocks.learnerDataEnabled = true;
    mocks.selfStudyLearningEnabled = true;
    setAuth({ session: null });
    renderDashboard();
    expect(await screen.findByText('A verified learner session is required to view self-study courses.')).toBeTruthy();
    await waitFor(() => {
      expect(from).not.toHaveBeenCalled();
      expect(rpc).not.toHaveBeenCalled();
    });
  });

  it('never requests learner records for an unverified email', async () => {
    mocks.learnerDataEnabled = true;
    mocks.selfStudyLearningEnabled = true;
    setAuth({ emailVerified: false });
    renderDashboard();
    expect(await screen.findByText('A verified learner session is required to view self-study courses.')).toBeTruthy();
    await waitFor(() => {
      expect(from).not.toHaveBeenCalled();
      expect(rpc).not.toHaveBeenCalled();
    });
  });

  it('waits for auth readiness before requesting any learner records', async () => {
    mocks.learnerDataEnabled = true;
    mocks.selfStudyLearningEnabled = true;
    setAuth({ status: 'loading' });
    renderDashboard();
    expect(await screen.findByText('Checking your learner session…')).toBeTruthy();
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('shows a loading state and renders enrolled course counts and progress from the owner-scoped RPC', async () => {
    mocks.selfStudyLearningEnabled = true;
    let resolveRpc!: (value: unknown) => void;
    rpc.mockImplementation(() => new Promise(resolve => { resolveRpc = resolve; }));
    renderDashboard();

    expect(await screen.findByText('Loading your self-study courses…')).toBeTruthy();
    expect(rpc).toHaveBeenCalledWith('get_my_self_study_enrollments');
    await waitFor(() => expect(rpc).toHaveBeenCalledOnce());

    resolveRpc({
      data: [{
        course_slug: 'quality-improvement-in-healthcare',
        course_title: 'Quality Improvement in Healthcare',
        enrolled_at: '2026-10-30T12:00:00Z',
        completed_lessons: 1,
        total_lessons: 4,
      }],
      error: null,
    });

    const courseLink = await screen.findByRole('link', { name: 'Quality Improvement in Healthcare' });
    expect(courseLink.getAttribute('href')).toBe('/cpd-courses/quality-improvement-in-healthcare');
    expect(screen.getByText('1 of 4 lessons marked as read')).toBeTruthy();
    expect(screen.getByText('25% of listed lessons marked as read')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Quality Improvement in Healthcare reading progress' }).getAttribute('aria-valuenow')).toBe('25');
    expect(screen.queryByText(/course completed/i)).toBeNull();
  });

  it('shows an honest empty state and a safe link to browse courses', async () => {
    mocks.selfStudyLearningEnabled = true;
    rpc.mockResolvedValue({ data: [], error: null });
    renderDashboard();

    expect(await screen.findByText(/No self-study enrollments are available for this account yet\./)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Browse self-study courses' }).getAttribute('href')).toBe('/cpd-courses');
    expect(rpc).toHaveBeenCalledWith('get_my_self_study_enrollments');
  });

  it('renders a useful error state when the enrollment RPC fails', async () => {
    mocks.selfStudyLearningEnabled = true;
    rpc.mockResolvedValue({ data: null, error: new Error('RPC unavailable') });
    renderDashboard();

    expect((await screen.findByRole('alert')).textContent).toContain('Your self-study courses could not be loaded. Please try again.');
    expect(rpc).toHaveBeenCalledWith('get_my_self_study_enrollments');
  });
});
