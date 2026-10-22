import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from '@/pages/ContactPage';
import TrainingPartnersPage from '@/pages/TrainingPartnersPage';
import NewsletterForm from '@/components/NewsletterForm';
const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from } }));
vi.mock('@/lib/siteConfig', () => ({ siteOrigin: undefined, enquiriesEnabled: false, enquiryUnavailable: 'Submissions are not available in this preview. Nothing has been sent.' }));
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
vi.mock('@/components/Reveal', () => ({ default: ({ children }: { children: React.ReactNode }) => children }));
afterEach(() => cleanup());
describe('unconfigured preview safety', () => {
  it('does not render contact or partnership forms when submissions are disabled', () => {
    const contact = render(<MemoryRouter><ContactPage /></MemoryRouter>);
    expect(contact.container.querySelector('form')).toBeNull();
    expect(screen.getByRole('heading', { name: /enquiry service unavailable/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /send message/i })).toBeNull();
    cleanup();
    const partners = render(<MemoryRouter><TrainingPartnersPage /></MemoryRouter>);
    expect(partners.container.querySelector('form')).toBeNull();
    expect(screen.getByRole('heading', { name: /enquiry service unavailable/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /submit partnership enquiry/i })).toBeNull();
    expect(from).not.toHaveBeenCalled();
    expect(screen.queryByText(/Message Sent|Enquiry Submitted/)).toBeNull();
  });

  it('blocks newsletter submission without loading a client or claiming success', () => {
    const { container } = render(<MemoryRouter><NewsletterForm /></MemoryRouter>);
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    const submit = form!.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submit?.disabled).toBe(true);
    fireEvent.submit(form!);
    expect(from).not.toHaveBeenCalled();
    expect(screen.queryByText(/subscribed successfully|thank you for subscribing/i)).toBeNull();
  });
});
