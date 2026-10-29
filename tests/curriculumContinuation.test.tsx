import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { courseDrafts, getCourseDraft } from '@/data/courseDrafts';
import type { CourseDraft } from '@/data/courseDrafts';
import { cpdCurricula, getCPDCurriculum } from '@/data/cpdCurricula';
import type { CPDCurriculumDraft } from '@/data/cpdCurricula';
import { programmes } from '@/data/programmes';
import { cpdCourses } from '@/data/cpdCourses';
import { educationalArticles } from '@/data/educationalArticles';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';

vi.mock('@/hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
}));

afterEach(() => {
  cleanup();
  document.head.innerHTML = '';
});

const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
const allProgrammeSlugs = programmes.map((programme) => programme.slug);
const allCpdSlugs = cpdCourses.map((course) => course.slug);
const oldProgrammeSlugs = new Set([
  'certificate-in-musculoskeletal-assessment',
  'certificate-in-clinical-pain-management',
]);
const forbiddenRuntimeKeys = /^(delivery|duration|cpdhours|hours|instructor|instructors|fee|fees|price|certificate|certification)$/i;
const dosagePattern = /\b\d+(?:\.\d+)?\s?(?:mg|g|mcg|micrograms?|μg|ml|mL|tablets?|capsules?)\b/i;

function assertCurriculumShape(draft: CourseDraft | CPDCurriculumDraft | undefined, minimumLessonWords: number) {
  expect(draft).toBeTruthy();
  if (!draft) throw new Error('Expected published curriculum to exist');
  expect(draft.status).toBe('published');
  expect(draft.reviewNotice.trim().length).toBeGreaterThan(30);
  expect(draft.outcomes.length).toBeGreaterThanOrEqual(4);
  expect(draft.intendedAudience.length).toBeGreaterThan(0);
  expect(draft.prerequisites.length).toBeGreaterThan(0);
  expect(draft.modules).toHaveLength(3);
  expect(new Set(draft.modules.map((module) => module.title)).size).toBe(3);
  expect(draft.faqs.length).toBeGreaterThanOrEqual(4);
  expect(draft.evidence.length).toBeGreaterThanOrEqual(2);
  expect(draft.relatedArticles.length).toBeGreaterThan(0);

  for (const key of Object.keys(draft)) expect(key).not.toMatch(forbiddenRuntimeKeys);
  for (const module of draft.modules) {
    expect(module.reflectiveActivity.trim().length).toBeGreaterThan(20);
    expect(module.lessons).toHaveLength(2);
    expect(new Set(module.lessons.map((lesson) => lesson.title)).size).toBe(2);
    for (const lesson of module.lessons) {
      expect(wordCount(lesson.text)).toBeGreaterThanOrEqual(minimumLessonWords);
      expect(lesson.text.trim()).toMatch(/[.!?]["'”’)]?$/);
      expect(lesson.text).not.toMatch(/<\/?[a-z][^>]*>/i);
      expect(lesson.text).not.toMatch(/<script\b|javascript:/i);
      expect(lesson.text).not.toMatch(dosagePattern);
    }
  }
  if (minimumLessonWords >= 130) {
    const longSentenceCounts = new Map<string, number>();
    for (const lesson of draft.modules.flatMap((module) => module.lessons)) {
      for (const sentence of lesson.text.split(/(?<=[.!?])\s+/)) {
        const normalized = sentence.trim().toLowerCase();
        if (normalized.length > 100) longSentenceCounts.set(normalized, (longSentenceCounts.get(normalized) ?? 0) + 1);
      }
    }
    expect([...longSentenceCounts.values()].some((count) => count >= 3)).toBe(false);
  }
  for (const article of draft.relatedArticles) {
    expect(educationalArticles.some((candidate) => candidate.slug === article.slug)).toBe(true);
  }
  for (const source of draft.evidence) {
    expect(source.url).toMatch(/^https:\/\/[^\s]+$/);
    expect(source.note.trim().length).toBeGreaterThan(20);
    expect(source.title.trim().length).toBeGreaterThan(8);
  }
}

function assertNoLearnerWorkflow(container: HTMLElement) {
  expect(container.querySelector('form,input,textarea,select,[download],button[type="submit"]')).toBeNull();
  expect(container.querySelector('a[href^="/apply"],a[href^="/student"],a[href^="/sign-up"],a[href*="checkout"],a[href*="enrol"]')).toBeNull();
  expect(container.textContent).not.toMatch(/certificate earned|progress saved|completion recorded/i);
}

describe('complete continuation catalogue and curriculum contracts', () => {
  it('covers exactly every published programme and CPD catalogue slug with one curriculum and no extras', () => {
    expect(Object.keys(courseDrafts).sort()).toEqual([...allProgrammeSlugs].sort());
    expect(Object.keys(cpdCurricula).sort()).toEqual([...allCpdSlugs].sort());
    for (const slug of allProgrammeSlugs) expect(getCourseDraft(slug)?.programmeSlug).toBe(slug);
    for (const slug of allCpdSlugs) expect(getCPDCurriculum(slug)?.courseSlug).toBe(slug);
  });

  it('keeps all programme and CPD curricula substantive, scoped and reviewable', () => {
    for (const slug of allProgrammeSlugs) {
      assertCurriculumShape(getCourseDraft(slug), oldProgrammeSlugs.has(slug) ? 100 : 130);
    }
    for (const slug of allCpdSlugs) assertCurriculumShape(getCPDCurriculum(slug), 130);
  });

  it('links only existing educational articles and does not add runtime delivery claims', () => {
    const curricula = [...Object.values(courseDrafts), ...Object.values(cpdCurricula)];
    for (const draft of curricula) {
      const serializedKeys = Object.keys(draft).join('|');
      expect(serializedKeys).not.toMatch(/delivery|duration|hours?|instructor|fees?|certificate|certification/i);
      for (const article of draft.relatedArticles) {
        expect(educationalArticles.map((candidate) => candidate.slug)).toContain(article.slug);
      }
    }
  });

  it('keeps specialist CPD outlines explicit about scope, supervision and review limits', () => {
    for (const slug of [
      'wound-care-essentials',
      'pharmacotherapy-updates-in-chronic-disease',
      'cbt-for-anxiety-disorders',
      'clinical-nutrition-for-chronic-disease',
    ]) {
      const draft = getCPDCurriculum(slug);
      expect(draft).toBeTruthy();
      const text = JSON.stringify(draft);
      expect(text).toMatch(/scope|supervis|referr|review|not .*prescrib|not .*therap|not .*dietary|professional limit/i);
    }
  });

  it('returns undefined for missing draft slugs', () => {
    expect(getCourseDraft('missing-programme-draft')).toBeUndefined();
    expect(getCPDCurriculum('missing-cpd-draft')).toBeUndefined();
    expect(getCourseDraft('__proto__')).toBeUndefined();
    expect(getCourseDraft('toString')).toBeUndefined();
    expect(getCPDCurriculum('__proto__')).toBeUndefined();
    expect(getCPDCurriculum('toString')).toBeUndefined();
  });
});

describe('direct programme and CPD detail rendering', () => {
  it.each(allProgrammeSlugs)('renders programme detail safely for %s', (slug) => {
    const programme = programmes.find((item) => item.slug === slug)!;
    const { container } = render(
      <MemoryRouter initialEntries={[`/programmes/${slug}`]}>
        <Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: programme.title })).toBeTruthy();
    expect(screen.getAllByText(/Independent (?:educational|study|self-study) guide|Self-paced lessons/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('navigation', { name: 'Curriculum sections' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Sources and scope notes' })).toBeTruthy();
    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(3);
    expect([...details].every((detail) => !detail.open)).toBe(true);
    expect([...container.querySelectorAll('details h3')]).toHaveLength(6);
    assertNoLearnerWorkflow(container);
    for (const link of container.querySelectorAll('a[target="_blank"]')) {
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
      expect(link.textContent).toMatch(/opens in a new tab/i);
    }
    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const link of container.querySelectorAll('a[href^="#"]')) {
      expect(ids).toContain(link.getAttribute('href')!.slice(1));
    }
  });

  it.each(allCpdSlugs)('renders CPD detail safely for %s', (slug) => {
    const course = cpdCourses.find((item) => item.slug === slug)!;
    const { container } = render(
      <MemoryRouter initialEntries={[`/cpd-courses/${slug}`]}>
        <Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: course.title })).toBeTruthy();
    expect(screen.getByText(/Self-paced lessons/i)).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Curriculum sections' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Sources and scope notes' })).toBeTruthy();
    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(3);
    expect([...details].every((detail) => !detail.open)).toBe(true);
    expect([...container.querySelectorAll('details h3')]).toHaveLength(6);
    assertNoLearnerWorkflow(container);
    for (const link of container.querySelectorAll('a[target="_blank"]')) {
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
      expect(link.textContent).toMatch(/opens in a new tab/i);
    }
    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const link of container.querySelectorAll('a[href^="#"]')) {
      expect(ids).toContain(link.getAttribute('href')!.slice(1));
    }
  });

  it('does not pretend a collapsed module is a learner interaction or save state', () => {
    const slug = allProgrammeSlugs[0];
    const { container } = render(
      <MemoryRouter initialEntries={[`/programmes/${slug}`]}>
        <Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes>
      </MemoryRouter>,
    );
    const summary = container.querySelector('details summary');
    expect(summary).toBeTruthy();
    fireEvent.click(summary!);
    expect(container.querySelector('form,input,textarea,[download]')).toBeNull();
    expect(container.textContent).toMatch(/reflective activit/i);
  });

  it('shows safe not-found states for unknown direct programme and CPD paths', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/programmes/no-such-programme']}>
        <Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Learning guide not found' })).toBeTruthy();
    rerender(
      <MemoryRouter key="missing-cpd" initialEntries={['/cpd-courses/no-such-cpd']}>
        <Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Learning topic not found' })).toBeTruthy();
  });
});
