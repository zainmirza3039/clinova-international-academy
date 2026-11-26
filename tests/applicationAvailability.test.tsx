import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApplicationPage from '@/pages/ApplicationPage';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => { throw new Error('Application information must not access private records.'); }),
    rpc: vi.fn(() => { throw new Error('Application information must not call privileged services.'); }),
  },
}));

afterEach(() => {
  cleanup();
  document.head.innerHTML = '';
  vi.clearAllMocks();
});

describe('application availability boundary', () => {
  it('clearly states that applications and enrolment are unavailable', () => {
    const { container } = render(<MemoryRouter><ApplicationPage /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Applications and enrollment are not open' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'No application form is connected' })).toBeTruthy();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input, textarea, select, button[type="submit"]')).toBeNull();
  });

  it('does not collect candidate evidence or send application data', () => {
    const { container } = render(<MemoryRouter><ApplicationPage /></MemoryRouter>);

    expect(container.textContent).toContain('No candidate application, identity document, qualification or clinical evidence is collected.');
    expect(container.textContent).toContain('Online applications and payment processing are disabled.');
  });
});
