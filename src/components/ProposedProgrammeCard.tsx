import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { OwnerListedProgramme } from '@/data/programmeCatalogueBrowse';

export default function ProposedProgrammeCard({ programme }: { programme: OwnerListedProgramme }) {
  return (
    <article className="flex h-full flex-col border border-navy-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clinical-700">Proposed programme</p>
      <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-navy-900">{programme.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-700">Proposed — not open for enrolment.</p>
      <Link
        to={`/programmes/${programme.slug}`}
        aria-label={`View status for proposed programme: ${programme.title}`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4"
      >
        View proposed title <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
