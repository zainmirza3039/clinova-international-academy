import type { CourseDraft } from '@/data/courseDrafts';

type Props = { draft: Omit<CourseDraft, 'programmeSlug'> };

export default function CurriculumDraftContent({ draft }: Props) {
  const status = draft.status === 'published' ? 'This curriculum is withheld pending separate owner review.' : 'This curriculum is a draft and is not available as a current course or programme.';
  return <section className="rounded-xl border border-amber-300 bg-amber-50 p-6" role="status"><h2 className="font-heading text-xl font-bold text-navy-900">Course content is unavailable</h2><p className="mt-3 text-sm leading-relaxed text-navy-700">{status} No enrollment, saved progress, assessment, CPD credit or credential service is connected.</p></section>;
}
