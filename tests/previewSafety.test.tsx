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
afterEach(cleanup);
describe('unconfigured preview safety', () => {
  it.each([ContactPage, TrainingPartnersPage, NewsletterForm])('blocks submissions without loading a client or claiming success', (Page) => {
    const { container } = render(<MemoryRouter><Page /></MemoryRouter>);
    const form = container.querySelector('form')!;
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submit.disabled).toBe(true);
    fireEvent.submit(form);
    expect(screen.getByRole('alert').textContent).toContain('Nothing has been sent');
    expect(from).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).toBeNull();
  });
});
