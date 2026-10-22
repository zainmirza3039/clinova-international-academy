import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CertificateVerificationPage from '@/pages/CertificateVerificationPage';
import { ResourceDetailPage } from '@/pages/ResourcesPage';
import { publishedNewsItems } from '@/data/content';
import { programmes, reviewProgrammes, publishedProgrammes, getProgrammeBySlug } from '@/data/programmes';

const mocks = vi.hoisted(() => ({ enabled: false, from: vi.fn(), maybeSingle: vi.fn() }));
vi.mock('@/lib/siteConfig', () => ({ get verificationEnabled() { return mocks.enabled; } }));
vi.mock('@/lib/supabase', () => ({ supabase: { from: mocks.from } }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => { cleanup(); mocks.enabled = false; vi.clearAllMocks(); });

describe('reconciled current-main functionality', () => {
  it('keeps certificate verification unavailable with no input or request by default', () => {
    const { container } = render(<MemoryRouter><CertificateVerificationPage /></MemoryRouter>);
    expect(container.textContent).toMatch(/unavailable/i);
    expect(container.querySelector('form,input')).toBeNull();
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('retains the bounded public certificate lookup behind its separate approval gate', async () => {
    mocks.enabled = true;
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    const eq = vi.fn(() => ({ maybeSingle: mocks.maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    mocks.from.mockReturnValue({ select });
    render(<MemoryRouter><CertificateVerificationPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Certificate ID'), { target: { value: 'cia-test-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify Certificate' }));
    await waitFor(() => expect(mocks.maybeSingle).toHaveBeenCalledOnce());
    expect(mocks.from).toHaveBeenCalledWith('public_certificates');
    expect(select).toHaveBeenCalledWith('certificate_id, holder_name, course_title, issue_date, cpd_hours, status');
    expect(eq).toHaveBeenCalledWith('certificate_id', 'CIA-TEST-123');
  });
  it('keeps review drafts in source control but blocks public detail lookup until publication', () => {
    expect(reviewProgrammes).toHaveLength(programmes.length);
    expect(publishedProgrammes).toHaveLength(0);
    for (const programme of reviewProgrammes) expect(getProgrammeBySlug(programme.slug)).toBeUndefined();
  });
  it.each(publishedNewsItems)('keeps the main article route $slug available as an editorial review snapshot', article => {
    const { container } = render(<MemoryRouter initialEntries={[`/resources/${article.slug}`]}><Routes><Route path="/resources/:slug" element={<ResourceDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: article.title })).toBeTruthy();
    expect(container.textContent).toContain(article.sections[0].paragraphs[0]);
    expect(container.textContent).toContain('Not clinically approved or published.');
  });
});
