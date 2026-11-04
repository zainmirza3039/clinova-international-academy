import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { getOwnerListedProgrammeBySlug } from '@/data/programmeCatalogueBrowse';
import { useSEO } from '@/hooks/useSEO';

export default function ProgrammeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const programme = slug ? getOwnerListedProgrammeBySlug(slug) : undefined;

  useSEO({
    title: programme ? `${programme.title} | Proposed programme` : 'Proposed programme title not found',
    description: 'Proposed programme title only. Not open for enrolment.',
    noindex: true,
  });

  if (!programme) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24" aria-labelledby="programme-not-found-title">
        <div className="border border-navy-200 bg-surface-50 p-7">
          <h1 id="programme-not-found-title" className="font-heading text-2xl font-bold text-navy-900">Proposed programme title not found</h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-700">This address does not match a title in the proposed programme directory.</p>
        </div>
        <Link to="/programmes" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Browse proposed programmes</Link>
      </section>
    );
  }

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Proposed programmes', to: '/programmes' }, { label: programme.title }]}
        eyebrow="Proposed programme"
        title={programme.title}
        description="Proposed title only — not open for enrolment."
      />
      <section className="bg-white px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="border border-amber-300 bg-amber-50 p-6" role="status">
            <ShieldAlert className="h-6 w-6 text-amber-700" aria-hidden="true" />
            <h2 className="mt-3 font-heading text-xl font-bold text-navy-900">Proposed — not open for enrolment</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-700">This page contains the proposed title only. No application or enrolment is currently available.</p>
          </div>
          <Link to="/programmes" className="mt-7 inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Browse proposed programmes</Link>
        </div>
      </section>
    </>
  );
}
