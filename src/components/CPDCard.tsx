import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { OwnerListedCPDTopic } from '@/data/catalogueBrowse';

export default function CPDCard({ course }: { course: OwnerListedCPDTopic; index?: number }) {
  return (
    <article className="flex h-full flex-col border border-navy-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clinical-700">Proposed CPD topic</p>
      <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-navy-900">{course.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-navy-700">
        Suggested subject grouping (provisional): <span className="font-medium">{course.subjectArea}</span>.
      </p>
      <p className="mt-3 flex-1 text-xs leading-relaxed text-navy-600">
        Topic title only. This is not an open course or enrollment offer.
      </p>
      <Link
        to={`/cpd-courses/${course.slug}`}
        aria-label={`View status for proposed topic: ${course.title}`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4"
      >
        View topic status <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
