import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
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
  markLessonProgress: vi.fn(),
  updateStudentProfile: vi.fn(),
  createSignedCourseResourceUrl: vi.fn(),
}));
vi.mock('@/auth/authContext', () => ({ useAuth: () => state.auth }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));
vi.mock('@/lib/learning', () => ({
  fetchStudentWorkspace: state.fetchStudentWorkspace,
  markLessonProgress: state.markLessonProgress,
  updateStudentProfile: state.updateStudentProfile,
  createSignedCourseResourceUrl: state.createSignedCourseResourceUrl,
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('learner workspace release gate', () => {
  it('does not load learner records, lessons or progress while learner services are disabled', () => {
    render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Learner services are not enabled' })).toBeTruthy();
    expect(screen.getByText(/does not load learner records, lesson content, profile data or progress/i)).toBeTruthy();
    expect(state.fetchStudentWorkspace).not.toHaveBeenCalled();
    expect(state.markLessonProgress).not.toHaveBeenCalled();
    expect(state.updateStudentProfile).not.toHaveBeenCalled();
    expect(state.createSignedCourseResourceUrl).not.toHaveBeenCalled();
  });
});
