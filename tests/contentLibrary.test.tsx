import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { educationalArticles, getEducationalArticle } from '@/data/educationalArticles';
import { learningResources } from '@/data/learningResources';
import { programmes } from '@/data/programmes';
import { departments } from '@/data/departments';
import { cpdCourses, publishedCPDCourses } from '@/data/cpdCourses';
import { publishedProgrammes } from '@/data/programmes';
import { newsItems } from '@/data/testimonials';
import { ResourcesPage, ResourceDetailPage } from '@/pages/ResourcesPage';
import LearningResourcesPage, { LearningResourceDetailPage } from '@/pages/LearningResourcesPage';
import ContactPage from '@/pages/ContactPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import DepartmentDetailPage from '@/pages/DepartmentDetailPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import ProgrammesPage from '@/pages/ProgrammesPage';
import { ownerListedProgrammes } from '@/data/programmeCatalogueBrowse';
import Footer from '@/components/Footer';
import { academyLegalIdentity, academyPakistanAgentPhone, academyPublicAddress } from '@/data/publicContact';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; });
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

describe('published educational article library', () => {
  it('contains fifteen unique substantive articles with external references and no fabricated publication fields', () => {
    expect(educationalArticles).toHaveLength(15);
    expect(newsItems.map(item => item.slug)).toEqual(educationalArticles.map(article => article.slug));
    for (const article of educationalArticles) {
      const card = newsItems.find(item => item.slug === article.slug);
      expect(card?.title).toBe(article.title); expect(card?.excerpt).toBe(article.excerpt); expect(card?.category).toBe(article.category);
      expect(article.status).toBe('published'); expect(article.sections.length).toBeGreaterThanOrEqual(4);
      expect(wordCount(article.sections.flatMap(section => section.paragraphs).join(' '))).toBeGreaterThanOrEqual(800);
      expect(article.takeaways.length).toBeGreaterThanOrEqual(3); expect(article.references.length).toBeGreaterThanOrEqual(1);
      expect(article).not.toHaveProperty('author'); expect(article).not.toHaveProperty('publishedAt');
      for (const reference of article.references) expect(new URL(reference.url).protocol).toBe('https:');
      for (const slug of article.relatedArticleSlugs) expect(getEducationalArticle(slug)).toBeTruthy();
    }
  });
  it('renders full article content, references and educational-use disclaimer', () => {
    const article = educationalArticles[0];
    render(<MemoryRouter initialEntries={[`/resources/${article.slug}`]}><Routes><Route path="/resources/:slug" element={<ResourceDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: article.title })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Article contents' })).toBeTruthy();
    expect(screen.getByText('For educational use only.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'References and further reading' })).toBeTruthy();
  });
  it('searches article text and supports clearing filters', () => {
    render(<MemoryRouter><ResourcesPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Search resources'), { target: { value: 'unfindable-phrase-123' } });
    expect(screen.getByText(/Showing 0 educational articles/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText(/Showing 15 educational articles/)).toBeTruthy();
  });
});

describe('draft-only programme data and non-course reading resources', () => {
  it('keeps every legacy catalogue and curriculum row out of public publication', () => {
    expect(programmes.length).toBeGreaterThan(0); expect(cpdCourses.length).toBeGreaterThan(0);
    expect(programmes.every(item => item.publicationStatus === 'draft' && item.status === 'Draft')).toBe(true);
    expect(cpdCourses.every(item => item.publicationStatus === 'draft')).toBe(true);
    expect(publishedProgrammes).toHaveLength(0); expect(publishedCPDCourses).toHaveLength(0);
    for (const department of departments) expect(department).not.toHaveProperty('programmeCount');
  });
  it('shows only owner-listed CPD topic titles and no unapproved course details', () => {
    const { container } = render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect(container.textContent).toMatch(/no cpd course enrollment is available/i);
    expect(container.querySelectorAll('a[href^="/cpd-courses/"]')).toHaveLength(12);
    expect(container.querySelector('select')).not.toBeNull();
    expect(container.querySelector('input[type="search"]')).not.toBeNull();
    expect(container.textContent).toContain('Clinical Assessment of Low Back Pain');
    expect(container.textContent).not.toContain(cpdCourses.find((item) => item.id === 'c13')!.title);
    expect(container.querySelector('form,input[type="email"],input[type="password"],button[type="submit"]')).toBeNull();
  });
  it('shows proposed title-only programme entries without offers or unapproved delivery estimates', () => {
    const { container } = render(<MemoryRouter><ProgrammesPage /></MemoryRouter>);
    expect(container.textContent).toMatch(/programme enrolment is not open/i);
    for (const programme of ownerListedProgrammes) expect(container.textContent).toContain(programme.title);
    for (const source of programmes) {
      expect(container.textContent).not.toContain(source.title);
      expect(container.textContent).not.toContain(source.description);
      expect(container.textContent).not.toContain(source.overview);
      expect(container.textContent).not.toContain(source.duration);
      expect(container.textContent).not.toContain(source.delivery);
    }
    expect(container.querySelectorAll('a[href^="/programmes/"]')).toHaveLength(8);
    expect(container.querySelector('input[type="search"]')).not.toBeNull();
    expect(container.textContent).not.toMatch(/\b\d+\s+(?:weeks|months|CPD hours)\b/i);
  });
  it('keeps subject-area pages informational and removes legacy course titles', () => {
    render(<MemoryRouter><DepartmentsPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Proposed healthcare subject areas' })).toBeTruthy();
    expect(screen.getByText(/do not establish an academic department/i)).toBeTruthy();
    cleanup();
    const { container } = render(<MemoryRouter initialEntries={['/departments/medicine']}><Routes><Route path="/departments/:slug" element={<DepartmentDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Medicine' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Proposed learning areas' })).toBeTruthy();
    expect(container.textContent).toMatch(/information only/i);
    expect(container.querySelector('a[href^="/programmes/"]')).toBeNull();
  });
  it('preserves educational tools without turning them into an enrollment or completion service', () => {
    expect(learningResources).toHaveLength(6);
    for (const resource of learningResources) expect(wordCount(resource.sections.flatMap(section => section.paragraphs).join(' '))).toBeGreaterThan(140);
    render(<MemoryRouter><LearningResourcesPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Search study tools'), { target: { value: 'glossary' } });
    expect(screen.getByText(/Showing 1 learning resource/)).toBeTruthy();
    cleanup();
    const resource = learningResources[0];
    const { container } = render(<MemoryRouter initialEntries={[`/learning-resources/${resource.slug}`]}><Routes><Route path="/learning-resources/:slug" element={<LearningResourceDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Reflection prompts' })).toBeTruthy();
    expect(container.querySelector('form,input,textarea,[download]')).toBeNull();
    expect(container.textContent).toMatch(/No patient-data collection/);
  });
  it('preserves the confirmed Clinova legal identity, office notice and copyright language', () => {
    const { container } = render(<MemoryRouter><ContactPage /><Footer /></MemoryRouter>);
    const expectedCopyrightNotice = [
      'This website and its content are copyright of Clinova International Academy Ltd. © 2026. All rights reserved.',
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
    expect(container.textContent).toContain(academyPublicAddress);
    expect(container.textContent).toContain('Not a campus, visiting location, or public-facing venue.');
    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toContain(expectedCopyrightNotice);
    expect(container.textContent).toContain('14 October 2025');
    expect(container.querySelector('form')).toBeNull();
  });
});
