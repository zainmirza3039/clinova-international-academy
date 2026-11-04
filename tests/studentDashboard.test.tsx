import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboardPage from '@/pages/StudentDashboardPage';

const state = vi.hoisted(() => ({
  auth: {
    enabled: true,
    status: 'ready',
    emailVerified: true,
    session: { user: { id: 'learner-1', email: 'learner@example.test' } },
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  fetchStudentWorkspace: vi.fn(),
  markLessonProgress: vi.fn().mockResolvedValue(undefined),
  updateStudentProfile: vi.fn().mockResolvedValue(undefined),
  createSignedCourseResourceUrl: vi.fn().mockResolvedValue('https://example.test/signed-resource'),
}));
vi.mock('@/auth/authContext', () => ({ useAuth: () => state.auth }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));
vi.mock('@/lib/learning', () => ({
  fetchStudentWorkspace: state.fetchStudentWorkspace,
  markLessonProgress: state.markLessonProgress,
  updateStudentProfile: state.updateStudentProfile,
  createSignedCourseResourceUrl: state.createSignedCourseResourceUrl,
}));

const pendingWorkspace = {
  profile: { full_name: 'Alex Learner', professional_title: 'DPT', institution: 'Teaching Hospital', country: 'Pakistan' },
  enrollments: [{ id: 'enrol-1', course_item_id: 'course-1', student_id: 'learner-1', enrollment_status: 'applied', applied_at: '2026-11-01T10:00:00Z', course: { id: 'course-1', title: 'Clinical Assessment of Low Back Pain', description: 'Instructor-led CPD programme.' } }],
  lessons: [],
  sessions: [],
  progress: [],
  certificates: [],
};
const activeWorkspace = {
  ...pendingWorkspace,
  enrollments: [{ ...pendingWorkspace.enrollments[0], enrollment_status: 'active' }],
  lessons: [{ id: 'lesson-1', course_item_id: 'course-1', title: 'Initial clinical assessment', summary: 'History and examination.', content_markdown: 'Review the clinical history and examination.', resource_path: null, sequence_number: 1 }],
};

function renderDashboard() { return render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>); }

beforeEach(() => {
  state.fetchStudentWorkspace.mockReset().mockResolvedValue(pendingWorkspace);
  state.markLessonProgress.mockReset().mockResolvedValue(undefined);
  state.updateStudentProfile.mockReset().mockResolvedValue(undefined);
  state.createSignedCourseResourceUrl.mockReset().mockResolvedValue('https://example.test/signed-resource');
  state.auth.signOut.mockReset().mockResolvedValue({ error: null });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('authenticated learner workspace', () => {
  it('shows pending CPD applications instead of hiding them from My programmes', async () => {
    renderDashboard();
    expect(await screen.findByRole('heading', { name: 'Welcome to your learning space' })).toBeTruthy();
    expect(screen.getByText('Applications pending')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'My programmes' }));
    expect(screen.getByRole('heading', { name: 'Clinical Assessment of Low Back Pain' })).toBeTruthy();
    expect(screen.getByText('Your application is awaiting administrator review.')).toBeTruthy();
    expect(state.fetchStudentWorkspace).toHaveBeenCalledWith('learner-1');
  });

  it('loads lesson content and sends learner progress changes to the learning service', async () => {
    state.fetchStudentWorkspace.mockResolvedValue(activeWorkspace);
    renderDashboard();
    fireEvent.click(await screen.findByRole('button', { name: 'My programmes' }));
    expect(screen.getByText('Initial clinical assessment')).toBeTruthy();
    fireEvent.click(screen.getByText('Read lesson content'));
    expect(screen.getByText('Review the clinical history and examination.')).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(state.markLessonProgress).toHaveBeenCalledWith('learner-1', 'enrol-1', 'lesson-1', true));
  });

  it('signs out through the authenticated session provider', async () => {
    renderDashboard();
    await screen.findByRole('heading', { name: 'Welcome to your learning space' });
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(state.auth.signOut).toHaveBeenCalledOnce());
  });
});
