import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdmissionsPage from '@/pages/AdmissionsPage';
import AboutPage from '@/pages/AboutPage';
import ApplicationPage from '@/pages/ApplicationPage';
import OnlineLearningPage from '@/pages/OnlineLearningPage';
import AdminPage from '@/pages/AdminPage';
import { AuthProvider } from '@/auth/AuthProvider';
import CommunityPage, { EventsPage, FacultyPage } from '@/pages/CommunityPage';
import FAQsPage from '@/pages/FAQsPage';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
const renderPage = (page: React.ReactNode) => render(<MemoryRouter>{page}</MemoryRouter>);
afterEach(() => { cleanup(); document.head.innerHTML = ''; });

describe('Clinova programme and certification system pages', () => {
  it('preserves the confirmed legal identity and explains service boundaries', () => {
    const { container } = renderPage(<AboutPage />);
    expect(screen.getByRole('heading', { name: 'About Clinova International Academy' })).toBeTruthy();
    expect(container.textContent).toContain('Clinova International Academy Ltd'); expect(container.textContent).toContain('16048192');
    expect(container.textContent).toContain('14 October 2025'); expect(container.textContent).toMatch(/does not accept course enrollment or certification applications/i);
    expect(container.textContent).toMatch(/no scheme or application is currently open/i);
  });
  it('explains that ordinary application submission and persistence are unavailable', () => {
    const { container } = renderPage(<ApplicationPage />);
    expect(container.textContent).toMatch(/Online applications and payment processing are disabled/i);
    expect(container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull();
  });
  it('redirects the legacy online-learning path to current CPD system status', () => {
    const { container } = renderPage(<OnlineLearningPage />); expect(container.textContent).toBe('');
  });
  it('keeps admin access blocked without a verified hosted role contract', () => {
    render(<MemoryRouter><AuthProvider><AdminPage /></AuthProvider></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Secure setup required' })).toBeTruthy();
    expect(screen.getByText(/server-side authentication and role contract/i)).toBeTruthy();
    expect(screen.queryByLabelText(/password|email/i)).toBeNull(); expect(screen.getByText('Applications')).toBeTruthy();
  });
  it('renders unconfirmed event and faculty states honestly', () => {
    renderPage(<EventsPage />); expect(screen.getByRole('heading', { name: 'No events currently listed' })).toBeTruthy();
    cleanup(); renderPage(<FacultyPage />); expect(screen.getByRole('heading', { name: 'No verified faculty profiles are currently published' })).toBeTruthy();
  });
  it('provides keyboard-native FAQ interactions without inventing prices or accreditation claims', () => {
    renderPage(<FAQsPage />); const question = screen.getByRole('button', { name: /how do i choose a programme/i });
    expect(question.getAttribute('aria-expanded')).toBe('true'); expect(document.body.textContent).not.toMatch(/£|accredited by/i);
  });
  it('renders admissions status and a safe application-information link', () => {
    renderPage(<AdmissionsPage />);
    expect(screen.getByRole('heading', { name: 'Services are in development; applications are not open' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Application information' }).getAttribute('href')).toBe('/application');
  });
  it('renders community status without implying unverified event details', () => {
    renderPage(<CommunityPage />); expect(screen.getByRole('heading', { name: 'A thoughtful learning community' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /^Events/ }).getAttribute('href')).toBe('/events');
  });
});
