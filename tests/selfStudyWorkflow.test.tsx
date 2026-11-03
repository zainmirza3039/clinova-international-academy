import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';
import { cpdCourses } from '@/data/cpdCourses';
import { ownerListedCPDTopics } from '@/data/catalogueBrowse';

const { from, rpc } = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from, rpc } }));

afterEach(() => { cleanup(); document.head.innerHTML = ''; vi.clearAllMocks(); });

function renderDetail(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes></MemoryRouter>);
}

describe('proposal-only CPD topic discovery and legacy route gates', () => {
  it('shows only the owner-listed title set with non-submitting search and grouping filters', () => {
    const { container } = render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Browse proposed CPD topics' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'No CPD course enrollment is available' })).toBeTruthy();
    expect(container.querySelectorAll('a[href^="/cpd-courses/"]')).toHaveLength(12);
    expect(screen.getByText('Showing 12 of 12 proposed topic titles.')).toBeTruthy();
    expect(container.textContent).not.toMatch(/self-study course|self-paced study|independent study/i);
    expect(container.querySelector('form,input[type="email"],input[type="password"],input[type="file"],textarea,button[type="submit"]')).toBeNull();
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('filters only by title and proposed grouping, without exposing draft descriptions', () => {
    const { container } = render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Search proposed topics'), { target: { value: 'pain' } });
    expect(screen.getByRole('heading', { name: 'Pain Management Fundamentals' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Wound Care Essentials' })).toBeNull();
    expect(container.textContent).not.toContain(cpdCourses[0].description);
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('keeps a previously recorded but owner-listed URL title-only and non-operational', () => {
    const topic = ownerListedCPDTopics.find((item) => item.slug === 'clinical-communication-skills')!;
    const sourceTopic = cpdCourses.find((item) => item.id === topic.id)!;
    const { container } = renderDetail(`/cpd-courses/${topic.slug}`);
    expect(screen.getByRole('heading', { level: 1, name: topic.title })).toBeTruthy();
    expect(container.textContent).toMatch(/not a current course or enrollment offer/i);
    expect(container.textContent).not.toContain(sourceTopic.description);
    expect(container.textContent).not.toContain(sourceTopic.duration);
    expect(container.querySelector('form,input,textarea,select,button[type="submit"]')).toBeNull();
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('does not reveal unlisted legacy CPD slugs or titles', () => {
    const unlisted = cpdCourses.find((item) => item.id === 'c13')!;
    const { container } = renderDetail(`/cpd-courses/${unlisted.slug}`);
    expect(screen.getByRole('heading', { name: 'CPD topic not found' })).toBeTruthy();
    expect(container.textContent).not.toContain(unlisted.title);
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
});
