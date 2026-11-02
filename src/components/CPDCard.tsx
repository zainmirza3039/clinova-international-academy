import type { CPDCourse } from '@/data/types';

export default function CPDCard({ course }: { course: CPDCourse; index?: number }) {
  const publicationState = course.publicationStatus === 'draft' ? 'Draft-only course record.' : 'Publication is not enabled.';
  return <article className="rounded-xl border border-amber-300 bg-amber-50 p-5" role="status"><h3 className="font-heading text-lg font-bold text-navy-900">No current CPD course is available</h3><p className="mt-2 text-sm leading-relaxed text-navy-700">{publicationState} This record is not an enrollment offer.</p></article>;
}
