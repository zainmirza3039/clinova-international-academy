import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from '@/pages/ContactPage';
import TrainingPartnersPage from '@/pages/TrainingPartnersPage';
import NewsletterForm from '@/components/NewsletterForm';

const { insert, from } = vi.hoisted(() => ({ insert: vi.fn(), from: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from } }));
vi.mock('@/lib/siteConfig', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/siteConfig')>(),
  enquiriesEnabled: true,
}));
vi.mock('@/hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
}));

const scenarios = [
  {
    label: 'contact', Component: ContactPage, table: 'contact_submissions',
    fields: { name: ' Test Visitor ', email: 'visitor@example.test', phone: '', subject: ' Test enquiry ', enquiryType: 'General Enquiry', message: ' Test message ' },
    payload: { name: 'Test Visitor', email: 'visitor@example.test', phone: null, subject: 'Test enquiry', enquiry_type: 'General Enquiry', message: 'Test message' },
    success: 'Message Sent', required: 'name',
    limits: { name: 160, email: 320, phone: 80, subject: 200, message: 5000 },
  },
  {
    label: 'partnership', Component: TrainingPartnersPage, table: 'partnership_inquiries',
    fields: { fullName: ' Test Visitor ', organisation: ' Test Organisation ', role: ' Coordinator ', email: 'visitor@example.test', phone: '', country: ' Pakistan ', website: '', message: ' Test partnership ' },
    payload: { full_name: 'Test Visitor', organisation: 'Test Organisation', role: 'Coordinator', email: 'visitor@example.test', phone: null, country: 'Pakistan', website: null, message: 'Test partnership' },
    success: 'Enquiry Submitted', required: 'fullName',
    limits: { fullName: 160, organisation: 200, role: 160, email: 320, phone: 80, country: 120, website: 500, message: 5000 },
  },
  {
    label: 'newsletter', Component: NewsletterForm, table: 'newsletter_subscriptions',
    fields: { email: 'visitor@example.test' },
    payload: { email: 'visitor@example.test' },
    success: 'Thank you for subscribing.', required: 'email',
    limits: { email: 320 },
  },
];

beforeEach(() => {
  from.mockReturnValue({ insert });
  insert.mockResolvedValue({ error: null });
});
afterEach(cleanup);

function fill(form: HTMLFormElement, fields: Record<string, string>) {
  for (const [name, value] of Object.entries(fields)) {
    const control = form.elements.namedItem(name);
    expect(control, `Missing named form field: ${name}`).not.toBeNull();
    fireEvent.change(control!, { target: { value } });
  }
}

for (const scenario of scenarios) {
  describe(scenario.label, () => {
    function setup(overrides: Record<string, string> = {}) {
      const { Component } = scenario;
      const { container } = render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Component /></MemoryRouter>);
      const form = container.querySelector('form')!;
      fill(form, { ...scenario.fields, ...overrides });
      return form;
    }

    it('uses named fields, migration limits, and an insert-only normalized payload', async () => {
      const form = setup();
      for (const [name, limit] of Object.entries(scenario.limits)) {
        expect((form.elements.namedItem(name) as HTMLInputElement).maxLength).toBe(limit);
      }
      const reset = vi.spyOn(form, 'reset');
      fireEvent.submit(form);
      await waitFor(() => expect(screen.getByRole('status').textContent).toContain(scenario.success));
      expect(from).toHaveBeenCalledExactlyOnceWith(scenario.table);
      expect(insert).toHaveBeenCalledExactlyOnceWith(scenario.payload);
      expect(reset).toHaveBeenCalledOnce();
    });

    it('rejects whitespace-only required values without a backend request', async () => {
      const form = setup({ [scenario.required]: '   ' });
      fireEvent.submit(form);
      expect((await screen.findByRole('alert')).textContent).toContain('required');
      expect(insert).not.toHaveBeenCalled();
      expect((form.querySelector('button') as HTMLButtonElement).disabled).toBe(false);
    });

    it('rejects malformed email even if native validation is bypassed', async () => {
      const form = setup({ email: 'invalid@' });
      fireEvent.submit(form);
      expect((await screen.findByRole('alert')).textContent).toContain('valid email');
      expect(insert).not.toHaveBeenCalled();
    });

    it('rejects values beyond database limits without silently truncating', async () => {
      const form = setup({ email: 'a'.repeat(310) + '@example.test' });
      fireEvent.submit(form);
      expect((await screen.findByRole('alert')).textContent).toContain('too long');
      expect(insert).not.toHaveBeenCalled();
    });

    for (const failure of ['database', 'network']) {
      it(`retains input and permits retry after a ${failure} failure`, async () => {
        if (failure === 'database') insert.mockResolvedValueOnce({ error: { code: '42501', message: 'private backend detail' } });
        else insert.mockRejectedValueOnce(new Error('private backend detail'));
        const form = setup();
        const reset = vi.spyOn(form, 'reset');
        fireEvent.submit(form);
        const alert = await screen.findByRole('alert');
        expect(alert.textContent).toContain('try again');
        expect(alert.textContent).not.toContain('private backend detail');
        expect((form.elements.namedItem('email') as HTMLInputElement).value).toBe('visitor@example.test');
        expect(reset).not.toHaveBeenCalled();
        expect((form.querySelector('button') as HTMLButtonElement).disabled).toBe(false);
        fireEvent.submit(form);
        await waitFor(() => expect(screen.getByRole('status').textContent).toContain(scenario.success));
        expect(insert).toHaveBeenCalledTimes(2);
      });
    }

    it('blocks duplicate submissions while pending and captures the form before await', async () => {
      let resolve!: (value: { error: null }) => void;
      insert.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
      const form = setup();
      act(() => {
        fireEvent.submit(form);
        fireEvent.submit(form);
      });
      await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
      expect((form.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
      await act(async () => { resolve({ error: null }); });
      expect(screen.getByRole('status').textContent).toContain(scenario.success);
    });
  });
}

it('accepts duplicate newsletter subscriptions with the same success response', async () => {
  insert.mockResolvedValueOnce({ error: { code: '23505' } });
  const { container } = render(<NewsletterForm />);
  const form = container.querySelector('form')!;
  fill(form, { email: 'visitor@example.test' });
  fireEvent.submit(form);
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Thank you for subscribing.'));
  expect(screen.queryByRole('alert')).toBeNull();
  expect(insert).toHaveBeenCalledExactlyOnceWith({ email: 'visitor@example.test' });
});

it.each(['javascript:alert(1)', 'ftp://example.test', 'not a URL'])('rejects unsafe partnership website %s', async (website) => {
  const { container } = render(<MemoryRouter><TrainingPartnersPage /></MemoryRouter>);
  const form = container.querySelector('form')!;
  fill(form, { ...scenarios[1].fields, website });
  fireEvent.submit(form);
  expect((await screen.findByRole('alert')).textContent).toContain('http:// or https://');
  expect(insert).not.toHaveBeenCalled();
});

it('includes optional partnership contact details when supplied', async () => {
  const { container } = render(<MemoryRouter><TrainingPartnersPage /></MemoryRouter>);
  const form = container.querySelector('form')!;
  fill(form, { ...scenarios[1].fields, phone: ' +92 300 0000000 ', website: ' https://example.test/ ' });
  fireEvent.submit(form);
  await waitFor(() => expect(insert).toHaveBeenCalledExactlyOnceWith({ ...scenarios[1].payload, phone: '+92 300 0000000', website: 'https://example.test/' }));
});
