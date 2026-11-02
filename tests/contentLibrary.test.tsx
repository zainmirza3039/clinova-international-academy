import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { educationalArticles, getEducationalArticle } from '@/data/educationalArticles';
import { learningResources } from '@/data/learningResources';
import { programmes } from '@/data/programmes';
import { newsItems } from '@/data/testimonials';
import { departments } from '@/data/departments';
import { publishedCPDCourses } from '@/data/cpdCourses';
import { getCPDCurriculum } from '@/data/cpdCurricula';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import ProgrammesPage from '@/pages/ProgrammesPage';
import { ResourcesPage, ResourceDetailPage } from '@/pages/ResourcesPage';
import LearningResourcesPage, { LearningResourceDetailPage } from '@/pages/LearningResourcesPage';
import ContactPage from '@/pages/ContactPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import DepartmentDetailPage from '@/pages/DepartmentDetailPage';
import Footer from '@/components/Footer';
import { academyLegalIdentity, academyPakistanAgentPhone, academyPublicAddress } from '@/data/publicContact';

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
  it('filters only by exact published course subject, level and study-format values', () => {
    render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    const department = screen.getByLabelText('Department') as HTMLSelectElement;
    const level = screen.getByLabelText('Level') as HTMLSelectElement;
    const format = screen.getByLabelText('Study format') as HTMLSelectElement;

    expect(Array.from(department.options).slice(1).map((option) => option.value)).toEqual([...new Set(publishedCPDCourses.map((course) => course.department))]);
    expect(Array.from(level.options).slice(1).map((option) => option.value)).toEqual([...new Set(publishedCPDCourses.map((course) => course.level))]);
    expect(Array.from(format.options).slice(1).map((option) => option.value)).toEqual([...new Set(publishedCPDCourses.map((course) => course.duration))]);

    fireEvent.change(department, { target: { value: 'Physical Therapy & Rehabilitation' } });
    fireEvent.change(level, { target: { value: 'Advanced' } });
    fireEvent.change(format, { target: { value: 'Self-paced study' } });

    expect(screen.getByRole('heading', { name: 'Motor Control & Relearning in Neurorehabilitation' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('1 of 1 matching self-study course');
    expect(screen.getByRole('link', { name: /Motor Control & Relearning in Neurorehabilitation/ }).getAttribute('href')).toBe('/cpd-courses/motor-control-relearning-in-neurorehabilitation');
  });
  it('shows the recorded study format on course cards and links to course details', () => {
    render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    const course = publishedCPDCourses[0];
    const card = document.querySelector<HTMLAnchorElement>(`a[href="/cpd-courses/${course.slug}"]`);
    expect(card).toBeTruthy();
    expect(card?.textContent).toContain(course.duration);
    expect(card?.textContent).toContain('View course details');
  });
  it('searches existing curriculum audience text and can clear a no-result search', () => {
    render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    const course = publishedCPDCourses.find((item) => (getCPDCurriculum(item.slug)?.intendedAudience.length ?? 0) > 0)!;
    const audienceText = getCPDCurriculum(course.slug)!.intendedAudience[0];
    const search = screen.getByLabelText('Search titles, professions, topics or learning content...');

    fireEvent.change(search, { target: { value: audienceText } });
    expect(Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/cpd-courses/"]')).some((link) => link.getAttribute('href') === `/cpd-courses/${course.slug}`)).toBe(true);
    fireEvent.change(search, { target: { value: 'no-existing-course-topic-2046' } });
    expect(screen.getByRole('status').textContent).toContain('0 of 0 matching self-study courses');
    fireEvent.click(screen.getAllByRole('button', { name: 'Clear search and filters' }).at(-1)!);
    expect(screen.getByRole('status').textContent).toContain(`8 of ${publishedCPDCourses.length} matching self-study courses`);
  });
  it('does not invent instructor assignments or expose enrollment, payment or learner-state controls', () => {
    const { container } = render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect((screen.getByLabelText('Instructor') as HTMLSelectElement).disabled).toBe(true);
    expect(screen.getByText('Instructor assignments are not included in these course records.')).toBeTruthy();
    expect((screen.getByLabelText('CPD credit') as HTMLSelectElement).disabled).toBe(true);
    expect(container.querySelector('form, input[type="password"], input[type="number"], button[type="submit"]')).toBeNull();
    expect(container.querySelector('a[href^="/sign-up"], a[href^="/student"], a[href*="checkout"], a[href*="enrol"]')).toBeNull();
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
  it('publishes the confirmed legal identity and labels the office virtual while keeping the phone optional and secondary', () => {
    const { container } = render(<MemoryRouter><ContactPage /><Footer /></MemoryRouter>);
    const expectedCopyrightNotice = [
      'This website and its content are copyright of Clinova International Academy – © Clinova International Academy 2024. All rights reserved.',
      'Any redistribution or reproduction of part or all of the contents in any form is prohibited other than the following:',
      'You may print or download extracts to a local hard disk for your personal and non-commercial use only.',
      'You may copy the content to individual third parties for their personal use, provided that you acknowledge clinova International Academy as the source of the material.',
      'You may not, except with our express written permission, distribute or commercially exploit the content. Nor may you transmit it or store it in any other website or other form of electronic retrieval system.',
    ].join(' ');
    expect(academyPublicAddress).toBe('1 Unity St, Bristol BS1 5HH, United Kingdom');
    expect(academyLegalIdentity.legalName).toBe('Clinova International Academy Ltd');
    expect(academyLegalIdentity.acronym).toBe('Clinova / CIA');
    expect(academyLegalIdentity.companyNumber).toBe('16048192');
    expect(academyLegalIdentity.incorporationDate).toBe('2025-10-14');
    expect(academyPakistanAgentPhone).toBe('0306-9633353');
    expect(screen.getAllByText(academyPublicAddress)).toHaveLength(2);
    expect(screen.getAllByText('Registered office (virtual address)')).toHaveLength(2);
    expect(container.textContent).toContain('Not a campus, visiting location, or public-facing venue.');
    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toContain(expectedCopyrightNotice);
    expect(container.textContent).toContain('14 October 2025');
    expect(screen.queryByRole('button', { name: /send message/i })).toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.getByText(/No verified public email address or online enquiry submission is available/)).toBeTruthy();
    expect(screen.getByText('Optional secondary phone · Pakistan local agent')).toBeTruthy();
    expect(screen.getByText(academyPakistanAgentPhone)).toBeTruthy();
    expect(container.querySelector('a[href^="tel:"]')?.getAttribute('href')).toBe('tel:03069633353');
    expect(container.textContent!.indexOf('Registered office (virtual address)')).toBeLessThan(container.textContent!.indexOf('Optional secondary phone · Pakistan local agent'));
  });
});
