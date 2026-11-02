import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollPosition: () => false }));
afterEach(() => cleanup());
function renderSiteNavigation() { return render(<MemoryRouter initialEntries={['/']}><Header /><Footer /></MemoryRouter>); }

describe('site-wide navigation pathways', () => {
  it('groups public education, certification, assessment and institutional status routes', () => {
    renderSiteNavigation(); const mainNav = within(screen.getByRole('navigation', { name: 'Main navigation' }));
    const cpd = mainNav.getByRole('link', { name: 'CPD Courses' }); fireEvent.focus(cpd);
    expect(mainNav.getByRole('link', { name: /Course catalogue status/ }).getAttribute('href')).toBe('/cpd-courses');
    expect(mainNav.getByRole('link', { name: /Admissions information/ }).getAttribute('href')).toBe('/admissions');
    expect(mainNav.queryByRole('link', { name: /self-study|published courses/i })).toBeNull();
    const certification = mainNav.getByRole('link', { name: 'Professional Certification' }); fireEvent.focus(certification);
    expect(mainNav.getByRole('link', { name: /Certification overview/ }).getAttribute('href')).toBe('/certification');
    expect(mainNav.getByRole('link', { name: /Assessment development/ }).getAttribute('href')).toBe('/assessment');
    expect(mainNav.getByRole('link', { name: /Policy development/ }).getAttribute('href')).toBe('/certification/policies');
    const institutions = mainNav.getByRole('link', { name: 'For Institutions' }); fireEvent.focus(institutions);
    expect(mainNav.getByRole('link', { name: /Institutional collaboration/ }).getAttribute('href')).toBe('/for-institutions');
    expect(mainNav.getByRole('link', { name: /Clinical placement status/ }).getAttribute('href')).toBe('/clinical-internships');
    expect(mainNav.getByRole('link', { name: 'Verify Certificate' }).getAttribute('href')).toBe('/verify');
    expect(mainNav.getByRole('link', { name: 'Login / Register' }).getAttribute('href')).toBe('/sign-in');
  });
  it('keeps mobile account/status submenus keyboard-accessible and labels unavailable services', () => {
    renderSiteNavigation(); fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const mobileNav = within(screen.getByRole('navigation', { name: 'Mobile navigation' })); const cpdToggle = mobileNav.getByRole('button', { name: 'Expand CPD Courses submenu' });
    fireEvent.click(cpdToggle); expect(cpdToggle.getAttribute('aria-expanded')).toBe('true');
    expect(mobileNav.getByRole('link', { name: /course catalogue status/i }).getAttribute('href')).toBe('/cpd-courses');
    expect(mobileNav.getByText(/no cpd course is currently open for enrollment/i)).toBeTruthy(); fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open menu' }));
  });
  it('groups legal, verification and contact links in the footer without exposing admin routes', () => {
    renderSiteNavigation(); const footer = within(screen.getByRole('contentinfo'));
    const explore = footer.getByRole('navigation', { name: 'Explore links' }).textContent ?? '';
    expect(explore).toContain('About Clinova'); expect(explore).toContain('CPD Courses — status');
    expect(footer.getByRole('navigation', { name: 'Learner links' }).textContent).toContain('Candidate and learner portal');
    expect(footer.getByRole('link', { name: /credential verification/i }).getAttribute('href')).toBe('/verify');
    expect(footer.getByRole('link', { name: 'Privacy Policy' }).getAttribute('href')).toBe('/privacy-policy');
    expect(footer.getByText(/pages are placeholders pending approval/i)).toBeTruthy();
    expect(footer.queryByRole('link', { name: /administration/i })).toBeNull();
  });
});
