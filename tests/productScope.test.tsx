import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ContactPage from '@/pages/ContactPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import AdmissionsPage from '@/pages/AdmissionsPage';
import ApplicationPage from '@/pages/ApplicationPage';
import CertificationPage from '@/pages/CertificationPage';
import CertificateVerificationPage from '@/pages/CertificateVerificationPage';
import ClinicalInternshipsPage from '@/pages/ClinicalInternshipsPage';
import AssessmentPage from '@/pages/AssessmentPage';
import QualityAssurancePage from '@/pages/QualityAssurancePage';
import { FacultyPage } from '@/pages/CommunityPage';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }), useScrollPosition: () => false }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; });
function renderPage(page: React.ReactNode) { return render(<MemoryRouter>{page}</MemoryRouter>); }

describe('Clinova platform scope and truthful availability', () => {
  it('presents Clinova education and certification without promoting legacy self-study offers', () => {
    const { container } = renderPage(<HomePage />);
    expect(container.textContent).toContain('Clinova International Academy Ltd');
    expect(container.textContent).toMatch(/professional certification/i);
    expect(container.textContent).toMatch(/No CPD course enrollment, certification application, examination, credential issuance or live verification is currently available/i);
    expect(container.textContent).not.toMatch(/self-study course|browse self-study|self-paced course/i);
    expect(container.querySelector('form,input[type="email"]')).toBeNull();
  });
  it('shows proposed CPD topic titles without opening a course or admissions workflow', () => {
    const cpd = renderPage(<CPDCoursesPage />);
    expect(screen.getByRole('heading', { name: 'Browse proposed CPD topics' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'No CPD course enrollment is available' })).toBeTruthy();
    expect(cpd.container.querySelectorAll('a[href^="/cpd-courses/"]')).toHaveLength(12);
    expect(cpd.container.querySelector('form,input[type="email"],input[type="password"],input[type="file"],textarea,button[type="submit"]')).toBeNull();
    expect(cpd.container.textContent).not.toMatch(/self-study course|self-paced study|independent study/i); cleanup();
    const admissions = renderPage(<AdmissionsPage />);
    expect(screen.getByRole('heading', { name: 'Online applications and payments are unavailable' })).toBeTruthy();
    expect(admissions.container.querySelector('form,input,button[type="submit"]')).toBeNull();
  });
  it('does not collect applications or run assessment decisions', () => {
    const application = renderPage(<ApplicationPage />);
    expect(screen.getByRole('heading', { name: 'Applications and enrollment are not open' })).toBeTruthy();
    expect(application.container.textContent).toMatch(/online applications and payment processing are disabled/i);
    expect(application.container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull(); cleanup();
    const assessment = renderPage(<AssessmentPage />);
    expect(screen.getByRole('heading', { name: 'No examination or OSCE is open' })).toBeTruthy();
    expect(assessment.container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull();
  });
  it('separates professional certification, policy development and quality assurance from accreditation claims', () => {
    const certification = renderPage(<CertificationPage />); expect(screen.getByRole('heading', { name: 'No certification scheme is open' })).toBeTruthy();
    expect(certification.container.textContent).toMatch(/no claim of UKAS accreditation/i); cleanup();
    const quality = renderPage(<QualityAssurancePage />);
    expect(quality.container.textContent).toMatch(/not published as an operative policy/i);
    expect(quality.container.textContent).not.toMatch(/Clinova is accredited/i);
  });
  it('keeps certificate verification a local format check with no lookup claim', () => {
    const { container } = renderPage(<CertificateVerificationPage />);
    expect(screen.getByRole('heading', { name: 'Live verification is not available' })).toBeTruthy();
    expect(container.textContent).toMatch(/not sent to a server or stored/i);
    expect(container.querySelector('form')).toBeTruthy();
  });
  it('keeps placements unavailable and preserves the confirmed company identity', () => {
    const placement = renderPage(<ClinicalInternshipsPage />);
    expect(placement.container.textContent).toMatch(/no verified clinical placements are currently listed/i);
    expect(placement.container.querySelector('form,input,[type="file"]')).toBeNull(); cleanup();
    const contact = renderPage(<ContactPage />);
    expect(contact.container.textContent).toContain('Clinova International Academy Ltd'); expect(contact.container.textContent).toContain('Clinova / CIA');
    expect(contact.container.textContent).toContain('16048192'); expect(contact.container.textContent).toContain('14 October 2025');
    expect(contact.container.textContent).toContain('Not a campus, visiting location, or public-facing venue.'); expect(contact.container.querySelector('form')).toBeNull();
  });
  it('keeps public faculty listing empty until profiles are verified', () => {
    const { container } = renderPage(<FacultyPage />);
    expect(screen.getByRole('heading', { name: 'No verified faculty profiles are currently published' })).toBeTruthy();
    expect(container.querySelector('form,input')).toBeNull();
  });
});
