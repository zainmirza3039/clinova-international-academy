import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollPosition: () => false }));

afterEach(() => cleanup());

function renderSiteNavigation() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Header />
      <Footer />
    </MemoryRouter>,
  );
}

describe('site-wide navigation pathways', () => {
  it('provides grouped desktop routes for discovery, learners, faculty, and institutions', () => {
    renderSiteNavigation();
    const mainNav = within(screen.getByRole('navigation', { name: 'Main navigation' }));
    const departmentsLink = mainNav.getByRole('link', { name: 'Departments', exact: true });
    expect(departmentsLink.getAttribute('href')).toBe('/departments');
    fireEvent.mouseEnter(departmentsLink.parentElement!);
    expect(departmentsLink.getAttribute('aria-expanded')).toBe('true');
    expect(mainNav.getAllByRole('link').some((link) => link.getAttribute('href')?.startsWith('/departments/'))).toBe(true);

    const coursesLink = mainNav.getByRole('link', { name: 'Courses', exact: true });
    fireEvent.mouseEnter(coursesLink.parentElement!);
    expect(mainNav.getByRole('link', { name: /all self-study courses/i }).getAttribute('href')).toBe('/cpd-courses');
    expect(mainNav.getByRole('link', { name: /programme learning guides/i }).getAttribute('href')).toBe('/programmes');
    expect(mainNav.getByRole('link', { name: /articles and resources/i }).getAttribute('href')).toBe('/resources');
    expect(mainNav.getByRole('link', { name: /study tools/i }).getAttribute('href')).toBe('/learning-resources');

    const learnersLink = mainNav.getByRole('link', { name: 'Learners' });
    fireEvent.mouseEnter(learnersLink.parentElement!);
    expect(mainNav.getByRole('link', { name: /online learning resources/i }).getAttribute('href')).toBe('/online-learning');
    expect(mainNav.getByRole('link', { name: /application information/i }).getAttribute('href')).toBe('/application');
    expect(mainNav.getByRole('link', { name: /student access — currently unavailable/i }).getAttribute('href')).toBe('/student');

    const facultyLink = mainNav.getByRole('link', { name: 'Faculty' });
    fireEvent.mouseEnter(facultyLink.parentElement!);
    expect(mainNav.getByRole('link', { name: /instructor information/i }).getAttribute('href')).toBe('/become-an-instructor');

    const institutionLink = mainNav.getByRole('link', { name: 'Institutions' });
    fireEvent.mouseEnter(institutionLink.parentElement!);
    expect(mainNav.getByRole('link', { name: /clinical internship status/i }).getAttribute('href')).toBe('/clinical-internships');
    expect(mainNav.getByRole('link', { name: 'Resources', exact: true }).getAttribute('href')).toBe('/resources');
  });

  it('keeps mobile submenus keyboard accessible and labels disabled services clearly', () => {
    renderSiteNavigation();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const mobileNav = within(screen.getByRole('navigation', { name: 'Mobile navigation' }));

    const learnerToggle = mobileNav.getByRole('button', { name: 'Expand Learners submenu' });
    fireEvent.click(learnerToggle);
    expect(learnerToggle.getAttribute('aria-expanded')).toBe('true');
    const studentAccess = mobileNav.getByRole('link', { name: /student access — currently unavailable/i });
    expect(studentAccess.getAttribute('href')).toBe('/student');
    expect(mobileNav.getByText(/learner sign-in and protected student services are not available/i)).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open menu' }));
  });

  it('groups legal, certificate, and contact routes in the footer and preserves unavailable states', () => {
    renderSiteNavigation();
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByRole('navigation', { name: 'Explore links' }).textContent).toContain('About Clinova');
    expect(footer.getByRole('navigation', { name: 'Explore links' }).textContent).toContain('Online learning resources — no enrolment');
    expect(footer.getByRole('navigation', { name: 'Explore links' }).textContent).toContain('Programme learning guides');
    expect(footer.getByRole('navigation', { name: 'Learner links' }).textContent).toContain('Student access — currently unavailable');
    expect(footer.getByRole('navigation', { name: 'Faculty and institution links' }).textContent).toContain('Instructor information — applications not open');
    expect(footer.getByRole('navigation', { name: 'Faculty and institution links' }).textContent).toContain('Partnership information — applications unavailable');
    expect(footer.getByRole('navigation', { name: 'Faculty and institution links' }).textContent).toContain('Community events — none currently listed');
    expect(footer.getByRole('link', { name: 'Contact details' }).getAttribute('href')).toBe('/contact');
    expect(footer.getByRole('link', { name: 'Certificate verification — unavailable' }).getAttribute('href')).toBe('/verify');
    expect(footer.getByRole('link', { name: 'Privacy Policy' }).getAttribute('href')).toBe('/privacy-policy');
    expect(footer.getByText(/Policy pages are placeholders pending approval/i)).toBeTruthy();
  });
});
