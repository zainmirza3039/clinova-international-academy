import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

function renderPage(page: React.ReactNode) { return render(<MemoryRouter>{page}</MemoryRouter>); }

afterEach(() => cleanup());

describe('completion frontend pages', () => {
  it('describes the current reading-only service scope without claiming online delivery', () => {
    const { container } = renderPage(<AboutPage />);
    expect(screen.getByRole('heading', { name: 'Healthcare learning resources for independent study' })).toBeTruthy();
    expect(container.textContent).toMatch(/does not provide live online teaching, enrolment, assessment or learner accounts/i);
    expect(screen.getByText('Proposed mission')).toBeTruthy();
    expect(screen.getByText('Proposed vision')).toBeTruthy();
    expect(container.textContent).not.toMatch(/delivered online/i);
  });

  it('explains that application submission and persistence are unavailable', () => {
    renderPage(<ApplicationPage />);
    expect(screen.getByRole('heading', { name: 'Discuss your learning interests' })).toBeTruthy();
    expect(screen.getByText(/Online applications and payment processing are not available through this website/i)).toBeTruthy();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByLabelText(/your name/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /submit|send application/i })).toBeNull();
  });

  it('distinguishes online reading resources from unavailable teaching and learner services', () => {
    const { container } = renderPage(<OnlineLearningPage />);
    expect(screen.getByRole('heading', { name: /self-guided resources only; live teaching and enrolment are unavailable/i })).toBeTruthy();
    expect(container.textContent).toMatch(/learner accounts, enrolment, formal assessment, learner support and certificate services are not operational/i);
    expect(screen.getByRole('link', { name: /browse self-study courses/i }).getAttribute('href')).toBe('/cpd-courses');
  });

  it('keeps admin access blocked without presenting credentials or fake records', () => {
    render(<MemoryRouter><AuthProvider><AdminPage /></AuthProvider></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /administration is not enabled/i })).toBeTruthy();
    expect(screen.getByText(/server-side authentication and role contract/i)).toBeTruthy();
    expect(screen.queryByLabelText(/password|email/i)).toBeNull();
    expect(screen.getByText('Applications')).toBeTruthy();
  });

  it('renders honest unconfirmed states for events and faculty', () => {
    renderPage(<EventsPage />);
    expect(screen.getByRole('heading', { name: /no events currently listed/i })).toBeTruthy();
    renderPage(<FacultyPage />);
    expect(screen.getByRole('heading', { name: /no verified faculty profiles are currently published/i })).toBeTruthy();
  });

  it('provides FAQ buttons with expanded state and no invented commercial claims', () => {
    renderPage(<FAQsPage />);
    const question = screen.getByRole('button', { name: /how do i choose a programme/i });
    expect(question.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(question);
    expect(question.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(/£|accredited by/i)).toBeNull();
    const contactQuestion = screen.getByRole('button', { name: /how do i contact clinova/i });
    fireEvent.click(contactQuestion);
    expect(screen.getByText(/Online enquiry submissions are not available/i)).toBeTruthy();
    expect(screen.queryByText(/currently supported contact route and expected response guidance/i)).toBeNull();
  });

  it('renders admissions guidance and the application preview link', () => {
    renderPage(<AdmissionsPage />);
    expect(screen.getByRole('heading', { name: /explore your learning options/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /student access and online applications are unavailable/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /application information/i }).getAttribute('href')).toBe('/application');
  });

  it('renders the community index without implying unverified details', () => {
    renderPage(<CommunityPage />);
    expect(screen.getByRole('heading', { name: /thoughtful learning community/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /events/i }).getAttribute('href')).toBe('/events');
  });
});
