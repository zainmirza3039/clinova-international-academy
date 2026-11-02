import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';
import { proposedAssessmentMethods } from '@/data/certificationDrafts';

export default function AssessmentPage() {
  useSEO({
    title: 'Assessment development status',
    description: 'Clinova assessment and examination services are not operational; no candidate results or schedules are available.',
    noindex: true,
  });
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Assessment' }]}
        eyebrow="Assessment development"
        title="Assessment rules must be defined before assessment begins"
        description="Course assessment and professional competency assessment are separate processes. Neither is currently connected to this website."
      />
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="border border-amber-300 bg-amber-50 p-6" role="status">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-heading text-xl font-bold text-navy-900">No examination or OSCE is open</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">There are no candidate schedules, exam questions, OSCE stations, scoring rubrics, results, moderation or appeals records in this build. No assessment evidence is collected here.</p>
              </div>
            </div>
          </div>
          <section className="mt-9" aria-labelledby="assessment-design-options">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Planning options only</p>
            <h2 id="assessment-design-options" className="mt-2 font-heading text-2xl font-bold text-navy-900">Potential assessment formats</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-600">These formats were proposed for scheme design. They are not adopted requirements, and no scoring or pass/fail rule is set.</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">{proposedAssessmentMethods.map((method) => <li key={method} className="flex items-center gap-3 rounded-lg border border-navy-100 bg-surface-50 p-4"><ClipboardCheck className="h-5 w-5 text-clinical-700" aria-hidden="true" /><span className="text-sm font-semibold text-navy-800">{method}</span><span className="ml-auto text-xs text-amber-800">Proposal</span></li>)}</ul>
          </section>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/certification" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700">Certification status <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/cpd-courses" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50">CPD course development status</Link>
          </div>
        </div>
      </section>
    </>
  );
}
