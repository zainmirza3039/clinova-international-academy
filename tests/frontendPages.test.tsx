import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import AdmissionsPage from '@/pages/AdmissionsPage';
import ApplicationPage from '@/pages/ApplicationPage';
import AdminPage from '@/pages/AdminPage';
import CommunityPage, { EventsPage, FacultyPage } from '@/pages/CommunityPage';
import FAQsPage from '@/pages/FAQsPage';
import ContactPage from '@/pages/ContactPage';
import TrainingPartnersPage from '@/pages/TrainingPartnersPage';

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

  it('states that admissions are not open while linking to the local-only planner', () => {
    renderPage(<AdmissionsPage />);
    expect(screen.getByRole('heading', { name: /admissions are not yet open/i })).toBeTruthy();
    expect(screen.getByText(/No programme is currently approved for enrolment/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /open application planner/i }).getAttribute('href')).toBe('/application');
  });

  it('renders the community index without implying unverified details', () => {
    renderPage(<CommunityPage />);
    expect(screen.getByRole('heading', { name: /thoughtful learning community/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /events/i }).getAttribute('href')).toBe('/events');
  });

  it('does not collect contact details while online submissions are disabled', () => {
    renderPage(<ContactPage />);
    expect(screen.getByRole('heading', { name: /enquiry service unavailable/i })).toBeTruthy();
    expect(screen.queryByLabelText(/your name/i)).toBeNull();
    expect(screen.queryByLabelText(/^message \*/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /send message/i })).toBeNull();
  });

  it('does not collect partnership details while online submissions are disabled', () => {
    renderPage(<TrainingPartnersPage />);
    expect(screen.getByRole('heading', { name: /enquiry service unavailable/i })).toBeTruthy();
    expect(screen.queryByLabelText(/full name/i)).toBeNull();
    expect(screen.queryByLabelText(/organisation/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /submit partnership enquiry/i })).toBeNull();
  });
});
