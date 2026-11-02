import { learningResources } from '@/data/learningResources';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import App from '@/App';
import { programmes } from '@/data/programmes';
import { departments } from '@/data/departments';
import { cpdCourses } from '@/data/cpdCourses';
import { educationalArticles } from '@/data/educationalArticles';
import { newsItems } from '@/data/testimonials';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }), useScrollPosition: () => false }));
beforeEach(() => { vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const routes = [
  '/', '/about', '/departments', '/programmes', '/courses', '/cpd-courses', '/online-learning',
  '/clinical-internships', '/training-partners', '/for-institutions', '/become-an-instructor',
  '/instructor', '/institution', '/resources', '/blog', '/announcements', '/contact',
  '/admissions', '/apply', '/application', '/apply-certification', '/admin', '/admin/applications',
  '/events', '/faculty', '/community', '/faqs', '/privacy-policy', '/terms-and-conditions',
  '/cookie-policy', '/refund-policy', '/verify', '/certification', '/certification/verify',
  '/certification/policies', '/certification/unknown', '/assessment', '/quality-assurance',
  '/certification-and-cpd-policy', '/candidate-dashboard', '/assessor-dashboard',
  '/certification-panel', '/faculty-dashboard', '/missing-page',
  '/accessibility-statement', '/external-linking-policy',
  ...learningResources.map(resource => `/learning-resources/${resource.slug}`),
  ...programmes.map(record => `/programmes/${record.slug}`),
  ...programmes.map(record => `/courses/${record.slug}`),
  ...departments.map(record => `/departments/${record.slug}`),
  ...cpdCourses.map(record => `/cpd-courses/${record.slug}`),
  ...newsItems.map(record => `/resources/${record.slug}`),
  ...newsItems.map(record => `/blog/${record.slug}`),
];
const articleTitles = new Map<string, string>(educationalArticles.flatMap(record => [
  [`/resources/${record.slug}`, record.title] as [string, string],
  [`/blog/${record.slug}`, record.title] as [string, string],
]));

describe('public route rendering without live infrastructure', () => {
  it.each(routes)('%s renders an accessible heading and preview metadata', async (route) => {
    window.history.replaceState({}, '', route);
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent?.trim().length).toBeGreaterThan(0);
      const expectedTitle = articleTitles.get(route);
      if (expectedTitle) expect(container.querySelector('h1')?.textContent?.trim()).toBe(expectedTitle);
      expect(document.title).toContain('Clinova');
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    });
    expect(container.querySelector('#main-content')).not.toBeNull();
    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(container.textContent).not.toContain('This page could not be loaded');
  });
});
