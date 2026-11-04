import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ContactPage from '@/pages/ContactPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import AdmissionsPage from '@/pages/AdmissionsPage';
import ApplicationPage from '@/pages/ApplicationPage';
import CertificationPage from '@/pages/CertificationPage';
import CertificateVerificationPage from '@/pages/CertificateVerificationPage';
import ClinicalInternshipsPage from '@/pages/ClinicalInternshipsPage';
import AssessmentPage from '@/pages/AssessmentPage';
import QualityAssurancePage from '@/pages/QualityAssurancePage';
import { FacultyPage } from '@/pages/CommunityPage';

vi.mock('@/hooks/useScrollAnimation',()=>({useScrollAnimation:()=>({ref:{current:null},isVisible:true}),useScrollPosition:()=>false}));
vi.mock('@/hooks/useSEO',()=>({useSEO:vi.fn()}));
type SupabaseQueryMock = { select: () => SupabaseQueryMock; order: () => Promise<{ data: unknown[]; error: null }> };
function createSupabaseQueryMock(): SupabaseQueryMock {
  const query: SupabaseQueryMock = { select: () => query, order: () => Promise.resolve({ data: [], error: null }) };
  return query;
}
vi.mock('@/lib/supabase',()=>({supabase:{from:vi.fn(()=>createSupabaseQueryMock())}}));
vi.mock('@/lib/cms',()=>({fetchPublishedCmsContent:vi.fn().mockResolvedValue([])}));
afterEach(()=>{cleanup();document.head.innerHTML='';});
function renderPage(page:React.ReactNode){return render(<MemoryRouter>{page}</MemoryRouter>);}

describe('Clinova platform scope and truthful service availability',()=>{
  it('presents the academy and its instructor-led CPD model without legacy self-study offers',()=>{
    const {container}=renderPage(<HomePage/>);
    expect(container.textContent).toContain('Clinova International Academy Ltd');
    expect(container.textContent).toMatch(/professional certification/i);
    expect(container.textContent).toMatch(/instructor-led learning/i);
    expect(container.textContent).not.toMatch(/self-study course|browse self-study|self-paced course/i);
    expect(container.querySelector('form,input[type="email"]')).toBeNull();
  });

  it('shows only proposed CPD topic titles without presenting them as open courses',()=>{
    const cpd=renderPage(<CPDCoursesPage/>);
    expect(screen.getByRole('heading',{name:'Browse proposed CPD topics'})).toBeTruthy();
    expect(cpd.container.textContent).toMatch(/No CPD course enrollment is available/i);
    expect(cpd.container.textContent).toMatch(/titles below are shown as proposed topic labels only/i);
    expect(cpd.container.querySelector('form,input[type="password"],input[type="file"],button[type="submit"]')).toBeNull();
    cleanup();
    const admissions=renderPage(<AdmissionsPage/>);
    expect(screen.getByRole('heading',{name:'Review programme availability before applying'})).toBeTruthy();
    expect(admissions.container.textContent).toMatch(/A learner can apply only to a published CPD programme/i);
    expect(admissions.container.querySelector('form,input,button[type="submit"]')).toBeNull();
  });

  it('explains the CPD application route without collecting a general application',()=>{
    const application=renderPage(<ApplicationPage/>);
    expect(screen.getByRole('heading',{name:'How CPD programme applications work'})).toBeTruthy();
    expect(application.container.textContent).toMatch(/Sign in with a verified learner account/i);
    expect(application.container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull();
  });

  it('keeps professional certification separate from CPD completion certificates',()=>{
    const certification=renderPage(<CertificationPage/>);
    expect(screen.getByRole('heading',{name:'No certification scheme is open'})).toBeTruthy();
    expect(certification.container.textContent).toMatch(/CPD completion certificates are not professional licences or statutory registration/i);
    expect(certification.container.textContent).toMatch(/Neither a CPD credential nor a professional competency credential implies statutory registration/i);
    expect(certification.container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull();
  });

  it('provides a real CPD certificate verification form without claiming a result before lookup',()=>{
    const {container}=renderPage(<CertificateVerificationPage/>);
    expect(screen.getByRole('heading',{name:'Verify a CPD completion certificate'})).toBeTruthy();
    expect(screen.getByRole('form',{name:'Official CPD certificate lookup'})).toBeTruthy();
    expect(screen.getByLabelText('Certificate verification UUID')).toBeTruthy();
    expect(container.textContent).toMatch(/lookup returns only the certificate number/i);
  });

  it('keeps assessment and professional certification application services closed',()=>{
    const assessment=renderPage(<AssessmentPage/>);
    expect(screen.getByRole('heading',{name:'No examination or OSCE is open'})).toBeTruthy();
    expect(assessment.container.querySelector('form,input,textarea,button[type="submit"]')).toBeNull();
    cleanup();
    const certification=renderPage(<CertificationPage/>);
    expect(certification.container.textContent).toMatch(/No professional certification scheme, candidate application, examination/i);
  });

  it('keeps clinical placements unlisted until partner and supervisor details are confirmed',()=>{
    const placement=renderPage(<ClinicalInternshipsPage/>);
    expect(placement.container.textContent).toMatch(/No verified clinical placements are currently listed/i);
    expect(placement.container.querySelector('form,input,[type="file"]')).toBeNull();
  });

  it('keeps quality assurance separate from an accreditation award',()=>{
    const quality=renderPage(<QualityAssurancePage/>);
    expect(quality.container.textContent).toMatch(/not published as an operative policy/i);
    expect(quality.container.textContent).not.toMatch(/Clinova is accredited/i);
  });

  it('keeps online contact submission disabled and does not invent faculty profiles',()=>{
    const contact=renderPage(<ContactPage/>);
    expect(contact.container.textContent).toMatch(/No verified public email address or online enquiry submission is available/i);
    expect(contact.container.querySelector('form')).toBeNull();
    cleanup();
    const faculty=renderPage(<FacultyPage/>);
    expect(screen.getByRole('heading',{name:'No verified faculty profiles are currently published'})).toBeTruthy();
    expect(faculty.container.querySelector('form,input')).toBeNull();
  });
});
