import { learningResources } from '@/data/learningResources';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import App from '@/App';
import { programmes } from '@/data/programmes';
import { departments } from '@/data/departments';
import { cpdCourses } from '@/data/cpdCourses';
import { educationalArticles } from '@/data/educationalArticles';
import { newsItems } from '@/data/testimonials';
import { siteOrigin } from '@/lib/siteConfig';
import { getIndexableSeoRoute } from '@/lib/seoPolicy';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }), useScrollPosition: () => false }));
vi.mock('@/auth/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/auth/AuthProvider')>();
  return { ...actual, AuthProvider: ({ children }: { children: React.ReactNode }) => children };
});
vi.mock('@/auth/authContext',()=>({useAuth:()=>({enabled:false,status:'disabled',session:null,emailVerified:false,error:null,signOut:vi.fn()})}));
vi.mock('@/lib/cms',()=>({fetchPublishedCmsContent:vi.fn().mockResolvedValue([])}));
type SupabaseQueryMock = { select: () => SupabaseQueryMock; order: () => Promise<{ data: unknown[]; error: null }> };
function createSupabaseQueryMock(): SupabaseQueryMock {
  const query: SupabaseQueryMock = { select: () => query, order: () => Promise.resolve({ data: [], error: null }) };
  return query;
}
vi.mock('@/lib/supabase',()=>({supabase:{from:vi.fn(()=>createSupabaseQueryMock())}}));
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
  it.each(routes)('%s renders an accessible heading and obeys the SEO allowlist', async (route) => {
    const indexableRoute = siteOrigin ? getIndexableSeoRoute(route) : undefined;
    window.history.replaceState({}, '', route);
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent?.trim().length).toBeGreaterThan(0);
      const expectedTitle = articleTitles.get(route);
      if (expectedTitle) expect(container.querySelector('h1')?.textContent?.trim()).toBe(expectedTitle);
      expect(document.title).toContain('Clinova');
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
        indexableRoute ? 'index, follow' : 'noindex, nofollow',
      );
    });
    expect(container.querySelector('#main-content')).not.toBeNull();
    expect(container.querySelectorAll('main')).toHaveLength(1);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (indexableRoute && siteOrigin) {
      expect(canonical?.getAttribute('href')).toBe(`${siteOrigin}${indexableRoute.path}`);
    } else {
      expect(canonical).toBeNull();
    }
    expect(container.textContent).not.toContain('This page could not be loaded');
  });
});
