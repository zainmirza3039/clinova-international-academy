import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { courseDrafts } from '@/data/courseDrafts';
import { programmes, publishedProgrammes } from '@/data/programmes';
import { cpdCourses, publishedCPDCourses } from '@/data/cpdCourses';
import { getCPDCurriculum } from '@/data/cpdCurricula';
import { ownerListedCPDTopics } from '@/data/catalogueBrowse';
import { ownerListedProgrammes } from '@/data/programmeCatalogueBrowse';
import ProgrammeCard from '@/components/ProgrammeCard';
import CPDCard from '@/components/CPDCard';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';

afterEach(() => { cleanup(); document.head.innerHTML = ''; });

describe('draft catalogue and curriculum release gates', () => {
  it('keeps every programme and CPD source record draft-only with no public-published selectors', () => {
    expect(programmes.length).toBeGreaterThan(0);
    expect(cpdCourses.length).toBe(16);
    expect(programmes.every((item) => item.publicationStatus === 'draft' && item.status === 'Draft')).toBe(true);
    expect(cpdCourses.every((item) => item.publicationStatus === 'draft')).toBe(true);
    expect(publishedProgrammes).toHaveLength(0);
    expect(publishedCPDCourses).toHaveLength(0);
    expect(ownerListedCPDTopics).toHaveLength(12);
    expect(Object.values(courseDrafts).every((draft) => draft.status === 'draft')).toBe(true);
    for (const course of cpdCourses) expect(getCPDCurriculum(course.slug)?.status).toBe('draft');
  });

  it('keeps programme cards inert and uses CPD cards only for owner-listed topic titles', () => {
    const programme = render(<MemoryRouter><ProgrammeCard programme={programmes[0]} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Programme information is under review' })).toBeTruthy();
    expect(programme.container.textContent).not.toContain(programmes[0].title);
    expect(programme.container.querySelector('a')).toBeNull();
    cleanup();

    const topic = ownerListedCPDTopics[0];
    const sourceTopic = cpdCourses.find((item) => item.id === topic.id)!;
    const cpd = render(<MemoryRouter><CPDCard course={topic} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: topic.title })).toBeTruthy();
    expect(cpd.container.textContent).toContain('Proposed CPD topic');
    expect(cpd.container.textContent).toContain('not an open course or enrollment offer');
    expect(cpd.container.textContent).not.toContain(sourceTopic.description);
    expect(cpd.container.querySelectorAll('a[href^="/cpd-courses/"]')).toHaveLength(1);
  });

  it('shows only an owner-listed title and proposed/not-open status on programme detail routes', () => {
    const proposed = ownerListedProgrammes[0];
    const source = programmes.find((item) => item.id === proposed.id)!;
    const { container } = render(<MemoryRouter initialEntries={[`/programmes/${proposed.slug}`]}><Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: proposed.title })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Proposed — not open for enrolment' })).toBeTruthy();
    expect(container.textContent).not.toContain(source.description);
    expect(container.textContent).not.toContain(source.overview);
    expect(container.textContent).not.toContain(source.modules[0].title);
    expect(container.querySelector('form,input,textarea,select,button[type="submit"]')).toBeNull();
  });

  it('keeps owner-listed CPD topic details title-only, with no course content or learner controls', () => {
    const topic = ownerListedCPDTopics[0];
    const sourceTopic = cpdCourses.find((item) => item.id === topic.id)!;
    const { container } = render(<MemoryRouter initialEntries={[`/cpd-courses/${topic.slug}`]}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: topic.title })).toBeTruthy();
    expect(container.textContent).not.toContain(sourceTopic.description);
    expect(container.textContent).not.toContain(sourceTopic.duration);
    expect(container.querySelector('form,input,textarea,select,button[type="submit"]')).toBeNull();
  });
});
