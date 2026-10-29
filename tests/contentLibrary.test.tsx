import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { educationalArticles, getEducationalArticle } from '@/data/educationalArticles';
import { learningResources } from '@/data/learningResources';
import { programmes } from '@/data/programmes';
import { newsItems } from '@/data/testimonials';
import { departments } from '@/data/departments';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import ProgrammesPage from '@/pages/ProgrammesPage';
import { ResourcesPage, ResourceDetailPage } from '@/pages/ResourcesPage';
import LearningResourcesPage, { LearningResourceDetailPage } from '@/pages/LearningResourcesPage';
import ContactPage from '@/pages/ContactPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import DepartmentDetailPage from '@/pages/DepartmentDetailPage';
import Footer from '@/components/Footer';
import { academyPublicAddress } from '@/data/publicContact';

vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; });
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

describe('substantive published educational library', () => {
  it('contains fifteen unique substantial referenced articles, without fabricated publication fields', () => {
    expect(educationalArticles).toHaveLength(15);
    expect(newsItems.map(item => item.slug)).toEqual(educationalArticles.map(article => article.slug));
    for (const article of educationalArticles) { const card = newsItems.find(item => item.slug === article.slug); expect(card?.title).toBe(article.title); expect(card?.excerpt).toBe(article.excerpt); expect(card?.category).toBe(article.category); }
    expect(new Set(educationalArticles.map(article => article.slug)).size).toBe(15);
    expect(new Set(educationalArticles.map(article => article.title)).size).toBe(15);
    for (const article of educationalArticles) {
      expect(article.status).toBe('published');
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
  it('renders full sections, safety status and reference links instead of placeholder paragraphs', () => {
    const article = educationalArticles[0];
    render(<MemoryRouter initialEntries={[`/resources/${article.slug}`]}><Routes><Route path="/resources/:slug" element={<ResourceDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: article.title })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Article contents' })).toBeTruthy();
    expect(screen.getByText('For educational use only.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'References and further reading' })).toBeTruthy();
    expect(screen.getByText(article.sections[0].paragraphs[0])).toBeTruthy();
    expect(screen.queryByText(/This is a sample article/)).toBeNull();
  });
  it('searches the article body and can clear an empty search', () => {
    render(<MemoryRouter><ResourcesPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Search resources'), { target: { value: 'unfindable-phrase-123' } });
    expect(screen.getByRole('status').textContent).toContain('0 educational articles');
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('status').textContent).toContain('15 educational articles');
    const phrase = educationalArticles[0].sections[0].paragraphs[0].split(/\s+/).slice(4, 12).join(' ');
    fireEvent.change(screen.getByLabelText('Search resources'), { target: { value: phrase } });
    expect(screen.getByRole('link', { name: new RegExp(educationalArticles[0].title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toBeTruthy();
  });
});

describe('reading-based resources and confirmed contact fact', () => {
  it('uses actual published catalogue counts rather than fabricated department totals', () => {
    for (const department of departments) expect(department.programmeCount).toBe(programmes.filter(programme => programme.departmentSlug === department.slug).length);
  });
  it('routes department-page calls to action to the article and study-tool libraries', () => {
    render(<MemoryRouter><DepartmentsPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Browse educational articles' }).getAttribute('href')).toBe('/resources');
    expect(screen.getByRole('link', { name: 'Explore study tools' }).getAttribute('href')).toBe('/learning-resources');
  });
  it('does not present physiotherapy articles as related to every subject area', () => {
    render(<MemoryRouter initialEntries={['/departments/medicine']}><Routes><Route path="/departments/:slug" element={<DepartmentDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Medicine' })).toBeTruthy();
    expect(screen.getByText(/not a department-specific curriculum/i)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /read overview/i })).toBeNull();
    expect(screen.getByRole('link', { name: 'Browse educational articles' }).getAttribute('href')).toBe('/resources');
    expect(screen.getByRole('link', { name: 'Explore study tools' }).getAttribute('href')).toBe('/learning-resources');
  });
  it('does not allow filtering on unconfirmed CPD hours or course delivery estimates', () => {
    const cpd = render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect((cpd.getByLabelText('CPD credit') as HTMLSelectElement).disabled).toBe(true);
    expect(cpd.container.querySelector('option[value="10"]')).toBeNull();
    cleanup();
    render(<MemoryRouter><ProgrammesPage /></MemoryRouter>);
    expect(screen.queryByLabelText('Duration')).toBeNull();
    expect(screen.queryByLabelText('Delivery')).toBeNull();
  });
  it('provides six substantive study resources with prompts, sources and valid reading links', () => {
    expect(learningResources).toHaveLength(6);
    for (const programme of programmes) { expect(programme.publicationStatus).toBe('published'); expect(programme.cpdHours).toBeNull(); expect(programme.duration).toBe('Awaiting confirmation'); }
    for (const resource of learningResources) {
      expect(wordCount(resource.sections.flatMap(section => section.paragraphs).join(' '))).toBeGreaterThan(140);
      expect(resource.prompts.length).toBeGreaterThanOrEqual(4);
      for (const slug of resource.relatedArticleSlugs) expect(getEducationalArticle(slug)).toBeTruthy();
    }
  });
  it('filters study tools and gives a meaningful empty state', () => {
    render(<MemoryRouter><LearningResourcesPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Search study tools'), { target: { value: 'glossary' } });
    expect(screen.getByRole('status').textContent).toContain('1 learning resource');
    expect(screen.getByRole('heading', { name: 'Clinical Reasoning Glossary and Revision Notes' })).toBeTruthy();
  });
  it('does not provide fake downloads, forms or completion tracking on a resource page', () => {
    const resource = learningResources[0];
    const { container } = render(<MemoryRouter initialEntries={[`/learning-resources/${resource.slug}`]}><Routes><Route path="/learning-resources/:slug" element={<LearningResourceDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Reflection prompts' })).toBeTruthy();
    expect(container.querySelector('form,input,textarea,[download]')).toBeNull();
    expect(screen.getByText(/No patient-data collection/)).toBeTruthy();
  });
  it('shows only the owner-confirmed address while contact submission remains disabled', () => {
    render(<MemoryRouter><ContactPage /><Footer /></MemoryRouter>);
    expect(academyPublicAddress).toBe('1 Unity St, Bristol BS1 5HH, United Kingdom');
    expect(screen.getAllByText(academyPublicAddress)).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /send message/i })).toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.getByText(/Online contact and partnership submissions are not currently available/)).toBeTruthy();
    expect(screen.getByText(/Visiting arrangements and opening hours are not published/)).toBeTruthy();
  });
});
