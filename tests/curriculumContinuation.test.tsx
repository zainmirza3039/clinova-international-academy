import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { courseDrafts, getCourseDraft } from '@/data/courseDrafts';
import { cpdCurricula, getCPDCurriculum } from '@/data/cpdCurricula';
import { programmes } from '@/data/programmes';
import { cpdCourses } from '@/data/cpdCourses';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));
afterEach(() => { cleanup(); document.head.innerHTML = ''; });

const programmeSlugs = programmes.map(item => item.slug);
const cpdSlugs = cpdCourses.map(item => item.slug);

describe('withheld curriculum data and legacy public routes', () => {
  it('keeps each embedded curriculum explicitly draft-only with no extraneous slug entries', () => {
    expect(Object.keys(courseDrafts).sort()).toEqual([...programmeSlugs].sort());
    expect(Object.keys(cpdCurricula).sort()).toEqual([...cpdSlugs].sort());
    for (const slug of programmeSlugs) expect(getCourseDraft(slug)?.status).toBe('draft');
    for (const slug of cpdSlugs) expect(getCPDCurriculum(slug)?.status).toBe('draft');
    expect(getCourseDraft('__proto__')).toBeUndefined(); expect(getCourseDraft('toString')).toBeUndefined();
    expect(getCPDCurriculum('__proto__')).toBeUndefined(); expect(getCPDCurriculum('toString')).toBeUndefined();
  });

  it('does not reveal programme titles, lesson text, enrollment or assessment controls', () => {
    const { container } = render(<MemoryRouter initialEntries={[`/programmes/${programmeSlugs[0]}`]}><Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Programme details are under review' })).toBeTruthy();
    expect(container.textContent).not.toContain(programmes[0].title);
    expect(container.querySelector('form,input,textarea,select,[download],button[type="submit"]')).toBeNull();
  });

  it('does not reveal CPD course titles, curriculum text or learner actions on old URLs', () => {
    const { container } = render(<MemoryRouter initialEntries={[`/cpd-courses/${cpdSlugs[0]}`]}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'This course is not currently offered' })).toBeTruthy();
    expect(container.textContent).not.toContain(cpdCourses[0].title);
    expect(container.querySelector('form,input,textarea,select,[download],button')).toBeNull();
  });
});
