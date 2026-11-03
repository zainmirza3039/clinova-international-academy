import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { CmsPublishedContentShelf } from '@/components/CmsPublishedContent';
import { useSEO } from '@/hooks/useSEO';

export default function ProgrammesPage() {
  useSEO({
    title: 'Programme catalogue status',
    description: 'Clinova programme-list status. Programme titles are being reconciled; no programme is currently open for enrollment.',
    noindex: true,
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Programmes' }]}
        eyebrow="Programme information"
        title="Programme catalogue status"
        description="Programme information is being reconciled before a definitive catalogue is published. No programme is currently open for admission or enrollment."
      />
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="border border-amber-300 bg-amber-50 p-6" role="status">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-heading text-xl font-bold text-navy-900">No programme offer is available</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">The available Clinova materials do not resolve to one confirmed programme title set with version-specific review coverage. Programme cards and detail content are therefore not published as current offers. No unreviewed syllabus, outcomes, fees, assessment rules, CPD values, faculty profiles, dates or credential claims are shown.</p>
              </div>
            </div>
          </div>
          <dl className="mt-7 grid gap-px border border-navy-200 bg-navy-200 sm:grid-cols-3">
            <div className="bg-white p-5"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Catalogue titles</dt><dd className="mt-2 text-sm font-semibold text-navy-900">Awaiting list reconciliation</dd></div>
            <div className="bg-white p-5"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Review and release</dt><dd className="mt-2 text-sm font-semibold text-navy-900">Exact-version approval not evidenced</dd></div>
            <div className="bg-white p-5"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Admissions</dt><dd className="mt-2 text-sm font-semibold text-navy-900">Not open</dd></div>
          </dl>
          <div className="mt-12"><CmsPublishedContentShelf kinds={['programme']} /></div>
          <div className="mt-8 flex flex-wrap gap-5">
            <Link to="/departments" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Browse proposed subject areas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/cpd-courses" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Browse proposed CPD topics <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/application" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Application information <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
