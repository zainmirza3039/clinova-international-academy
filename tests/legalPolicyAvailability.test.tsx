import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';

vi.mock('@/hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
  useScrollPosition: () => false,
}));

const policyRoutes = [
  ['/privacy-policy', 'Privacy Policy'],
  ['/terms-and-conditions', 'Terms and Conditions'],
  ['/refund-policy', 'Refund Policy'],
  ['/cookie-policy', 'Cookie Policy'],
] as const;
const approvedLegalRoutes = [
  ['/accessibility-statement', 'Accessibility Statement'],
  ['/external-linking-policy', 'External Linking Policy'],
] as const;

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  document.head.innerHTML = '';
});

describe('legal policy availability', () => {
  it.each(policyRoutes)('%s stays reachable and clearly identifies its approval status', async (route, title) => {
    window.history.replaceState({}, '', route);
    const { container } = render(<App />);

    await waitFor(() => expect(container.querySelector('h1')?.textContent).toBe(title));
    expect(screen.getByRole('heading', { name: 'No approved policy text is available' })).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Policy approval status' }).textContent).toMatch(/approval required/i);
    expect(container.textContent).toMatch(/this page is a placeholder, not an operative policy/i);
    expect(container.textContent).toMatch(/privacy, terms and conditions, cookie, and refund policy pages are placeholders pending approval/i);
  });

  it.each(approvedLegalRoutes)('%s renders owner-approved legal information', async (route, title) => {
    window.history.replaceState({}, '', route);
    const { container } = render(<App />);

    await waitFor(() => expect(container.querySelector('h1')?.textContent).toBe(title));
    expect(screen.queryByRole('status', { name: 'Policy approval status' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'No approved policy text is available' })).toBeNull();
    expect(screen.getByRole('link', { name: title }).getAttribute('href')).toBe(route);
  });

  it('renders the owner-confirmed MyUniHub accessibility details and current known gaps', async () => {
    window.history.replaceState({}, '', '/accessibility-statement');
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('h1')?.textContent).toBe('Accessibility Statement'));
    const content = container.textContent ?? '';

    for (const detail of [
      'MyUniHub',
      'info@clinovainternationalacademy.co.uk',
      '(+44) 7412 890634',
      '400% without text overflow',
      'keyboard navigation',
      'speech recognition',
      'JAWS, NVDA and VoiceOver',
      'partially compliant with WCAG 2.2 AA',
      'regular accessibility testing and reviews and make improvements',
      'older PDF and Office documents',
      'videos without captions',
      'some forms and services with keyboard-navigation or screen-reader barriers',
      'older mobile and tablet content',
      'Issues are typically addressed within three working days',
    ]) {
      expect(content).toContain(detail);
    }
  });

  it('renders the External Linking Policy wording verbatim', async () => {
    window.history.replaceState({}, '', '/external-linking-policy');
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('h1')?.textContent).toBe('External Linking Policy'));
    const expectedText = `At Clinova International Academy, we strive to ensure the accuracy and relevance of all external links provided on our website. However, please note that we do not have control over the content on external websites.

While we conduct thorough checks before publishing external links, we cannot guarantee the accuracy, completeness, or timeliness of content found on external websites. Therefore, Clinova International Academy cannot be held responsible for any content accessed through external links.

It’s important to understand that the presence of an external link on our website does not imply endorsement or approval of the linked website, its owners, products, or services. Visitors are encouraged to exercise their own discretion and judgment when accessing external websites.

Should you encounter any issues or concerns with external links provided on our website, please don’t hesitate to contact us.`;
    const normalizedContent = (container.textContent ?? '').replace(/\s+/g, ' ').trim();
    expect(normalizedContent).toContain(expectedText.replace(/\s+/g, ' ').trim());
  });

  it('keeps login unavailable even when environment flags request activation', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://ssxpmcbqfdggfsoqbxac.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
    vi.resetModules();
    const [{ AuthProvider }, { default: AuthPage }] = await Promise.all([
      import('@/auth/AuthProvider'),
      import('@/pages/AuthPage'),
    ]);
    const client = {
      auth: {
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    } as unknown as import('@supabase/supabase-js').SupabaseClient;

    render(
      <AuthProvider client={client}>
        <MemoryRouter>
          <AuthPage mode="sign-in" />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Student access unavailable' })).toBeTruthy();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByLabelText(/email address|password/i)).toBeNull();
    expect(client.auth.getSession).not.toHaveBeenCalled();
    expect(screen.queryByText(/approved privacy information is not available here/i)).toBeNull();
    expect(screen.queryByText(/governed by clinova.s published privacy and account policies/i)).toBeNull();
  });
});
