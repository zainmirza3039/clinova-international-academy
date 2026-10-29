import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CertificationPage from '@/pages/CertificationPage';
import CertificateVerificationPage from '@/pages/CertificateVerificationPage';
import { publishedProgrammes } from '@/data/programmes';

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from } }));
vi.mock('@/hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderPage = (page: React.ReactNode) => render(<MemoryRouter>{page}</MemoryRouter>);

describe('certificate information and verification', () => {
  it('shows current certificate limitations and source-backed programme links', () => {
    const { container } = renderPage(<CertificationPage />);
    expect(screen.getByRole('heading', { name: 'Certificate information' })).toBeTruthy();
    expect(container.textContent).toMatch(/Public certificate services are unavailable/i);
    expect(container.textContent).toMatch(/do not define or confirm a certificate-eligibility or issuance process/i);
    expect(container.textContent).not.toMatch(/eligible to receive|certificate awarded|accredited by/i);

    for (const programme of publishedProgrammes) {
      expect(screen.getByRole('link', { name: programme.title }).getAttribute('href')).toBe(`/programmes/${programme.slug}`);
    }

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search programme guides' }), { target: { value: 'no-match-topic' } });
    expect(screen.getByRole('status').textContent).toBe('0 programme guides found');
    expect(screen.getByText(/No programme guides match your search/)).toBeTruthy();
    expect(from).not.toHaveBeenCalled();
  });

  it('shows a meaningful empty-source state when no published programmes exist', () => {
    const { container } = renderPage(<CertificationPage programmeRecords={[]} />);
    expect(screen.getByRole('status').textContent).toBe('No published programme guides are currently listed.');
    expect(screen.getByText('Programme details are not available in the current published catalogue.')).toBeTruthy();
    expect(container.querySelector('a[href^="/programmes/"]')).toBeNull();
  });

  it('validates a proposed code shape locally and reports that no verification occurred', () => {
    renderPage(<CertificateVerificationPage />);
    const form = screen.getByRole('form', { name: 'Live verification is not available yet' });
    const input = screen.getByRole('textbox', { name: 'Certificate verification code' }) as HTMLInputElement;

    fireEvent.submit(form);
    expect(screen.getByRole('alert').textContent).toBe('Enter a certificate code.');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    fireEvent.change(input, { target: { value: 'CL 2026/0001' } });
    fireEvent.submit(form);
    expect(screen.getByRole('alert').textContent).toMatch(/Use 1–64 letters, numbers, or hyphens/i);

    fireEvent.change(input, { target: { value: '  CL-2026-0001  ' } });
    fireEvent.submit(form);
    expect(input.value).toBe('CL-2026-0001');
    const status = screen.getByRole('status');
    expect(status.textContent).toMatch(/verification service is unavailable/i);
    expect(status.textContent).toMatch(/not checked\. Nothing was sent or stored/i);
    expect(status.textContent).not.toMatch(/verified|revoked|expired|not found/i);
    expect(from).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('clears certificate code, format errors, and unavailable status', () => {
    renderPage(<CertificateVerificationPage />);
    const input = screen.getByRole('textbox', { name: 'Certificate verification code' }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'bad code' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Live verification is not available yet' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(input.value).toBe('');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });
});
