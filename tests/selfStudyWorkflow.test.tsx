import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';
import { getCPDCurriculum } from '@/data/cpdCurricula';
import { selfStudyLessonKey } from '@/lib/selfStudyLearning';

const mocks = vi.hoisted(() => ({
  enabled: true,
  auth: null as null | { enabled: boolean; status: string; emailVerified: boolean; session: null | { user: { id: string } } },
  loadProgress: vi.fn(),
  enroll: vi.fn(),
  markRead: vi.fn(),
}));

vi.mock('@/auth/authContext', () => ({ useOptionalAuth: () => mocks.auth }));
vi.mock('@/lib/siteConfig', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/siteConfig')>();
  return { ...actual, get selfStudyLearningEnabled() { return mocks.enabled; } };
});
vi.mock('@/lib/selfStudyLearning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/selfStudyLearning')>();
  return {
    ...actual,
    loadSelfStudyCourseProgress: (...args: unknown[]) => mocks.loadProgress(...args),
    enrollInSelfStudyCourse: (...args: unknown[]) => mocks.enroll(...args),
    markSelfStudyLessonRead: (...args: unknown[]) => mocks.markRead(...args),
  };
});

const courseSlug = 'clinical-communication-skills';
const emptyProgress = {
  courseSlug,
  enrollmentId: null,
  enrolledAt: null,
  completedLessonKeys: [],
  completedLessons: 0,
  totalLessons: 6,
};
const enrolledProgress = {
  ...emptyProgress,
  enrollmentId: 'enrollment-1',
  enrolledAt: '2026-10-30T12:00:00Z',
};
const readKey = 'foundations-of-safe-communication/prepare-the-conversation';
const readProgress = {
  ...enrolledProgress,
  completedLessonKeys: [readKey],
  completedLessons: 1,
};

function renderCourse(path = `/cpd-courses/${courseSlug}`) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes>
    </MemoryRouter>,
  );
}

function setAuth(session: null | { user: { id: string } } = { user: { id: 'learner-a' } }, emailVerified = true) {
  mocks.auth = { enabled: true, status: 'ready', emailVerified, session };
}

afterEach(() => {
  cleanup();
  document.head.innerHTML = '';
  mocks.enabled = true;
  mocks.auth = null;
  mocks.loadProgress.mockReset();
  mocks.enroll.mockReset();
  mocks.markRead.mockReset();
});

describe('authenticated self-study course workflow', () => {
  it('keeps enrollment and progress disabled when the feature flag is off', () => {
    mocks.enabled = false;
    setAuth();
    renderCourse();
    expect(screen.getByText(/not enabled in this build/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /enroll/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /mark as read/i })).toBeNull();
    expect(mocks.loadProgress).not.toHaveBeenCalled();
  });

  it('routes a signed-out learner safely back to the course after sign-in', () => {
    setAuth(null);
    renderCourse();
    const link = screen.getByRole('link', { name: /sign in or create an account/i });
    expect(link.getAttribute('href')).toBe(`/sign-in?returnTo=${encodeURIComponent(`/cpd-courses/${courseSlug}`)}`);
    expect(mocks.loadProgress).not.toHaveBeenCalled();
  });

  it('does not request learner records for a session that has not verified its email', () => {
    setAuth({ user: { id: 'unverified-learner' } }, false);
    renderCourse();
    expect(screen.getByRole('link', { name: /sign in or create an account/i })).toBeTruthy();
    expect(mocks.loadProgress).not.toHaveBeenCalled();
    expect(mocks.enroll).not.toHaveBeenCalled();
    expect(mocks.markRead).not.toHaveBeenCalled();
  });

  it('enrolls idempotently and records per-lesson reading markers through the RPC layer', async () => {
    setAuth();
    mocks.loadProgress
      .mockResolvedValueOnce(emptyProgress)
      .mockResolvedValueOnce(enrolledProgress)
      .mockResolvedValueOnce(readProgress);
    mocks.enroll.mockResolvedValue(undefined);
    mocks.markRead.mockResolvedValue('2026-10-30T12:05:00Z');
    const { container } = renderCourse();

    const enrollButton = await screen.findByRole('button', { name: 'Enroll for self-study reading' });
    fireEvent.click(enrollButton);
    await waitFor(() => expect(mocks.enroll).toHaveBeenCalledWith(courseSlug));
    await waitFor(() => expect(screen.getByText(/0 of 6/)).toBeTruthy());
    container.querySelectorAll('details').forEach((detail) => { (detail as HTMLDetailsElement).open = true; });
    const markButtons = await screen.findAllByRole('button', { name: 'Mark as read' });
    expect(markButtons).toHaveLength(6);

    const curriculum = getCPDCurriculum(courseSlug)!;
    const expectedKey = selfStudyLessonKey(curriculum.modules[0].title, curriculum.modules[0].lessons[0].title);
    fireEvent.click(markButtons[0]);
    await waitFor(() => expect(mocks.markRead).toHaveBeenCalledWith(courseSlug, expectedKey));
    expect(await screen.findByText(/marked as read in your account/i)).toBeTruthy();
    expect(screen.getByText(/1 of 6/)).toBeTruthy();
  });
});
