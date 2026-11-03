import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CertificationPage from '@/pages/CertificationPage';
import CertificationApplicationPage from '@/pages/CertificationApplicationPage';
import AssessmentPage from '@/pages/AssessmentPage';
import CertificateVerificationPage from '@/pages/CertificateVerificationPage';

const { from, rpc } = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from, rpc } }));
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; vi.clearAllMocks(); });
const renderPage = (page: React.ReactNode) => render(<MemoryRouter>{page}</MemoryRouter>);

describe('draft-only certification and verification', () => {
  it('shows no scheme, invented profession-specific titles, eligibility rules or accreditation claim', () => {
    const { container } = renderPage(<CertificationPage />);
    expect(screen.getByRole('heading', { name: 'No certification scheme is open' })).toBeTruthy();
    expect(container.textContent).toMatch(/no candidate applications, examinations, assessments, certification decisions, credential issuance or live verification/i);
    expect(container.textContent).toMatch(/no claim of UKAS accreditation/i);
    expect(container.textContent).toContain('Governance and impartiality');
    expect(container.textContent).toContain('Independent certification decisions');
    expect(container.textContent).not.toMatch(/Musculoskeletal Physiotherapy Assessment|Medical practice certification|Nursing certification/i);
    expect(container.querySelector('form,input,[download]')).toBeNull();
    expect(from).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled();
  });
  it('keeps certification applications and assessment guidance as status-only pages', () => {
    const application = renderPage(<CertificationApplicationPage />);
    expect(application.container.textContent).toMatch(/applications are not open/i);
    expect(application.container.querySelector('form,input,textarea,[type="file"]')).toBeNull(); cleanup();
    const assessment = renderPage(<AssessmentPage />);
    expect(screen.getByRole('heading', { name: 'No examination or OSCE is open' })).toBeTruthy();
    expect(assessment.container.textContent).toMatch(/not adopted requirements|no scoring or pass\/fail rule/i);
    expect(assessment.container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull();
    expect(from).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled();
  });
  it('validates a code shape locally while clearly reporting that no live verification occurred', () => {
    renderPage(<CertificateVerificationPage />);
    const form = screen.getByRole('form', { name: 'Live verification is not available' });
    const input = screen.getByRole('textbox', { name: 'Credential code' }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'CL-2026-0001' } }); fireEvent.submit(form);
    expect(screen.getByRole('status').textContent).toMatch(/verification service is unavailable/i);
    expect(screen.getByRole('status').textContent).toMatch(/not checked\. Nothing was sent or stored/i);
    expect(from).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled(); expect(localStorage.length).toBe(0);
  });
});
