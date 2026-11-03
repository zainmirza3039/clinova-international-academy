import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { courseDrafts, getCourseDraft } from '@/data/courseDrafts';
import { cpdCurricula, getCPDCurriculum } from '@/data/cpdCurricula';
import { programmes } from '@/data/programmes';
import { cpdCourses } from '@/data/cpdCourses';
import { ownerListedCPDTopics } from '@/data/catalogueBrowse';
import { ownerListedProgrammes } from '@/data/programmeCatalogueBrowse';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';

afterEach(() => { cleanup(); document.head.innerHTML = ''; });

const programmeSlugs = programmes.map((item) => item.slug);
const cpdSlugs = cpdCourses.map((item) => item.slug);

describe('withheld curriculum data and proposal-only public routes', () => {
  it('keeps every embedded curriculum explicitly draft-only with no extraneous slug entries', () => {
    expect(Object.keys(courseDrafts).sort()).toEqual([...programmeSlugs].sort());
    expect(Object.keys(cpdCurricula).sort()).toEqual([...cpdSlugs].sort());
    for (const slug of programmeSlugs) expect(getCourseDraft(slug)?.status).toBe('draft');
    for (const slug of cpdSlugs) expect(getCPDCurriculum(slug)?.status).toBe('draft');
    expect(getCourseDraft('__proto__')).toBeUndefined(); expect(getCourseDraft('toString')).toBeUndefined();
    expect(getCPDCurriculum('__proto__')).toBeUndefined(); expect(getCPDCurriculum('toString')).toBeUndefined();
  });

  it('reveals an owner-listed programme title only, not lesson text, enrollment or assessment controls', () => {
    const proposed = ownerListedProgrammes[0];
    const source = programmes.find((item) => item.id === proposed.id)!;
    const { container } = render(<MemoryRouter initialEntries={[`/programmes/${proposed.slug}`]}><Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: proposed.title })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Proposed — not open for enrolment' })).toBeTruthy();
    expect(container.textContent).not.toContain(source.title);
    expect(container.textContent).not.toContain(source.overview);
    expect(container.textContent).not.toContain(source.modules[0].title);
    expect(container.querySelector('form,input,textarea,select,[download],button[type="submit"]')).toBeNull();
  });

  it('reveals only the owner-listed topic title, never its curriculum, description or learner actions', () => {
    const topic = ownerListedCPDTopics[0];
    const sourceTopic = cpdCourses.find((item) => item.id === topic.id)!;
    const { container } = render(<MemoryRouter initialEntries={[`/cpd-courses/${topic.slug}`]}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: topic.title })).toBeTruthy();
    expect(container.textContent).not.toContain(sourceTopic.description);
    expect(container.textContent).not.toContain(getCPDCurriculum(topic.slug)?.modules[0]?.title ?? 'unavailable module');
    expect(container.querySelector('form,input,textarea,select,[download],button[type="submit"]')).toBeNull();
  });

  it('keeps unlisted legacy CPD paths on a no-detail not-found state', () => {
    const unlisted = cpdCourses.find((topic) => topic.id === 'c13')!;
    const { container } = render(<MemoryRouter initialEntries={[`/cpd-courses/${unlisted.slug}`]}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'CPD topic not found' })).toBeTruthy();
    expect(container.textContent).not.toContain(unlisted.title);
  });
});
