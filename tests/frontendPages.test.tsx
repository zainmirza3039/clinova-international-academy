import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import AdmissionsPage from '@/pages/AdmissionsPage';
import ApplicationPage from '@/pages/ApplicationPage';
import AdminPage from '@/pages/AdminPage';
import CommunityPage, { EventsPage, FacultyPage } from '@/pages/CommunityPage';
import FAQsPage from '@/pages/FAQsPage';

function renderPage(page: React.ReactNode) { return render(<MemoryRouter>{page}</MemoryRouter>); }

afterEach(() => cleanup());

describe('completion frontend pages', () => {
  it('explains that application submission and persistence are unavailable', () => {
    renderPage(<ApplicationPage />);
    expect(screen.getByText(/Submission unavailable/i)).toBeTruthy();
    expect((screen.getByRole('button', { name: /submission is not available/i }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Private Name' } });
    expect(screen.queryByText(/application record will be created/i)).not.toBeNull();
    expect(screen.queryByText(/thank you|submitted successfully/i)).toBeNull();
  });

  it('keeps admin access blocked without presenting credentials or fake records', () => {
    renderPage(<AdminPage />);
    expect(screen.getByRole('heading', { name: /administration is not enabled/i })).toBeTruthy();
    expect(screen.getByText(/server-side authentication and role contract/i)).toBeTruthy();
    expect(screen.queryByLabelText(/password|email/i)).toBeNull();
    expect(screen.getByText('Applications')).toBeTruthy();
  });

  it('renders honest unconfirmed states for events and faculty', () => {
    renderPage(<EventsPage />);
    expect(screen.getByRole('heading', { name: /no confirmed events yet/i })).toBeTruthy();
    renderPage(<FacultyPage />);
    expect(screen.getByRole('heading', { name: /faculty profiles are not yet confirmed/i })).toBeTruthy();
  });

  it('provides FAQ buttons with expanded state and no invented commercial claims', () => {
    renderPage(<FAQsPage />);
    const question = screen.getByRole('button', { name: /how do i choose a programme/i });
    expect(question.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(question);
    expect(question.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(/£|accredited by/i)).toBeNull();
  });

  it('renders admissions guidance and the application preview link', () => {
    renderPage(<AdmissionsPage />);
    expect(screen.getByRole('heading', { name: /clear next step/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /open application preview/i }).getAttribute('href')).toBe('/application');
  });

  it('renders the community index without implying unverified details', () => {
    renderPage(<CommunityPage />);
    expect(screen.getByRole('heading', { name: /thoughtful learning community/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /events/i }).getAttribute('href')).toBe('/events');
  });
});
