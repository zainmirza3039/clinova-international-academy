import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CertificationPage from '@/pages/CertificationPage';
import CertificationApplicationPage from '@/pages/CertificationApplicationPage';
import AssessmentPage from '@/pages/AssessmentPage';
import CertificateVerificationPage from '@/pages/CertificateVerificationPage';

const { from, rpc } = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from, rpc } }));
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; vi.clearAllMocks(); });
const renderPage = (page: React.ReactNode) => render(<MemoryRouter>{page}</MemoryRouter>);

describe('professional certification and CPD verification boundaries', () => {
  it('keeps professional certification separate from operational CPD completion certificates', () => {
    const { container } = renderPage(<CertificationPage />);
    expect(screen.getByRole('heading', { name: 'No certification scheme is open' })).toBeTruthy();
    expect(container.textContent).toMatch(/No professional certification scheme, candidate application, examination, competence decision or professional certification credential is currently open/i);
    expect(container.textContent).toMatch(/CPD certificate verification is available through the separate verification service/i);
    expect(container.textContent).not.toMatch(/UKAS accredited/i);
    expect(container.querySelector('form,input,[download]')).toBeNull();
    expect(from).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled();
  });

  it('keeps professional certification applications and assessment status-only', () => {
    const application = renderPage(<CertificationApplicationPage />);
    expect(application.container.textContent).toMatch(/applications are not open/i);
    expect(application.container.querySelector('form,input,textarea,[type="file"]')).toBeNull();
    cleanup();
    const assessment = renderPage(<AssessmentPage />);
    expect(screen.getByRole('heading', { name: 'No examination or OSCE is open' })).toBeTruthy();
    expect(assessment.container.textContent).toMatch(/not adopted requirements|no scoring or pass\/fail rule/i);
    expect(assessment.container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull();
    expect(from).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects a malformed verification code locally without calling the database', () => {
    renderPage(<CertificateVerificationPage />);
    const form = screen.getByRole('form', { name: 'Official CPD certificate lookup' });
    fireEvent.change(screen.getByLabelText('Certificate verification UUID'), { target: { value: 'CL-2026-0001' } });
    fireEvent.submit(form);
    expect(screen.getByRole('alert').textContent).toMatch(/complete verification UUID/i);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('checks a valid verification UUID through the restricted CPD certificate RPC', async () => {
    rpc.mockResolvedValue({ data: [{
      certificate_number: 'CL-CPD-2026-0001',
      learner_name: 'Alex Example',
      course_title: 'Clinical Assessment of Low Back Pain',
      issued_at: '2026-11-01T12:00:00Z',
      certificate_status: 'valid',
    }], error: null });
    renderPage(<CertificateVerificationPage />);
    fireEvent.change(screen.getByLabelText('Certificate verification UUID'), { target: { value: '11111111-1111-4111-8111-111111111111' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Official CPD certificate lookup' }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith('verify_cpd_certificate', { p_verification_code: '11111111-1111-4111-8111-111111111111' }));
    expect(await screen.findByRole('heading', { name: 'Certificate record found' })).toBeTruthy();
    expect(screen.getByText('CL-CPD-2026-0001')).toBeTruthy();
    expect(screen.getByText('Alex Example')).toBeTruthy();
    expect(screen.getByText('valid')).toBeTruthy();
  });
});
