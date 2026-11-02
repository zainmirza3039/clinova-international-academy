import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ContactPage from '@/pages/ContactPage';
import { FacultyPage } from '@/pages/CommunityPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import ClinicalInternshipsPage from '@/pages/ClinicalInternshipsPage';
import InstructorRecruitmentPage from '@/pages/InstructorRecruitmentPage';
import UnavailableRoleWorkspacePage from '@/pages/UnavailableRoleWorkspacePage';
import CertificationAndCpdPolicyPage from '@/pages/CertificationAndCpdPolicyPage';

vi.mock('@/hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
  useScrollPosition: () => false,
}));

afterEach(() => {
  cleanup();
  document.head.innerHTML = '';
});

function renderPage(page: React.ReactNode) {
  return render(<MemoryRouter>{page}</MemoryRouter>);
}

describe('Clinova product-scope boundaries', () => {
  it('links online self-study users to the separate internship pathway without implying availability', () => {
    renderPage(<CPDCoursesPage />);

    expect(screen.getByRole('heading', { name: 'Looking for supervised practical training?' })).toBeTruthy();
    expect(screen.getByText(/clinical placements are a separate service delivered and supervised by partner institutions/i)).toBeTruthy();
    expect(screen.getByText(/no verified placements or application workflow are currently available/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /review clinical internship availability/i }).getAttribute('href')).toBe('/clinical-internships');
  });

  it('separates self-study resources from partner-delivered clinical placements on the homepage', () => {
    renderPage(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Advance Your Healthcare Career with Clinova' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /explore self-study guides/i }).getAttribute('href')).toBe('/cpd-courses');
    expect(screen.getByText(/two distinct service divisions/i)).toBeTruthy();
    expect(screen.getByText(/Division A · Online CPD & self-paced learning/i)).toBeTruthy();
    expect(screen.getByText(/Division B · Institutional collaboration & clinical internships/i)).toBeTruthy();
    const internshipStatusLinks = screen.getAllByRole('link', { name: /view internship status/i });
    expect(internshipStatusLinks).toHaveLength(2);
    expect(internshipStatusLinks.every((link) => link.getAttribute('href') === '/clinical-internships')).toBe(true);
    expect(screen.getByRole('link', { name: /read partnership information/i }).getAttribute('href')).toBe('/training-partners');
    expect(screen.getByText(/learner enrolment and saved progress are not available in this build/i)).toBeTruthy();
    expect(screen.getByText(/no verified placement listings, application workflow or partner-backed certificate is currently available/i)).toBeTruthy();
    expect(screen.getByText(/local-only draft checker.*does not submit or save an enquiry/i)).toBeTruthy();
    expect(screen.queryByText(/organisations can use this page to describe their learning needs and enquire/i)).toBeNull();
    expect(screen.getByRole('link', { name: /review partnership information/i }).getAttribute('href')).toBe('/training-partners');
  });

  it('follows the requested discovery-to-contact flow with named, responsive sections and no fake enquiry form', () => {
    const { container } = renderPage(<HomePage />);
    const sectionIds = [
      'home-browse',
      'home-pathways',
      'home-subject-areas',
      'home-self-study',
      'home-resources',
      'home-contact',
    ];
    const sections = sectionIds.map((id) => container.querySelector(`#${id}`));
    expect(sections.every((section) => section instanceof HTMLElement)).toBe(true);
    const positions = sections.map((section) => Array.from(container.querySelectorAll('section')).indexOf(section!));
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(sections.every((section) => section?.getAttribute('aria-labelledby'))).toBe(true);

    const departmentGrid = container.querySelector('#home-subject-areas .grid');
    const courseGrid = Array.from(container.querySelectorAll('#home-self-study .grid'))
      .find((grid) => grid.classList.contains('lg:grid-cols-4'));
    expect(departmentGrid?.classList.contains('grid-cols-1')).toBe(true);
    expect(departmentGrid?.classList.contains('sm:grid-cols-2')).toBe(true);
    expect(courseGrid?.classList.contains('grid-cols-1')).toBe(true);
    expect(courseGrid?.classList.contains('sm:grid-cols-2')).toBe(true);
    expect(screen.getByRole('link', { name: /view contact information/i }).getAttribute('href')).toBe('/contact');
    expect(screen.getByText(/no verified public email address or online enquiry submission is available/i)).toBeTruthy();
    expect(screen.getByText('Clinova International Academy Ltd')).toBeTruthy();
    expect(screen.getByText('Clinova / CIA')).toBeTruthy();
    expect(screen.getByText('16048192')).toBeTruthy();
    expect(screen.getByText('14 October 2025')).toBeTruthy();
    expect(screen.getByText('Registered office (virtual address)')).toBeTruthy();
    expect(screen.getByText('Not a campus, visiting location, or public-facing venue.')).toBeTruthy();
    expect(container.querySelector('form')).toBeNull();
  });

  it('shows the same owner-confirmed identity facts on the Contact page', () => {
    const { container } = renderPage(<ContactPage />);
    expect(container.textContent).toContain('Clinova International Academy Ltd');
    expect(container.textContent).toContain('Clinova / CIA');
    expect(container.textContent).toContain('16048192');
    expect(container.textContent).toContain('14 October 2025');
    expect(container.textContent).toContain('Registered office (virtual address)');
    expect(container.textContent).toContain('1 Unity St, Bristol BS1 5HH, United Kingdom');
    expect(container.textContent).toContain('Not a campus, visiting location, or public-facing venue.');
    expect(container.querySelector('form')).toBeNull();
  });

  it('shows no placements and does not offer an application or a fabricated partner record', () => {
    const { container } = renderPage(<ClinicalInternshipsPage />);

    expect(screen.getByRole('heading', { name: 'No verified clinical placements are currently listed' })).toBeTruthy();
    expect(container.textContent).toMatch(/internship applications and placement decisions are not available through this website/i);
    expect(screen.getByText(/the partner institution would provide and supervise the practical training/i)).toBeTruthy();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(screen.queryByRole('link', { name: /apply|submit an application/i })).toBeNull();
  });

  it('distinguishes completion certificates, approved CPD hours and formal accreditation', () => {
    const { container } = renderPage(<CertificationAndCpdPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Certification and CPD policy' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /certificates, CPD awards and live verification are not available/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Certificate of completion' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'CPD hours under an approved scheme' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Formal accreditation' })).toBeTruthy();
    expect(container.textContent).toMatch(/a published guide does not by itself award CPD hours, a certificate, a qualification or an accredited status/i);
    expect(screen.getByRole('heading', { name: 'Clinical internship recognition is separate' })).toBeTruthy();
    expect(container.textContent).toMatch(/no verified placement or partner-backed certificate is currently available/i);
    expect(screen.getByRole('link', { name: /check clinical internship availability/i }).getAttribute('href')).toBe('/clinical-internships');
    expect(container.querySelector('form')).toBeNull();
  });

  it('provides keyboard-native expandable answers without implying placements or recognition are available', () => {
    renderPage(<ClinicalInternshipsPage />);

    const availabilitySummary = screen.getByText('Are clinical placements available now?');
    const availabilityDisclosure = availabilitySummary.closest('details');
    expect(availabilityDisclosure?.open).toBe(false);
    fireEvent.click(availabilitySummary);
    expect(availabilityDisclosure?.open).toBe(true);
    expect(availabilityDisclosure?.textContent).toMatch(/no verified clinical placements are currently listed/i);

    const deliverySummary = screen.getByText('Who would deliver and supervise a placement?');
    const deliveryDisclosure = deliverySummary.closest('details');
    fireEvent.click(deliverySummary);
    expect(deliveryDisclosure?.open).toBe(true);
    expect(deliveryDisclosure?.textContent).toMatch(/practical training would be delivered and supervised by the partner institution/i);

    const applicationSummary = screen.getByText('Can I apply for an internship through this website?');
    const applicationDisclosure = applicationSummary.closest('details');
    fireEvent.click(applicationSummary);
    expect(applicationDisclosure?.open).toBe(true);
    expect(applicationDisclosure?.textContent).toMatch(/internship applications and placement decisions are not available through this website/i);

    const recognitionSummary = screen.getByText('Does this page confirm CPD hours or a certificate?');
    const recognitionDisclosure = recognitionSummary.closest('details');
    fireEvent.click(recognitionSummary);
    expect(recognitionDisclosure?.open).toBe(true);
    expect(recognitionDisclosure?.textContent).toMatch(/this page establishes no CPD approval, certificate eligibility or issued certificate/i);
  });

  it('does not collect educator credentials or imply open recruitment or verified faculty', () => {
    const { container } = renderPage(<InstructorRecruitmentPage />);

    expect(screen.getByRole('heading', { name: 'Instructor applications are not open through this website' })).toBeTruthy();
    expect(screen.getByText(/does not accept applications, CVs, identity documents or professional credentials/i)).toBeTruthy();
    expect(screen.getByText(/not a currently operating review or approval workflow/i)).toBeTruthy();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByRole('link', { name: /view published faculty status/i }).getAttribute('href')).toBe('/faculty');
  });

  it('keeps the faculty directory empty until profiles are verified and links to information, not a credential form', () => {
    const { container } = renderPage(<FacultyPage />);

    expect(screen.getByRole('heading', { name: 'No verified faculty profiles are currently published' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Professional details need to be checked before publication' })).toBeTruthy();
    expect(screen.getByText(/no CVs, identity documents or professional credentials are collected on this page/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Read instructor information' }).getAttribute('href')).toBe('/become-an-instructor');
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  it.each([
    ['Instructor', 'Instructor dashboard unavailable'],
    ['Institution', 'Institution dashboard unavailable'],
  ] as const)('keeps the %s workspace noindex and without controls or records', (role, heading) => {
    const { container } = renderPage(<UnavailableRoleWorkspacePage role={role} />);

    expect(screen.getByRole('heading', { name: heading })).toBeTruthy();
    expect(screen.getByText(/server-side role authorization and hosted permission tests are not verified/i)).toBeTruthy();
    expect(screen.getByText(/no private records were requested or changed/i)).toBeTruthy();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
