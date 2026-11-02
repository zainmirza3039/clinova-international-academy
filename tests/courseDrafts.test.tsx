import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { courseDrafts } from '@/data/courseDrafts';
import { programmes, publishedProgrammes } from '@/data/programmes';
import { cpdCourses, publishedCPDCourses } from '@/data/cpdCourses';
import { getCPDCurriculum } from '@/data/cpdCurricula';
import ProgrammeCard from '@/components/ProgrammeCard';
import CPDCard from '@/components/CPDCard';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => cleanup());

describe('legacy catalogue and curriculum release gates', () => {
  it('marks existing programme and CPD catalogue entries as draft-only', () => {
    expect(programmes.length).toBeGreaterThan(0); expect(cpdCourses.length).toBeGreaterThan(0);
    expect(programmes.every(item => item.publicationStatus === 'draft' && item.status === 'Draft')).toBe(true);
    expect(cpdCourses.every(item => item.publicationStatus === 'draft')).toBe(true);
    expect(publishedProgrammes).toHaveLength(0); expect(publishedCPDCourses).toHaveLength(0);
    expect(Object.values(courseDrafts).every(draft => draft.status === 'draft')).toBe(true);
    for (const course of cpdCourses) expect(getCPDCurriculum(course.slug)?.status).toBe('draft');
  });

  it('does not render titles or links when a legacy catalogue card is given a draft record', () => {
    const programme = render(<MemoryRouter><ProgrammeCard programme={programmes[0]} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Programme information is under review' })).toBeTruthy();
    expect(programme.container.textContent).not.toContain(programmes[0].title);
    expect(programme.container.querySelector('a')).toBeNull();
    cleanup();
    const course = render(<MemoryRouter><CPDCard course={cpdCourses[0]} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'No current CPD course is available' })).toBeTruthy();
    expect(course.container.textContent).not.toContain(cpdCourses[0].title);
    expect(course.container.querySelector('a')).toBeNull();
  });

  it('keeps direct legacy programme and CPD paths on an unavailable status page', () => {
    const { container } = render(<MemoryRouter initialEntries={[`/programmes/${programmes[0].slug}`]}><Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Programme details are under review' })).toBeTruthy();
    expect(container.textContent).not.toContain(programmes[0].title);
    cleanup();
    const cpd = render(<MemoryRouter initialEntries={[`/cpd-courses/${cpdCourses[0].slug}`]}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'This course is not currently offered' })).toBeTruthy();
    expect(cpd.container.textContent).not.toContain(cpdCourses[0].title);
    expect(cpd.container.querySelector('form,input,select,textarea,button')).toBeNull();
  });
});
