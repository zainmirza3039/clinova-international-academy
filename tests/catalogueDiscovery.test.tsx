import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cpdCourses } from '@/data/cpdCourses';
import { departments } from '@/data/departments';
import { programmes } from '@/data/programmes';
import { ownerListedCPDTopics, ownerListedCPDTopicIds } from '@/data/catalogueBrowse';
import { ownerListedProgrammes, ownerListedProgrammeIds } from '@/data/programmeCatalogueBrowse';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import DepartmentDetailPage from '@/pages/DepartmentDetailPage';
import ProgrammesPage from '@/pages/ProgrammesPage';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';

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
const renderProgrammeDetail = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage />} /></Routes>
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

  it('projects exactly the eight authoritative inventory titles while all source programme records stay draft-only', () => {
    const titles = [
      'Certificate in Musculoskeletal Assessment',
      'Certificate in Clinical Pain Management',
      'Professional Development in Sports Rehabilitation',
      'Certificate in Patient-Centred Healthcare Practice',
      'Diploma in Rehabilitation Practice',
      'Certificate in Healthcare Communication',
      'Certificate in Cognitive Behavioural Therapy Fundamentals',
      'Professional Development in Healthcare Leadership',
    ];
    expect(ownerListedProgrammeIds).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']);
    expect(ownerListedProgrammes.map((programme) => programme.title)).toEqual(titles);
    expect(ownerListedProgrammes).toHaveLength(8);
    expect(ownerListedProgrammes.every((programme) => Object.keys(programme).sort().join(',') === 'id,slug,title')).toBe(true);
    const sourceProgrammes = ownerListedProgrammeIds.map((id) => programmes.find((programme) => programme.id === id)!);
    expect(sourceProgrammes.every((programme) => programme.publicationStatus === 'draft' && programme.status === 'Draft')).toBe(true);
    expect(ownerListedProgrammes).toEqual(sourceProgrammes.map((programme, index) => ({ id: programme.id, slug: programme.slug, title: titles[index] })));
  });

  it('searches and displays only the eight proposed programme titles with not-open status', () => {
    const { container } = render(<MemoryRouter><ProgrammesPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Browse proposed programmes' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Programme enrolment is not open' })).toBeTruthy();
    expect(screen.getByText('Showing 8 of 8 proposed programme titles.')).toBeTruthy();
    for (const programme of ownerListedProgrammes) expect(screen.getByRole('heading', { name: programme.title })).toBeTruthy();
    expect(container.textContent).toContain('Proposed — not open for enrolment.');

    fireEvent.change(screen.getByLabelText('Search proposed programme titles'), { target: { value: 'pain' } });
    expect(screen.getByRole('heading', { name: 'Certificate in Clinical Pain Management' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Certificate in Musculoskeletal Assessment' })).toBeNull();
    expect(screen.getByText('Showing 1 of 8 proposed programme titles.')).toBeTruthy();
    expect(container.querySelectorAll('a[href^="/programmes/"]')).toHaveLength(1);
    expect(container.querySelector('form,input[type="email"],input[type="password"],input[type="file"],textarea,button[type="submit"]')).toBeNull();
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('shows only the proposed title and not-open status on each programme detail route', () => {
    for (const programme of ownerListedProgrammes) {
      cleanup();
      const sourceProgramme = programmes.find((record) => record.id === programme.id)!;
      const { container } = renderProgrammeDetail(`/programmes/${programme.slug}`);
      expect(screen.getByRole('heading', { level: 1, name: programme.title })).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Proposed — not open for enrolment' })).toBeTruthy();
      expect(container.textContent).not.toContain(sourceProgramme.description);
      expect(container.textContent).not.toContain(sourceProgramme.overview);
      expect(container.textContent).not.toContain(sourceProgramme.modules[0].title);
      expect(container.querySelector('form,input,textarea,select,button[type="submit"]')).toBeNull();
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
      expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    }
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
});
