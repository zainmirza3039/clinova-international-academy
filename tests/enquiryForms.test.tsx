import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from '@/pages/ContactPage';
import TrainingPartnersPage from '@/pages/TrainingPartnersPage';
import NewsletterForm from '@/components/NewsletterForm';

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from } }));
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
vi.mock('@/hooks/useSEO', () => ({ useSEO: vi.fn() }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });
const renderPage = (Component: React.ComponentType) => render(<MemoryRouter><Component /></MemoryRouter>);

describe('public submission release gates', () => {
  it('does not expose or submit a public contact form while enquiries are disabled', () => {
    const { container } = renderPage(ContactPage);
    expect(container.querySelector('form')).toBeNull();
    expect(container.textContent).toMatch(/No verified public email address or online enquiry submission is available/i);
    expect(from).not.toHaveBeenCalled();
  });

  it('keeps partnership draft checking local and never sends or stores the draft', () => {
    const { container } = renderPage(TrainingPartnersPage);
    expect(container.querySelector('form')?.getAttribute('aria-labelledby')).toBe('collaboration-draft-heading');
    expect(screen.getByRole('button', { name: 'Validate draft only' })).toBeTruthy();
    expect(container.textContent).toMatch(/does not contact a server, send an enquiry, or save your details/i);
    expect(container.textContent).toMatch(/No written submission has been received/i);
    expect(from).not.toHaveBeenCalled();
    fireEvent.submit(container.querySelector('form')!);
    expect(from).not.toHaveBeenCalled();
  });

  it('keeps newsletter signup as navigation rather than an inactive submission form', () => {
    const { container } = renderPage(NewsletterForm);
    expect(container.querySelector('form')).toBeNull();
    expect(screen.getByRole('link', { name: /Browse resources/i }).getAttribute('href')).toBe('/resources');
    expect(screen.getByRole('link', { name: /Contact information/i }).getAttribute('href')).toBe('/contact');
    expect(from).not.toHaveBeenCalled();
  });
});
