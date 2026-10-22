import { learningResources } from '@/data/learningResources';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import App from '@/App';
import { programmes } from '@/data/programmes';
import { departments } from '@/data/departments';
import { cpdCourses } from '@/data/cpdCourses';
import { newsItems } from '@/data/testimonials';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }), useScrollPosition: () => false }));
beforeEach(() => { vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const routes = ['/learning-resources', ...learningResources.map(resource => `/learning-resources/${resource.slug}`), '/', '/about', '/departments', '/programmes', '/courses', '/cpd-courses', '/online-learning', '/training-partners', '/resources', '/blog', '/announcements', '/contact', '/admissions', '/apply', '/application', '/admin', '/admin/applications', '/events', '/faculty', '/community', '/faqs', '/privacy-policy', '/terms-and-conditions', '/cookie-policy', '/refund-policy', '/verify', '/missing-page', ...programmes.map(p => `/programmes/${p.slug}`), ...departments.map(p => `/departments/${p.slug}`), ...cpdCourses.map(p => `/cpd-courses/${p.slug}`), ...newsItems.map(p => `/resources/${p.slug}`)];
describe('public route rendering without live infrastructure', () => {
  it.each(routes)('%s renders an accessible heading and preview metadata', async (route) => {
    window.history.replaceState({}, '', route);
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent?.trim().length).toBeGreaterThan(0);
      expect(document.title).toContain('Clinova');
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    });
    expect(container.querySelector('#main-content')).not.toBeNull();
    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(document.title).toContain('Clinova');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(container.textContent).not.toContain('This page could not be loaded');
    expect(container.textContent).not.toContain('info@clinovaacademy');
  });
});
