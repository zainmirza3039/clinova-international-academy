// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import ScrollToTop from '@/components/ScrollToTop';
import HomePage from '@/pages/HomePage';
import ProgrammesPage from '@/pages/ProgrammesPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import NotFoundPage from '@/pages/NotFoundPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterBar from '@/components/FilterBar';
import { programmes } from '@/data/programmes';
import { departments } from '@/data/departments';
import { cpdFilters, publishedCPDCourses } from '@/data/cpdCourses';
const config = vi.hoisted(() => ({ siteOrigin: 'https://academy.example' as string | undefined }));
vi.mock('@/lib/siteConfig', () => config);
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }), useScrollPosition: () => false }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; });
beforeEach(() => { config.siteOrigin = 'https://academy.example'; });
function SEOProbe({ noindex = false }: { noindex?: boolean }) {
  useSEO({ title: 'Test route', description: 'Test-only metadata', noindex });
  return <p>test</p>;
}
function DelayedHashTarget() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 10);
    return () => window.clearTimeout(timer);
  }, []);
  return <><h1>Second page</h1>{ready && <section id="late-target">Delayed anchor target</section>}</>;
}
describe('metadata release safeguards', () => {
  it.each(['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/student', '/student/certificates', '/admin', '/apply'])('keeps %s private even with an approved origin', (path) => {
    render(<MemoryRouter initialEntries={[path]}><SEOProbe /></MemoryRouter>);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
  });
  it.each([['/courses', '/programmes'], ['/courses/example', '/programmes/example'], ['/blog', '/resources'], ['/blog/example', '/resources/example'], ['/announcements', '/resources']])('canonicalizes %s to %s', (path, canonical) => {
    render(<MemoryRouter initialEntries={[path]}><SEOProbe /></MemoryRouter>);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`https://academy.example${canonical}`);
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
describe('catalogue filter accessibility and URL navigation', () => {
  it('renders filter controls as non-submit buttons', () => {
    render(<form><FilterBar filters={['All', 'Certificate']} active="All" onChange={() => undefined} /></form>);
    expect(screen.getAllByRole('button').every(button => button.getAttribute('type') === 'button')).toBe(true);
  });
  it('announces programme result-count changes politely when search filters the catalogue', () => {
    render(<MemoryRouter><ProgrammesPage /></MemoryRouter>);
    const resultCount = Array.from(document.querySelectorAll<HTMLElement>('[role="status"][aria-live="polite"]'))
      .find((status) => status.textContent?.includes('topics found'));
    expect(resultCount?.getAttribute('aria-live')).toBe('polite');
    expect(resultCount?.getAttribute('aria-atomic')).toBe('true');
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'no-matching-learning-guide' } });
    expect(resultCount?.textContent?.replace(/\s+/g, ' ').trim()).toBe('0 topics found');
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'No learning guides match your current filters.' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'No formal programmes currently published' })).toBeNull();
  });
  it('exposes homepage self-study filters as a labelled group with one pressed option', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const filterGroup = screen.getByRole('group', { name: 'Filter self-study courses by subject' });
    const buttons = within(filterGroup).getAllByRole('button');
    expect(buttons).toHaveLength(cpdFilters.length);
    expect(buttons.every((button) => button.getAttribute('type') === 'button')).toBe(true);
    const allFilter = within(filterGroup).getByRole('button', { name: 'All' });
    expect(allFilter.getAttribute('type')).toBe('button');
    expect(allFilter.getAttribute('aria-pressed')).toBe('true');

    const nextFilterLabel = cpdFilters.find((filter) => filter !== 'All')!;
    const nextFilter = within(filterGroup).getByRole('button', { name: nextFilterLabel });
    fireEvent.click(nextFilter);
    expect(nextFilter.getAttribute('aria-pressed')).toBe('true');
    expect(allFilter.getAttribute('aria-pressed')).toBe('false');
    expect(buttons.filter((button) => button.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
  });

  it('labels current learning-guide filters and follows same-page resource-type navigation', () => {
    const category = programmes[0].category;
    const destination = `/programmes?type=${encodeURIComponent(category)}`;
    render(<MemoryRouter initialEntries={[destination]}><Link to={destination}>Navigate learning guides</Link><ProgrammesPage /></MemoryRouter>);
    expect((screen.getByLabelText('Resource type') as HTMLSelectElement).value).toBe(category);
    for (const label of ['Subject area', 'Study level']) expect(screen.getByLabelText(label).tagName).toBe('SELECT');
    fireEvent.click(screen.getByText('Navigate learning guides'));
    expect((screen.getByLabelText('Resource type') as HTMLSelectElement).value).toBe(category);
  });
  it('labels CPD filters and keeps unawarded credit unavailable', () => {
    render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect(screen.getByLabelText('Department').tagName).toBe('SELECT');
    expect((screen.getByLabelText('CPD credit') as HTMLSelectElement).disabled).toBe(true);
    expect(screen.getByLabelText('Level').tagName).toBe('SELECT');
    expect(screen.getByText('This library does not award or record CPD hours.')).toBeTruthy();
  });
  it('derives featured course titles and routes from published records on desktop and mobile', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const validateCourseLinks = (links: HTMLAnchorElement[]) => {
      expect(links).toHaveLength(8);
      for (const link of links) {
        const course = publishedCPDCourses.find((item) => link.getAttribute('href') === `/cpd-courses/${item.slug}`);
        expect(course).toBeTruthy();
        expect(link.textContent).toContain(course!.title);
      }
    };

    const desktopCoursesLink = screen.getByRole('link', { name: 'Courses', exact: true });
    fireEvent.mouseEnter(desktopCoursesLink.parentElement!);
    const desktopNavigation = screen.getByRole('navigation', { name: 'Main navigation' });
    const desktopCourseLinks = Array.from(desktopNavigation.querySelectorAll<HTMLAnchorElement>('a[href^="/cpd-courses/"]'));
    validateCourseLinks(desktopCourseLinks);

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' });
    fireEvent.click(within(mobileNavigation).getByRole('button', { name: 'Expand Courses submenu' }));
    const mobileCourseLinks = Array.from(mobileNavigation.querySelectorAll<HTMLAnchorElement>('a[href^="/cpd-courses/"]'));
    validateCourseLinks(mobileCourseLinks);
    expect(mobileCourseLinks.map((link) => link.getAttribute('href')).sort()).toEqual(desktopCourseLinks.map((link) => link.getAttribute('href')).sort());
  });
  it('does not expose the disabled administration area from the public footer', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.queryByRole('link', { name: 'Administration' })).toBeNull();
  });
});

describe('current-route navigation semantics', () => {
  it('announces the active section and exact nested page in desktop and mobile navigation', () => {
    const department = departments[0];
    const path = `/departments/${department.slug}`;
    render(<MemoryRouter initialEntries={[path]}><Header /></MemoryRouter>);

    const desktopNavigation = screen.getByRole('navigation', { name: 'Main navigation' });
    const desktopDepartmentsLink = within(desktopNavigation).getByRole('link', { name: 'Departments', exact: true });
    expect(desktopDepartmentsLink.getAttribute('aria-current')).toBe('location');
    fireEvent.mouseEnter(desktopDepartmentsLink.parentElement!);
    const desktopDepartmentPageLink = desktopNavigation.querySelector<HTMLAnchorElement>(`a[href="${path}"]`);
    expect(desktopDepartmentPageLink?.getAttribute('aria-current')).toBe('page');

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' });
    const mobileDepartmentsLink = within(mobileNavigation).getByRole('link', { name: 'Departments', exact: true });
    expect(mobileDepartmentsLink.getAttribute('aria-current')).toBe('location');
    fireEvent.click(within(mobileNavigation).getByRole('button', { name: 'Expand Departments submenu' }));
    const mobileDepartmentPageLink = mobileNavigation.querySelector<HTMLAnchorElement>(`a[href="${path}"]`);
    expect(mobileDepartmentPageLink?.getAttribute('aria-current')).toBe('page');
  });

  it.each(['/about-us', '/departments-extra', '/cpd-courses-extra'])('does not activate a navigation link for prefix-collision route %s', (path) => {
    render(<MemoryRouter initialEntries={[path]}><Header /></MemoryRouter>);
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
    for (const link of within(navigation).getAllByRole('link')) {
      expect(link.getAttribute('aria-current')).toBeNull();
      expect(link.className).not.toContain('bg-surface-50 text-navy-900');
    }
  });
});

describe('SPA route focus', () => {
  it('moves focus to the main landmark after pathname changes without stealing initial focus', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    try {
      render(
        <MemoryRouter initialEntries={['/first']}>
          <ScrollToTop />
          <nav><Link to="/second">Open second page</Link></nav>
          <main id="main-content" tabIndex={-1}>
            <Routes>
              <Route path="/first" element={<h1>First page</h1>} />
              <Route path="/second" element={<h1>Second page</h1>} />
            </Routes>
          </main>
        </MemoryRouter>,
      );
      const main = screen.getByRole('main');
      expect(document.activeElement).not.toBe(main);
      expect(scrollTo).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('link', { name: 'Open second page' }));
      await screen.findByRole('heading', { name: 'Second page' });
      await waitFor(() => expect(document.activeElement).toBe(main));
      expect(scrollTo).toHaveBeenCalledTimes(2);
    } finally {
      scrollTo.mockRestore();
    }
  });
});

describe('hash navigation', () => {
  it('waits for a lazy hash target and preserves anchor scrolling instead of focusing main', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const requestDescriptor = Object.getOwnPropertyDescriptor(window, 'requestAnimationFrame');
    const cancelDescriptor = Object.getOwnPropertyDescriptor(window, 'cancelAnimationFrame');
    const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
    const scrollIntoView = vi.fn();
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: (callback: FrameRequestCallback) => { callback(0); return 1; },
    });
    Object.defineProperty(window, 'cancelAnimationFrame', { configurable: true, value: () => {} });
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    let unmount = () => {};
    try {
      const rendered = render(
        <MemoryRouter initialEntries={['/first']}>
          <ScrollToTop />
          <nav><Link to="/second#late-target">Open anchor</Link></nav>
          <main id="main-content" tabIndex={-1}>
            <Routes>
              <Route path="/first" element={<h1>First page</h1>} />
              <Route path="/second" element={<DelayedHashTarget />} />
            </Routes>
          </main>
        </MemoryRouter>,
      );
      unmount = rendered.unmount;
      const main = screen.getByRole('main');
      expect(document.activeElement).not.toBe(main);
      expect(scrollTo).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('link', { name: 'Open anchor' }));
      await screen.findByText('Delayed anchor target');
      await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' }));
      expect(scrollTo).toHaveBeenCalledTimes(1);
      expect(document.activeElement).not.toBe(main);
    } finally {
      unmount();
      scrollTo.mockRestore();
      if (requestDescriptor) Object.defineProperty(window, 'requestAnimationFrame', requestDescriptor);
      else Reflect.deleteProperty(window, 'requestAnimationFrame');
      if (cancelDescriptor) Object.defineProperty(window, 'cancelAnimationFrame', cancelDescriptor);
      else Reflect.deleteProperty(window, 'cancelAnimationFrame');
      if (scrollIntoViewDescriptor) Object.defineProperty(Element.prototype, 'scrollIntoView', scrollIntoViewDescriptor);
      else Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
    }
  });
});

describe('mobile menu keyboard handling', () => {
  it('contains tab navigation and returns focus on Escape', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
    const finalLink = within(nav).getByRole('link', { name: 'Student access' });
    finalLink.focus(); fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(toggle);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull();
    expect(document.activeElement).toBe(toggle);
    expect(document.body.style.overflow).toBe('');
  });

  it('resets submenus when the menu closes and exposes stable, accurate controls', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(toggle);
    const expand = screen.getByRole('button', { name: 'Expand Departments submenu' });
    expect(expand.getAttribute('aria-controls')).toBe('mobile-submenu-departments');
    fireEvent.click(expand);
    expect(screen.getByRole('button', { name: 'Collapse Departments submenu' }).getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('mobile-submenu-departments')).toBeTruthy();
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.queryByRole('button', { name: 'Collapse Departments submenu' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Expand Departments submenu' })).toBeTruthy();
  });
});
