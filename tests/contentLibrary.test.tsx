import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { educationalArticles, getEducationalArticle } from '@/data/educationalArticles';
import { learningResources } from '@/data/learningResources';
import { programmes } from '@/data/programmes';
import { newsItems } from '@/data/resourceDrafts';
import { departments } from '@/data/departments';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import ProgrammesPage from '@/pages/ProgrammesPage';
import { ResourcesPage, ResourceDetailPage } from '@/pages/ResourcesPage';
import LearningResourcesPage, { LearningResourceDetailPage } from '@/pages/LearningResourcesPage';
import ContactPage from '@/pages/ContactPage';
import Footer from '@/components/Footer';
import { academyPublicAddress } from '@/data/publicContact';

vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; });
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

describe('substantive original draft library structure', () => {
  it('contains fifteen unique substantial referenced drafts, without fabricated publication fields', () => {
    expect(educationalArticles).toHaveLength(15);
    expect(newsItems.map(item => item.slug)).toEqual(educationalArticles.map(article => article.slug));
    for (const article of educationalArticles) { const card = newsItems.find(item => item.slug === article.slug); expect(card?.title).toBe(article.title); expect(card?.excerpt).toBe(article.excerpt); expect(card?.category).toBe(article.category); }
    expect(new Set(educationalArticles.map(article => article.slug)).size).toBe(15);
    expect(new Set(educationalArticles.map(article => article.title)).size).toBe(15);
    for (const article of educationalArticles) {
      expect(article.status).toBe('draft');
      expect(article.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(article.sections.length).toBeGreaterThanOrEqual(4);
      expect(wordCount(article.sections.flatMap(section => section.paragraphs).join(' '))).toBeGreaterThanOrEqual(800);
      expect(article.takeaways.length).toBeGreaterThanOrEqual(3);
      expect(article.references.length).toBeGreaterThanOrEqual(1);
      expect(article.seoTitle.length).toBeGreaterThan(15);
      expect(article.seoDescription.length).toBeGreaterThan(50);
      expect(JSON.stringify(article)).not.toMatch(/lorem ipsum|content coming soon|TODO/i);
      expect(article).not.toHaveProperty('author');
      expect(article).not.toHaveProperty('publishedAt');
      for (const reference of article.references) expect(new URL(reference.url).protocol).toBe('https:');
      for (const slug of article.relatedArticleSlugs) expect(getEducationalArticle(slug)).toBeTruthy();
      for (const slug of article.relatedProgrammeSlugs) expect(programmes.some(programme => programme.slug === slug)).toBe(true);
    }
  });
  it('preserves the three earlier draft article addresses as aliases', () => {
    for (const slug of ['draft-cpd-in-healthcare-practice', 'draft-evidence-informed-pain-management', 'draft-clinical-communication']) expect(getEducationalArticle(slug)).toBeTruthy();
  });
  it('blocks draft article detail routes until publication approval', () => {
    const article = educationalArticles[0];
    render(<MemoryRouter initialEntries={[`/resources/${article.slug}`]}><Routes><Route path="/resources/:slug" element={<ResourceDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: 'Article Not Found' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Article contents' })).toBeNull();
    expect(screen.queryByText(article.sections[0].paragraphs[0])).toBeNull();
  });
  it('does not list draft articles in the public resource library', () => {
    render(<MemoryRouter><ResourcesPage /></MemoryRouter>);
    expect(screen.getByRole('status').textContent).toContain('0 articles');
    expect(screen.getByText('Articles are being prepared for publication.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: educationalArticles[0].title })).toBeNull();
    expect(screen.queryByLabelText('Search resources')).toBeNull();
  });
});

describe('reading-based resources and confirmed contact fact', () => {
  it('uses actual draft catalogue counts rather than fabricated department totals', () => {
    for (const department of departments) expect(department.programmeCount).toBe(programmes.filter(programme => programme.departmentSlug === department.slug).length);
  });
  it('hides empty catalogue filters while no programmes or CPD courses are approved', () => {
    const cpd = render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect(cpd.queryByLabelText('CPD Hours')).toBeNull();
    expect(screen.getByText(/No CPD courses are currently approved for publication/)).toBeTruthy();
    cleanup();
    render(<MemoryRouter><ProgrammesPage /></MemoryRouter>);
    expect(screen.queryByLabelText('Duration')).toBeNull();
    expect(screen.queryByLabelText('Delivery')).toBeNull();
    expect(screen.getByText(/No programmes are currently approved for publication/)).toBeTruthy();
  });
  it('provides six substantive study resources with prompts, sources and valid reading links', () => {
    expect(learningResources).toHaveLength(6);
    for (const programme of programmes) { expect(programme.publicationStatus).toBe('draft'); expect(programme.cpdHours).toBeNull(); expect(programme.duration).toBe('Awaiting confirmation'); }
    for (const resource of learningResources) {
      expect(wordCount(resource.sections.flatMap(section => section.paragraphs).join(' '))).toBeGreaterThan(140);
      expect(resource.prompts.length).toBeGreaterThanOrEqual(4);
      for (const slug of resource.relatedArticleSlugs) expect(getEducationalArticle(slug)).toBeTruthy();
    }
  });
  it('keeps unapproved study resources out of the public library', () => {
    render(<MemoryRouter><LearningResourcesPage /></MemoryRouter>);
    expect(screen.getByRole('status').textContent).toContain('0 resources');
    expect(screen.getByText(/Study resources are being prepared for publication/)).toBeTruthy();
    expect(screen.queryByLabelText('Search study tools')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Clinical Reasoning Glossary and Revision Notes' })).toBeNull();
  });
  it('blocks unapproved study-resource detail routes', () => {
    const resource = learningResources[0];
    const { container } = render(<MemoryRouter initialEntries={[`/learning-resources/${resource.slug}`]}><Routes><Route path="/learning-resources/:slug" element={<LearningResourceDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Study Resource Not Found' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Reflection prompts' })).toBeNull();
    expect(container.querySelector('form,input,textarea,[download]')).toBeNull();
  });
  it('shows only the owner-confirmed address while contact submission remains disabled', () => {
    render(<MemoryRouter><ContactPage /><Footer /></MemoryRouter>);
    expect(academyPublicAddress).toBe('1 Unity St, Bristol BS1 5HH, United Kingdom');
    expect(screen.getAllByText(academyPublicAddress)).toHaveLength(2);
    expect((screen.getByRole('button', { name: 'Send Message' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Visiting arrangements and opening hours have not been confirmed/)).toBeTruthy();
  });
});
