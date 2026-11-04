import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '@/pages/AdminPage';

const state = vi.hoisted(() => ({
  auth: {
    enabled: true,
    status: 'ready' as 'ready' | 'disabled' | 'loading' | 'error',
    session: { user: { id: 'test-admin-id', email: 'admin@example.test', email_confirmed_at: '2026-11-01T00:00:00Z' as string | null, app_metadata: { role: 'student' as string } } },
    emailVerified: true,
    error: null as string | null,
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
}));
vi.mock('@/auth/authContext', () => ({ useAuth: () => state.auth }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));
vi.mock('@/components/CmsAdminWorkspace', () => ({ default: () => <div>CMS workflow workspace</div> }));
vi.mock('@/components/AdminLessonReviewPanel', () => ({ default: () => <div>Lesson review workspace</div> }));
vi.mock('@/components/AdminLearningWorkspacePanel', () => ({ default: ({ section }: { section: string }) => <div>{section} learning workspace</div> }));
vi.mock('@/components/AdminInquiryPanel', () => ({ default: () => <div>Private enquiry inbox</div> }));
vi.mock('@/components/AdminAuditPanel', () => ({ default: () => <div>Read-only audit history</div> }));
vi.mock('@/components/AccreditationPreparationPanel', () => ({ default: () => <div>Accreditation readiness panel</div> }));

afterEach(() => {
  cleanup();
  state.auth.enabled = true;
  state.auth.status = 'ready';
  state.auth.emailVerified = true;
  state.auth.session.user.email_confirmed_at = '2026-11-01T00:00:00Z';
  state.auth.session.user.app_metadata.role = 'student';
  vi.clearAllMocks();
});
const renderAdmin = () => render(<MemoryRouter><AdminPage /></MemoryRouter>);
const makeAdmin = () => { state.auth.session.user.app_metadata.role = 'admin'; };

describe('Clinova administrator workspace', () => {
  it('denies a signed-in student account', () => {
    renderAdmin();
    expect(screen.getByRole('heading', { name: 'Admin access denied' })).toBeTruthy();
  });

  it('requires verified email before showing administration tools', () => {
    makeAdmin();
    state.auth.emailVerified = false;
    state.auth.session.user.email_confirmed_at = null;
    renderAdmin();
    expect(screen.getByRole('heading', { name: 'Email verification required' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Admin sections' })).toBeNull();
  });

  it('shows the admin overview and connected operational modules', () => {
    makeAdmin();
    renderAdmin();
    expect(screen.getByRole('heading', { name: 'Clinova admin panel' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Admin overview' })).toBeTruthy();
    expect(screen.getByText('CPD catalogue')).toBeTruthy();
    expect(screen.getByText('Learner applications')).toBeTruthy();
    expect(screen.getByText('Instructor delivery')).toBeTruthy();
    expect(screen.getByText('CPD certificates')).toBeTruthy();
    expect(screen.getByText(/Private records are loaded only in the selected authorized workspace/i)).toBeTruthy();
  });

  it('opens the CMS and lesson publication workspace from their own sections', () => {
    makeAdmin();
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Content' }));
    expect(screen.getByRole('heading', { name: 'Content management system' })).toBeTruthy();
    expect(screen.getByText('CMS workflow workspace')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Courses' }));
    expect(screen.getByRole('heading', { name: 'Programme and CPD catalogue readiness' })).toBeTruthy();
    expect(screen.getByText('Lesson review workspace')).toBeTruthy();
  });

  it('renders all learner, faculty, enquiry, certificate and audit workspaces', () => {
    makeAdmin();
    renderAdmin();
    for (const [section, expected] of [
      ['Applications', 'Applications learning workspace'],
      ['Faculty', 'Faculty learning workspace'],
      ['Learners', 'Learners learning workspace'],
      ['Certificates', 'Certificates learning workspace'],
      ['Inquiries', 'Private enquiry inbox'],
      ['Reports & Audit', 'Read-only audit history'],
    ]) {
      fireEvent.click(screen.getByRole('button', { name: section }));
      expect(screen.getByText(expected)).toBeTruthy();
    }
  });

  it('does not invent events or enable professional certification and assessment workflows', () => {
    makeAdmin();
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Events' }));
    expect(screen.getByRole('heading', { name: 'Events and academic activities' })).toBeTruthy();
    expect(screen.getByText(/Event publishing is not yet connected to the CMS/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Professional Certification' }));
    expect(screen.getByRole('heading', { name: 'Professional certification governance' })).toBeTruthy();
    expect(screen.getByText('No scheme is approved or open')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Assessments' }));
    expect(screen.getByRole('heading', { name: 'Assessment operations' })).toBeTruthy();
  });

  it('keeps settings read-only and displays accreditation readiness separately', () => {
    makeAdmin();
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Accreditation' }));
    expect(screen.getByText('Accreditation readiness panel')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('heading', { name: 'Platform settings' })).toBeTruthy();
    expect(screen.getByText(/Sensitive keys, authentication policy and storage configuration remain in their protected service consoles/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /save settings|update configuration/i })).toBeNull();
  });
});
