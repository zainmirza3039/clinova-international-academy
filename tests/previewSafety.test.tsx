import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
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
  it.each([ContactPage, NewsletterForm])('does not expose a submission form or claim success', (Page) => {
    const { container } = render(<MemoryRouter><Page /></MemoryRouter>);
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('button[type="submit"]')).toBeNull();
    expect(container.textContent).not.toMatch(/submitted successfully|message sent|thank you for subscribing/i);
    expect(from).not.toHaveBeenCalled();
  });

  it('presents the registered virtual office and optional secondary phone without implying a public venue', () => {
    const { container } = render(<MemoryRouter><ContactPage /></MemoryRouter>);
    const content = container.textContent ?? '';

    expect(content).toContain('1 Unity St, Bristol BS1 5HH, United Kingdom');
    expect(content).toContain('Registered office (virtual address)');
    expect(content).toContain('Not a campus, visiting location, or public-facing venue.');
    expect(content).toContain('No verified public email address or online enquiry submission is available.');
    expect(content).toContain('Optional secondary phone · Pakistan local agent');
    expect(content).toContain('0306-9633353');
    expect(content.indexOf('Registered office (virtual address)')).toBeLessThan(content.indexOf('Optional secondary phone · Pakistan local agent'));
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(container.querySelector('a[href*="whatsapp"], a[href*="wa.me"]')).toBeNull();
    expect(container.querySelector('a[href^="tel:"]')?.getAttribute('href')).toBe('tel:03069633353');
    expect(container.querySelector('form')).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it('exposes only the named local partnership draft validator, not an online submission', () => {
    const { container } = render(<MemoryRouter><TrainingPartnersPage /></MemoryRouter>);
    expect(container.querySelector('form')?.getAttribute('aria-labelledby')).toBe('collaboration-draft-heading');
    expect(container.querySelector('button[type="submit"]')?.textContent?.trim()).toBe('Validate draft only');
    expect(container.textContent).toMatch(/does not contact a server, send an enquiry, or save your details/i);
    expect(container.textContent).toMatch(/No written submission has been received/i);
    expect(container.textContent).not.toMatch(/submitted successfully|message sent|reference number/i);
    expect(from).not.toHaveBeenCalled();
  });
});
