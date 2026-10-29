import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from '@/pages/ContactPage';
import TrainingPartnersPage from '@/pages/TrainingPartnersPage';
import NewsletterForm from '@/components/NewsletterForm';

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from } }));
vi.mock('@/hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('public enquiry surfaces', () => {
  it.each([
    ['contact page', ContactPage],
    ['training partnerships page', TrainingPartnersPage],
    ['learning-library callout', NewsletterForm],
  ])('%s does not imply online submission is available', (_label, Component) => {
    const { container } = render(<MemoryRouter><Component /></MemoryRouter>);

    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('button[type="submit"]')).toBeNull();
    expect(container.textContent).not.toMatch(/submitted successfully|message sent|thank you for subscribing/i);
    expect(from).not.toHaveBeenCalled();
  });
});
