import type { Programme } from '@/data/types';

export default function ProgrammeCard({ programme }: { programme: Programme; index?: number }) {
  const publicationState = programme.publicationStatus === 'draft' ? 'Draft-only record.' : 'Publication is not enabled.';
  return <article className="rounded-xl border border-amber-300 bg-amber-50 p-5" role="status"><h3 className="font-heading text-lg font-bold text-navy-900">Programme information is under review</h3><p className="mt-2 text-sm leading-relaxed text-navy-700">{publicationState} No current programme offer, enrollment, fee, schedule, assessment or credential is available from this catalogue record.</p></article>;
}
