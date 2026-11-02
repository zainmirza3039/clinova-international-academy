import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';
import { credentialTypes } from '@/data/credentialTypes';

const cpdSystemAreas = [
  { title: 'Course catalogue', detail: 'Approved course descriptions, learning objectives, syllabus and confirmed delivery information.' },
  { title: 'Enrollment and learner access', detail: 'A secure application, enrollment and account flow after course terms and data controls are approved.' },
  { title: 'Learning and course assessment', detail: 'Course-specific learning materials, assessments and completion rules; not a professional competency decision.' },
  { title: 'CPD records and completion certificate', detail: 'A distinct CPD record and certificate tied only to the approved course completion policy.' },
];

export default function CPDCoursesPage() {
  useSEO({
    title: 'CPD courses',
    description: 'Clinova CPD education system development status. No course enrollment or CPD credential is currently available.',
  });
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'CPD Courses' }]}
        eyebrow="CPD Education"
        title="A structured CPD learning system is in development"
        description="Clinova is planning a course catalogue, learner access, course-level assessment and CPD records. No course is currently open for enrollment through this website."
      />
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="border border-amber-300 bg-amber-50 p-6" role="status">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-heading text-xl font-bold text-navy-900">No CPD course enrollment is available</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">Course topics and legacy learning outlines are not treated as live course offers. Approved course outcomes, CPD hours, instructor assignments, delivery terms, assessment rules and fees are not published here unless authoritatively confirmed. No enrollment, payment or course-progress record is collected on this page.</p>
              </div>
            </div>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {cpdSystemAreas.map((area) => <article key={area.title} className="rounded-xl border border-navy-100 bg-surface-50 p-5"><BookOpenCheck className="h-5 w-5 text-clinical-700" aria-hidden="true" /><h3 className="mt-3 font-heading text-lg font-bold text-navy-900">{area.title}</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">{area.detail}</p><p className="mt-3 text-xs font-semibold text-amber-800">Development only · not connected</p></article>)}
          </div>
          <section className="mt-9 rounded-xl border border-navy-100 p-6" aria-labelledby="cpd-credential-title">
            <h2 id="cpd-credential-title" className="font-heading text-xl font-bold text-navy-900">CPD completion certificate</h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">A future CPD certificate may confirm participation or successful completion under that specific course’s approved rules. It is a separate credential type and does not establish professional competency certification, statutory registration or UKAS accreditation.</p>
            <p className="mt-3 text-xs font-semibold text-amber-800">No CPD certificate is currently issued or verified here.</p>
          </section>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/candidate-dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700">Learner portal status <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/certification" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50">Professional certification</Link>
            <Link to="/verify" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50">Credential verification status</Link>
          </div>
          <p className="sr-only">Credential types are kept separate: {credentialTypes.map((item) => item.title).join('; ')}.</p>
        </div>
      </section>
    </>
  );
}
