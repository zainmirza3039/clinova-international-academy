// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import ProgrammesPage from '@/pages/ProgrammesPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import NotFoundPage from '@/pages/NotFoundPage';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
const config = vi.hoisted(() => ({ siteOrigin: 'https://academy.example' as string | undefined }));
vi.mock('@/lib/siteConfig', () => config);
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }), useScrollPosition: () => false }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; });
beforeEach(() => { config.siteOrigin = 'https://academy.example'; });
function SEOProbe({ noindex = false }: { noindex?: boolean }) {
  useSEO({ title: 'Test route', description: 'Test-only metadata', noindex });
  return <p>test</p>;
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

  it('hides catalogue filters until there are approved public records', () => {
    render(<MemoryRouter><ProgrammesPage /></MemoryRouter>);
    expect(screen.queryByLabelText('Programme Type')).toBeNull();
    expect(screen.getByText(/No programmes are currently approved for publication/)).toBeTruthy();
    cleanup();
    render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect(screen.queryByLabelText('CPD Hours')).toBeNull();
    expect(screen.getByText(/No CPD courses are currently approved for publication/)).toBeTruthy();
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
