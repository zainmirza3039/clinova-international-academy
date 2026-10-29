import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

const renderPage = (Component: React.ComponentType) => render(<MemoryRouter><Component /></MemoryRouter>);

function fillValidPartnershipDraft() {
  const fields: Array<[RegExp, string]> = [
    [/organisation name/i, 'Northside Learning Group'],
    [/country and location/i, 'United Kingdom'],
    [/contact person/i, 'Alex Example'],
    [/professional role or title/i, 'Education Director'],
    [/business email/i, 'alex@example.org'],
    [/brief proposal or objectives/i, 'We would like to discuss possible educational content collaboration.'],
    [/expected audience or learner group/i, 'Healthcare professionals in our learning network.'],
  ];
  fields.forEach(([label, value]) => fireEvent.change(screen.getByLabelText(label), { target: { value } }));
  fireEvent.change(screen.getByLabelText(/organisation type/i), { target: { value: 'University or college' } });
  fireEvent.change(screen.getByLabelText(/^Collaboration idea \(required\)$/i), { target: { value: 'Educational-content collaboration' } });
  fireEvent.click(screen.getByLabelText(/i understand this draft/i));
}

describe('public enquiry surfaces', () => {
  it.each([
    ['contact page', ContactPage],
    ['learning-library callout', NewsletterForm],
  ])('%s does not imply online submission is available', (_label, Component) => {
    const { container } = renderPage(Component);
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('button[type="submit"]')).toBeNull();
    expect(container.textContent).not.toMatch(/submitted successfully|message sent|thank you for subscribing/i);
    expect(from).not.toHaveBeenCalled();
  });

  it('provides a named, local-only partnership draft form without an online delivery claim', () => {
    const { container } = renderPage(TrainingPartnersPage);
    expect(screen.getByRole('form', { name: 'Outline a collaboration idea' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Validate draft only' })).toBeTruthy();
    expect(container.textContent).toMatch(/does not contact a server, send an enquiry, or save your details/i);
    expect(container.textContent).toMatch(/No written submission has been received/i);
    expect(from).not.toHaveBeenCalled();
  });

  it('announces required-field errors and focuses the error summary', () => {
    renderPage(TrainingPartnersPage);
    const form = screen.getByRole('form', { name: 'Outline a collaboration idea' });
    fireEvent.submit(form);
    const errorSummary = screen.getByRole('alert');
    expect(errorSummary.textContent).toMatch(/Organisation name: Please complete all required fields/i);
    expect(screen.getByLabelText(/organisation name/i).getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(errorSummary);
    expect(from).not.toHaveBeenCalled();
  });

  it('rejects excessive input and non-phone characters before any submission', () => {
    renderPage(TrainingPartnersPage);
    fireEvent.change(screen.getByLabelText(/organisation name/i), { target: { value: 'x'.repeat(201) } });
    fireEvent.submit(screen.getByRole('form', { name: 'Outline a collaboration idea' }));
    expect(screen.getByText(/One or more fields are too long/i, { selector: '#partner-organisationName-error' })).toBeTruthy();

    fillValidPartnershipDraft();
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: 'call-me' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Outline a collaboration idea' }));
    expect(screen.getByText(/digits and common phone punctuation/i, { selector: '#partner-phoneNumber-error' })).toBeTruthy();
    expect(from).not.toHaveBeenCalled();
  });

  it('validates email locally and does not persist or send a valid-looking proposal', () => {
    renderPage(TrainingPartnersPage);
    fillValidPartnershipDraft();
    fireEvent.change(screen.getByLabelText(/business email/i), { target: { value: 'not-an-email' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Outline a collaboration idea' }));
    expect(screen.getByText('Please enter a valid email address.')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/business email/i), { target: { value: 'alex@example.org' } });
    const form = screen.getByRole('form', { name: 'Outline a collaboration idea' });
    fireEvent.submit(form);
    fireEvent.submit(form);
    const status = screen.getByRole('status');
    expect(status.textContent).toMatch(/no enquiry was submitted\. Nothing was sent or saved/i);
    expect(status.textContent).not.toMatch(/successfully submitted|reference number/i);
    expect(from).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('clears local draft values and validation status on request', () => {
    renderPage(TrainingPartnersPage);
    const organisation = screen.getByLabelText(/organisation name/i) as HTMLInputElement;
    fireEvent.change(organisation, { target: { value: 'Northside Learning Group' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Outline a collaboration idea' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear draft' }));
    expect(organisation.value).toBe('');
    expect(screen.queryByRole('status')).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });
});
