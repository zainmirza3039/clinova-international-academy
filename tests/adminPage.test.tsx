import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '@/pages/AdminPage';

const state = vi.hoisted(() => ({
  auth: {
    enabled: true,
    status: 'ready' as 'ready' | 'disabled' | 'loading' | 'error',
    session: { user: { id: 'test-user-id', email: 'student@example.test', email_confirmed_at: '2026-10-30T00:00:00Z' as string | null, app_metadata: { role: 'student' as string } } },
    emailVerified: true,
    error: null as string | null,
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn(), insert: vi.fn(), update: vi.fn(), upsert: vi.fn(), rpc: vi.fn(),
}));
vi.mock('@/auth/authContext', () => ({ useAuth: () => state.auth }));
vi.mock('@/lib/supabase', () => ({ supabase: { from: state.from, rpc: state.rpc } }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));
afterEach(() => { cleanup(); state.auth.enabled = true; state.auth.status = 'ready'; state.auth.emailVerified = true; state.auth.session.user.email_confirmed_at = '2026-10-30T00:00:00Z'; state.auth.session.user.app_metadata.role = 'student'; vi.clearAllMocks(); });
const renderAdmin = () => render(<MemoryRouter><AdminPage /></MemoryRouter>);

function expectNoDatabaseOperations() {
  expect(state.from).not.toHaveBeenCalled(); expect(state.rpc).not.toHaveBeenCalled();
  expect(state.insert).not.toHaveBeenCalled(); expect(state.update).not.toHaveBeenCalled(); expect(state.upsert).not.toHaveBeenCalled();
}

describe('admin role and data gates', () => {
  it('denies a signed-in student without querying private tables', () => {
    renderAdmin(); expect(screen.getByRole('heading', { name: 'Admin access denied' })).toBeTruthy(); expectNoDatabaseOperations();
  });
  it('requires a verified email before exposing admin tools or making queries', () => {
    state.auth.session.user.app_metadata.role = 'admin'; state.auth.emailVerified = false; state.auth.session.user.email_confirmed_at = null;
    renderAdmin(); expect(screen.getByRole('heading', { name: 'Email verification required' })).toBeTruthy(); expectNoDatabaseOperations();
  });
  it('renders a source-backed, read-only status panel and withholds legacy course rows', () => {
    state.auth.session.user.app_metadata.role = 'admin'; renderAdmin();
    expect(screen.getByRole('heading', { name: 'Clinova admin panel' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Admin overview' })).toBeTruthy();
    expect(screen.getByText('CPD courses approved')).toBeTruthy();
    expect(screen.getByText('Enrollment')).toBeTruthy();
    expect(screen.getByText('Certification schemes')).toBeTruthy();
    expect(screen.getByText('Credentials issued')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/new learner, progress, application, assessment, credential and accreditation records are disabled/i);
    fireEvent.click(screen.getByRole('button', { name: 'Courses' }));
    expect(screen.getByRole('heading', { name: 'Programme and CPD catalogue readiness' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Enrollment remains disabled' })).toBeTruthy();
    expectNoDatabaseOperations();
  });
  it('keeps applications and inquiries unavailable without a submission backend', () => {
    state.auth.session.user.app_metadata.role = 'admin'; renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Applications' }));
    expect(screen.getByRole('heading', { name: 'Applications' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'No application management service is connected' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Inquiries' }));
    expect(screen.getByRole('heading', { name: 'Inquiry management is unavailable' })).toBeTruthy();
    expect(screen.getByText(/no inquiry records are available/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /create|save|submit|issue|revoke/i })).toBeNull(); expectNoDatabaseOperations();
  });
  it('shows repository articles read-only and honest empty events/faculty and settings states', () => {
    state.auth.session.user.app_metadata.role = 'admin'; renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Content' }));
    expect(screen.getByRole('heading', { name: 'Educational content' })).toBeTruthy();
    expect(screen.getAllByRole('status').some(node => node.textContent?.includes('15 of 15 articles shown'))).toBe(true);
    expect(screen.getByText(/CMS queries and workflow actions are disabled in source/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Events' })); expect(screen.getByRole('heading', { name: 'No confirmed events are available' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Faculty' })); expect(screen.getByRole('heading', { name: 'No verified faculty profiles are available' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Accreditation' })); expect(screen.getByText(/no accreditation claim or symbol is authorised/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Settings' })); expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy();
    expect(screen.getByText(/cannot be changed from this panel/i)).toBeTruthy(); expect(screen.queryByRole('button', { name: /save|update|delete|publish/i })).toBeNull(); expectNoDatabaseOperations();
  });
  it('does not query learner or credential records from the browser admin page', () => {
    state.auth.session.user.app_metadata.role = 'admin'; renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Certificates' }));
    expect(screen.getByRole('heading', { name: 'Credential register and controls' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Issuance, revocation and public lookup are disabled' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /issue|revoke/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Learners' }));
    expect(screen.getByRole('heading', { name: 'Learner record access is unavailable' })).toBeTruthy(); expectNoDatabaseOperations();
  });
  it('does not offer auth or records while authentication is disabled', () => {
    state.auth.enabled = false; renderAdmin();
    expect(screen.getByRole('heading', { name: 'Administration is not enabled' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Secure setup required' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/no sign-in is offered/i); expectNoDatabaseOperations();
  });
});
