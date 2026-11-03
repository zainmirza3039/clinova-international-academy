// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import ScrollToTop from '@/components/ScrollToTop';
import ProgrammesPage from '@/pages/ProgrammesPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import NotFoundPage from '@/pages/NotFoundPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterBar from '@/components/FilterBar';
import { departments } from '@/data/departments';
const config = vi.hoisted(() => ({ siteOrigin: 'https://academy.example' as string | undefined }));
vi.mock('@/lib/siteConfig', () => config);
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }), useScrollPosition: () => false }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; });
beforeEach(() => { config.siteOrigin = 'https://academy.example'; });
function SEOProbe({ noindex = false }: { noindex?: boolean }) { useSEO({ title: 'Test route', description: 'Test-only metadata', noindex }); return <p>test</p>; }

describe('metadata release safeguards', () => {
  it.each(['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/student', '/candidate-dashboard', '/assessor-dashboard', '/certification-panel', '/faculty-dashboard', '/verify', '/assessment', '/quality-assurance', '/certification/policies', '/certification/verify', '/admin', '/apply'])('keeps %s private even with an approved origin', path => {
    render(<MemoryRouter initialEntries={[path]}><SEOProbe /></MemoryRouter>);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
  });
  it('keeps unknown routes noindex and without canonical', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
  it('does not index previews without an approved origin', () => {
    config.siteOrigin = undefined;
    render(<MemoryRouter><SEOProbe /></MemoryRouter>);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
});

describe('closed catalogue and navigation regressions', () => {
  it('renders any filter buttons as non-submit controls', () => {
    render(<form><FilterBar filters={['All', 'Certificate']} active="All" onChange={() => undefined} /></form>);
    expect(screen.getAllByRole('button').every(button => button.getAttribute('type') === 'button')).toBe(true);
  });
  it('withholds programme titles and presents only proposal-level CPD topic discovery', () => {
    const programme = render(<MemoryRouter><ProgrammesPage /></MemoryRouter>);
    expect(programme.container.textContent).toMatch(/no programme offer is available/i);
    expect(programme.container.querySelector('select,input,a[href^="/programmes/"]')).toBeNull();
    cleanup();
    const cpd = render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect(cpd.container.textContent).toMatch(/no cpd course enrollment is available/i);
    expect(cpd.container.querySelector('input[type="search"]')).not.toBeNull();
    expect(cpd.container.querySelector('select')).not.toBeNull();
    expect(cpd.container.querySelectorAll('a[href^="/cpd-courses/"]')).toHaveLength(12);
    expect(cpd.container.textContent).toMatch(/proposed topic titles/i);
    expect(cpd.container.textContent).not.toMatch(/self-study course|self-paced study|independent study/i);
  });
  it('does not render legacy course slugs in navigation or expose admin in the footer', () => {
    render(<MemoryRouter><Header /><Footer /></MemoryRouter>);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    fireEvent.mouseEnter(within(nav).getByRole('link', { name: 'CPD Courses' }).parentElement!);
    expect(nav.querySelectorAll('a[href^="/cpd-courses/"]')).toHaveLength(0);
    expect(within(nav).queryByRole('link', { name: /self-study/i })).toBeNull();
    expect(within(screen.getByRole('contentinfo')).queryByRole('link', { name: /administration/i })).toBeNull();
  });
  it('marks a department parent and exact nested subject page accessibly', () => {
    const path = `/departments/${departments[0].slug}`;
    render(<MemoryRouter initialEntries={[path]}><Header /></MemoryRouter>);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    const aboutLink = within(nav).getByRole('link', { name: 'About Us' });
    fireEvent.mouseEnter(aboutLink.parentElement!);
    const subject = nav.querySelector<HTMLAnchorElement>(`a[href="/departments"]`);
    expect(subject?.getAttribute('aria-current')).toBe('location');
    expect(nav.querySelector<HTMLAnchorElement>(`a[href="${path}"]`)).toBeNull();
  });
});

describe('SPA route focus', () => {
  it('moves focus to the main landmark after pathname changes', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    try {
      render(<MemoryRouter initialEntries={['/first']}><ScrollToTop /><nav><Link to="/second">Open second page</Link></nav><main id="main-content" tabIndex={-1}><Routes><Route path="/first" element={<h1>First page</h1>} /><Route path="/second" element={<h1>Second page</h1>} /></Routes></main></MemoryRouter>);
      const main = screen.getByRole('main');
      expect(document.activeElement).not.toBe(main);
      fireEvent.click(screen.getByRole('link', { name: 'Open second page' }));
      await screen.findByRole('heading', { name: 'Second page' });
      await waitFor(() => expect(document.activeElement).toBe(main));
    } finally { scrollTo.mockRestore(); }
  });
});
