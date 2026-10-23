import { cleanup, render, screen } from '@testing-library/react';
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

function assertDraftShape(draft: CourseDraft | CPDCurriculumDraft | undefined, minimumLessonWords: number) {
  expect(draft).toBeTruthy();
  if (!draft) throw new Error('Expected curriculum draft to exist');
  expect(draft.status).toBe('draft');
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


describe('complete continuation catalogue and curriculum contracts', () => {
  it('covers exactly every programme and CPD catalogue slug with one draft and no extras', () => {
    expect(Object.keys(courseDrafts).sort()).toEqual([...allProgrammeSlugs].sort());
    expect(Object.keys(cpdCurricula).sort()).toEqual([...allCpdSlugs].sort());
    for (const slug of allProgrammeSlugs) expect(getCourseDraft(slug)?.programmeSlug).toBe(slug);
    for (const slug of allCpdSlugs) expect(getCPDCurriculum(slug)?.courseSlug).toBe(slug);
  });

  it('keeps all programme and CPD drafts substantive, scoped and reviewable', () => {
    for (const slug of allProgrammeSlugs) {
      assertDraftShape(getCourseDraft(slug), oldProgrammeSlugs.has(slug) ? 100 : 130);
    }
    for (const slug of allCpdSlugs) assertDraftShape(getCPDCurriculum(slug), 130);
  });

  it('links only existing educational articles and does not add runtime delivery claims', () => {
    const drafts = [...Object.values(courseDrafts), ...Object.values(cpdCurricula)];
    for (const draft of drafts) {
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

describe('public publication gate for programme and CPD detail routes', () => {
  it.each(allProgrammeSlugs)('does not expose draft programme detail %s', (slug) => {
    const programme = programmes.find((item) => item.slug === slug)!;
    render(<MemoryRouter initialEntries={['/programmes/' + slug]}><Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Programme Not Found' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Curriculum sections' })).toBeNull();
    expect(screen.queryByRole('heading', { name: programme.title })).toBeNull();
  });

  it.each(allCpdSlugs)('does not expose draft CPD detail %s', (slug) => {
    const course = cpdCourses.find((item) => item.slug === slug)!;
    render(<MemoryRouter initialEntries={['/cpd-courses/' + slug]}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'CPD Course Not Found' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Curriculum sections' })).toBeNull();
    expect(screen.queryByRole('heading', { name: course.title })).toBeNull();
  });

  it('keeps unknown direct paths in safe not-found states', () => {
    const { rerender } = render(<MemoryRouter initialEntries={['/programmes/no-such-programme']}><Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Programme Not Found' })).toBeTruthy();
    rerender(<MemoryRouter key="missing-cpd" initialEntries={['/cpd-courses/no-such-cpd']}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'CPD Course Not Found' })).toBeTruthy();
  });
});
