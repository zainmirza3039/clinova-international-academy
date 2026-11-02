import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';

const { from, rpc } = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from, rpc } }));
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));

afterEach(() => { cleanup(); document.head.innerHTML = ''; vi.clearAllMocks(); });

function renderDetail(path = '/cpd-courses/legacy-course') {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} /></Routes></MemoryRouter>);
}

describe('closed CPD catalogue and legacy routes', () => {
  it('shows the system status without course listings or enrollment controls', () => {
    const { container } = render(<MemoryRouter><CPDCoursesPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'A structured CPD learning system is in development' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'No CPD course enrollment is available' })).toBeTruthy();
    expect(container.querySelector('form,input,select,button[type="submit"]')).toBeNull();
    expect(container.querySelectorAll('a[href^="/cpd-courses/"]')).toHaveLength(0);
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('keeps a previously published course URL inert and hides its legacy slug', () => {
    const { container } = renderDetail('/cpd-courses/clinical-communication-skills');
    expect(screen.getByRole('heading', { name: 'This course is not currently offered' })).toBeTruthy();
    expect(container.textContent).toMatch(/legacy catalogue records are under review/i);
    expect(container.textContent).not.toContain('clinical-communication-skills');
    expect(container.querySelector('form,input,select,textarea,button')).toBeNull();
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('uses the same closed state for an unknown course URL', () => {
    renderDetail('/cpd-courses/not-a-real-course');
    expect(screen.getByRole('heading', { name: 'This course is not currently offered' })).toBeTruthy();
    expect(screen.queryByText(/not found.*verified/i)).toBeNull();
  });
});
