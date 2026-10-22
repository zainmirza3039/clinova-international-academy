import rehabilitationDrafts from './curricula/cpd-rehabilitation.json';
import specialistDrafts from './curricula/cpd-specialist-safety.json';
import systemsDrafts from './curricula/cpd-systems-practice.json';
import type { CourseDraft } from './courseDrafts';

export interface CPDCurriculumDraft extends Omit<CourseDraft, 'programmeSlug'> {
  courseSlug: string;
}

export const cpdCurricula: Record<string, CPDCurriculumDraft> = {};
for (const draft of [...rehabilitationDrafts, ...specialistDrafts, ...systemsDrafts]) {
  if (draft.status !== 'draft') throw new Error('Only draft CPD content is permitted.');
  if (Object.prototype.hasOwnProperty.call(cpdCurricula, draft.courseSlug)) throw new Error('Duplicate CPD curriculum slug.');
  cpdCurricula[draft.courseSlug] = { ...draft, status: 'draft' };
}

export function getCPDCurriculum(slug: string): CPDCurriculumDraft | undefined {
  return Object.prototype.hasOwnProperty.call(cpdCurricula, slug) ? cpdCurricula[slug] : undefined;
}
