import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { programmes, publishedProgrammes } from '@/data/programmes';
import { cpdCourses, publishedCPDCourses } from '@/data/cpdCourses';
import { courseDrafts } from '@/data/courseDrafts';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';
import ProgrammesPage from '@/pages/ProgrammesPage';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';

vi.mock('@/lib/cms',()=>({fetchPublishedCmsContent:vi.fn().mockResolvedValue([])}));
vi.mock('@/hooks/useSEO',()=>({useSEO:vi.fn()}));
afterEach(()=>{cleanup();document.head.innerHTML='';});
const renderPage=(page:React.ReactNode)=>render(<MemoryRouter>{page}</MemoryRouter>);

describe('published programme catalogues',()=>{
  it('keeps legacy source records private until they are created and approved through the CMS',()=>{
    expect(programmes.length).toBeGreaterThan(0);
    expect(cpdCourses).toHaveLength(16);
    expect(programmes.every(item=>item.publicationStatus==='draft'&&item.status==='Draft')).toBe(true);
    expect(cpdCourses.every(item=>item.publicationStatus==='draft')).toBe(true);
    expect(publishedProgrammes).toHaveLength(0);
    expect(publishedCPDCourses).toHaveLength(0);
    expect(Object.values(courseDrafts).every(draft=>draft.status==='draft')).toBe(true);
  });

  it('renders only approved published CPD CMS records and explains an empty catalogue',async()=>{
    const {container}=renderPage(<CPDCoursesPage/>);
    expect(screen.getByRole('heading',{name:'Published CPD programmes'})).toBeTruthy();
    expect(await screen.findByRole('heading',{name:'New programmes will appear here when approved for publication.'})).toBeTruthy();
    expect(container.textContent).toMatch(/Only programmes approved for publication appear in this catalogue/i);
    expect(container.textContent).not.toContain(cpdCourses[0].title);
    expect(container.querySelector('form,input[type="password"],input[type="file"],button[type="submit"]')).toBeNull();
  });

  it('does not expose legacy programme details through a public detail route',()=>{
    const {container}=render(<MemoryRouter initialEntries={[`/programmes/${programmes[0].slug}`]}><Routes><Route path="/programmes/:slug" element={<ProgrammeDetailPage/>}/></Routes></MemoryRouter>);
    expect(screen.getByRole('heading',{name:'Programme details are under review'})).toBeTruthy();
    expect(container.textContent).not.toContain(programmes[0].title);
    expect(container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull();
  });

  it('returns a generic not-published state for legacy CPD topic slugs',async()=>{
    const topic=cpdCourses[0];
    const {container}=render(<MemoryRouter initialEntries={[`/cpd-courses/${topic.slug}`]}><Routes><Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage/>}/></Routes></MemoryRouter>);
    expect(await screen.findByRole('heading',{name:'This programme is not currently published.'})).toBeTruthy();
    expect(container.textContent).not.toContain(topic.description);
    expect(container.textContent).not.toContain(topic.duration);
    expect(container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull();
  });

  it('shows only published academic programme CMS records',async()=>{
    const {container}=renderPage(<ProgrammesPage/>);
    expect(screen.getByRole('heading',{name:'Published academic programmes'})).toBeTruthy();
    expect(await screen.findByRole('heading',{name:'New programmes will appear here after approval.'})).toBeTruthy();
    expect(container.textContent).toMatch(/Only approved programme records are shown here/i);
  });
});
