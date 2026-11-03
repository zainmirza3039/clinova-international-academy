import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cpdCourses } from '@/data/cpdCourses';
import { departments } from '@/data/departments';
import { programmes } from '@/data/programmes';
import { ownerListedCPDTopics, ownerListedCPDTopicIds } from '@/data/catalogueBrowse';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import DepartmentDetailPage from '@/pages/DepartmentDetailPage';
import ProgrammesPage from '@/pages/ProgrammesPage';

const { from, rpc } = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from, rpc } }));
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }), useScrollPosition: () => false }));

afterEach(() => { cleanup(); document.head.innerHTML = ''; vi.clearAllMocks(); });

const renderCPDDetail = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes>
  </MemoryRouter>,
);
const renderDepartmentDetail = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes><Route path="/departments/:slug" element={<DepartmentDetailPage />} /></Routes>
  </MemoryRouter>,
);

describe('Clinova catalogue discovery structure', () => {
  it('uses only the twelve owner-listed CPD topic records and leaves all source flags as drafts', () => {
    expect(ownerListedCPDTopicIds).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12']);
    expect(ownerListedCPDTopics).toHaveLength(12);
    expect(ownerListedCPDTopics.map((topic) => topic.id)).toEqual(ownerListedCPDTopicIds);
    expect(ownerListedCPDTopics.every((topic) => Object.keys(topic).sort().join(',') === 'id,slug,subjectArea,title')).toBe(true);
    const sourceTopics = ownerListedCPDTopicIds.map((id) => cpdCourses.find((topic) => topic.id === id)!);
    expect(sourceTopics.every((topic) => topic.publicationStatus === 'draft')).toBe(true);
    expect(ownerListedCPDTopics).toEqual(sourceTopics.map((topic) => ({ id: topic.id, slug: topic.slug, title: topic.title, subjectArea: topic.department })));
    expect(cpdCourses.filter((topic) => !ownerListedCPDTopicIds.includes(topic.id as typeof ownerListedCPDTopicIds[number]))).toHaveLength(4);
  });

  it('searches and filters title-only proposed CPD topics without application or personal-data controls', () => {
    const { container } = render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Browse proposed CPD topics' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'No CPD course enrollment is available' })).toBeTruthy();
    expect(screen.getByText('Showing 12 of 12 proposed topic titles.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Clinical Assessment of Low Back Pain' })).toBeTruthy();
    expect(screen.queryByText('Musculoskeletal Assessment & Clinical Reasoning')).toBeNull();

    fireEvent.change(screen.getByLabelText('Search proposed topics'), { target: { value: 'pain' } });
    expect(screen.getByRole('heading', { name: 'Clinical Assessment of Low Back Pain' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Pain Management Fundamentals' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Wound Care Essentials' })).toBeNull();

    fireEvent.change(screen.getByLabelText('Search proposed topics'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Suggested subject area (provisional)'), { target: { value: 'Sports & Exercise' } });
    expect(screen.getByRole('heading', { name: 'Introduction to Sports Rehabilitation' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Clinical Assessment of Low Back Pain' })).toBeNull();
    expect(container.querySelector('form,input[type="email"],input[type="password"],input[type="file"],textarea,button[type="submit"]')).toBeNull();
    expect(container.querySelectorAll('a[href^="/cpd-courses/"]')).toHaveLength(1);
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('shows a proposed topic title and provisional grouping only on its detail route', () => {
    const topic = ownerListedCPDTopics[0];
    const sourceTopic = cpdCourses.find((record) => record.id === topic.id)!;
    const { container } = renderCPDDetail(`/cpd-courses/${topic.slug}`);
    expect(screen.getByRole('heading', { level: 1, name: topic.title })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Topic details are not available as a course offer' })).toBeTruthy();
    expect(container.textContent).toContain('Suggested subject grouping');
    expect(container.textContent).toContain('(provisional)');
    expect(container.textContent).not.toContain(sourceTopic.description);
    expect(container.textContent).not.toMatch(/Self-paced study|Independent study|\b\d+ CPD hours?\b/i);
    expect(container.querySelector('form,input,textarea,select,button[type="submit"]')).toBeNull();
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('fails closed for CPD records outside the owner-listed twelve-topic set', () => {
    const unlistedTopic = cpdCourses.find((topic) => topic.id === 'c13');
    expect(unlistedTopic).toBeTruthy();
    const { container } = renderCPDDetail(`/cpd-courses/${unlistedTopic!.slug}`);
    expect(screen.getByRole('heading', { name: 'CPD topic not found' })).toBeTruthy();
    expect(container.textContent).not.toContain(unlistedTopic!.title);
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('offers ten proposed subject-area cards and title-only related topic browsing', () => {
    const directory = render(<MemoryRouter><DepartmentsPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Proposed healthcare subject areas' })).toBeTruthy();
    expect(directory.container.querySelectorAll('a[href^="/departments/"]')).toHaveLength(10);
    cleanup();

    const department = departments.find((item) => item.slug === 'physical-therapy-rehabilitation')!;
    const detail = renderDepartmentDetail(`/departments/${department.slug}`);
    expect(screen.getByRole('heading', { name: 'Proposed learning areas' })).toBeTruthy();
    for (const area of department.learningAreas) expect(detail.container.textContent).toContain(area);
    expect(screen.getByRole('heading', { name: 'Related proposed CPD topics' })).toBeTruthy();
    expect(detail.container.textContent).toContain('Clinical Assessment of Low Back Pain');
    expect(detail.container.textContent).toContain('provisional');
    expect(detail.container.textContent).not.toContain(cpdCourses.find((topic) => topic.id === 'c13')!.title);
    expect(detail.container.querySelector('form,input[type="email"],button[type="submit"]')).toBeNull();
  });

  it('withholds all programme titles until one confirmed list and exact-version coverage are available', () => {
    const { container } = render(<MemoryRouter><ProgrammesPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'No programme offer is available' })).toBeTruthy();
    for (const programme of programmes) expect(container.textContent).not.toContain(programme.title);
    expect(container.textContent).toMatch(/awaiting list reconciliation/i);
    expect(container.querySelector('a[href^="/programmes/"]')).toBeNull();
    expect(container.querySelector('form,input,select,button[type="submit"]')).toBeNull();
  });
});
