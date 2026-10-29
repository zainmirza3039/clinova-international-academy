import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import StudentDashboardPage from '@/pages/StudentDashboardPage';

const { from, signOut } = vi.hoisted(() => ({ from: vi.fn(), signOut: vi.fn().mockResolvedValue({ error: null }) }));
vi.mock('@/auth/authContext', () => ({
  useAuth: () => ({
    session: { user: { id: 'student-test-id', email: 'student@example.test' } },
    signOut,
  }),
}));
vi.mock('@/lib/siteConfig', () => ({ learnerDataEnabled: false }));
vi.mock('@/lib/supabase', () => ({ supabase: { from } }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('student dashboard data gate', () => {
  it('keeps learner queries disabled and displays honest empty states by default', () => {
    render(<StudentDashboardPage />);
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeTruthy();
    expect(screen.getByText('student@example.test')).toBeTruthy();
    expect(screen.getByText('Profile details are not available yet.')).toBeTruthy();
    expect(screen.getByText('No enrolment information is available yet.')).toBeTruthy();
    expect(screen.getByText('Progress information will appear when an authorized record exists.')).toBeTruthy();
    expect(screen.getByText('No issued certificate records are available.')).toBeTruthy();
    expect(from).not.toHaveBeenCalled();
  });

  it('supports sign-out without enabling learner record queries', async () => {
    render(<StudentDashboardPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalledOnce();
    expect(from).not.toHaveBeenCalled();
  });
});
