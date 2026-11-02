import { useId } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion from '@/components/FAQAccordion';
import { selfStudyLessonKey } from '@/lib/selfStudyLearning';
import type { CourseDraft } from '@/data/courseDrafts';

type CurriculumContent = Omit<CourseDraft, 'programmeSlug'>;
type Props = {
  draft: CurriculumContent;
  allowSelfStudyMarkers?: boolean;
  completedLessonKeys?: string[];
  savingLessonKey?: string | null;
  onMarkLessonRead?: (lessonKey: string) => void;
};

export default function CurriculumDraftContent({
  draft,
  allowSelfStudyMarkers = false,
  completedLessonKeys = [],
  savingLessonKey = null,
  onMarkLessonRead,
}: Props) {
  const prefix = useId();
  const completed = new Set(completedLessonKeys);
  const sectionId = (name: string) => `${prefix}-${name}`;
  const readingStatus = allowSelfStudyMarkers
    ? 'This guide provides educational reading and unsubmitted reflective activities. Where the authenticated self-study service is enabled, learners may enroll and save self-reported reading markers. These are not graded assessments, verified completion, CPD credit or certification. Use fictional cases; do not enter patient or learner information.'
    : 'This outline provides educational reading and unsubmitted reflective activities only. It does not support enrollment or saved learner progress, and it includes no graded assessments or completion services. Use fictional cases; do not enter patient or learner information.';

  return (
    <div className="space-y-10">
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">{draft.reviewNotice}</p>
      <nav aria-label="Curriculum sections" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-clinical-700">
        {['Outcomes', 'Audience', 'Modules', 'Sources', 'FAQs'].map(name => <a key={name} href={`#${sectionId(name)}`} className="underline underline-offset-4">{name}</a>)}
      </nav>
      <section aria-labelledby={sectionId('Outcomes')}>
        <h2 id={sectionId('Outcomes')} className="scroll-mt-28 font-heading text-2xl font-bold text-navy-900">Learning outcomes</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-navy-700">{draft.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul>
      </section>
      <section aria-labelledby={sectionId('Audience')}>
        <h2 id={sectionId('Audience')} className="scroll-mt-28 font-heading text-2xl font-bold text-navy-900">Intended audience and prerequisites</h2>
        <h3 className="mt-4 font-semibold text-navy-900">Intended audience</h3>
        <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-relaxed text-navy-700">{draft.intendedAudience.map(item => <li key={item}>{item}</li>)}</ul>
        <h3 className="mt-5 font-semibold text-navy-900">Prerequisites and professional limits</h3>
        <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-relaxed text-navy-700">{draft.prerequisites.map(item => <li key={item}>{item}</li>)}</ul>
      </section>
      <section aria-labelledby={sectionId('Modules')}>
        <h2 id={sectionId('Modules')} className="scroll-mt-28 font-heading text-2xl font-bold text-navy-900">Modules and lessons</h2>
        <p className="mt-3 text-sm leading-relaxed text-navy-600">{readingStatus}</p>
        <div className="mt-5 space-y-4">{draft.modules.map((module, index) => (
          <details key={module.title} className="rounded-xl border border-navy-200 bg-navy-50 p-4 sm:p-5">
            <summary className="cursor-pointer font-heading font-bold text-navy-900">Module {index + 1}: {module.title}</summary>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">{module.description}</p>
            <div className="mt-4 space-y-4">{module.lessons.map(lesson => {
              const lessonKey = selfStudyLessonKey(module.title, lesson.title);
              const isRead = completed.has(lessonKey);
              return (
                <section key={lesson.title} className="rounded-lg border border-navy-100 bg-white p-4 sm:p-5">
                  <h3 className="font-semibold text-navy-900">{lesson.title}</h3>
                  <p className="mt-2 text-sm text-clinical-700">{lesson.description}</p>
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-navy-700">{lesson.text}</p>
                  {onMarkLessonRead && (isRead ? (
                    <p className="mt-4 rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-900" role="status">Marked as read in your account. This is self-reported, not assessed.</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onMarkLessonRead(lessonKey)}
                      disabled={savingLessonKey !== null}
                      className="mt-4 inline-flex items-center rounded-md border border-clinical-300 px-3 py-2 text-sm font-semibold text-clinical-800 hover:bg-clinical-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingLessonKey === lessonKey ? 'Saving reading marker…' : 'Mark as read'}
                    </button>
                  ))}
                </section>
              );
            })}</div>
            <p className="mt-5 border-l-4 border-teal-500 pl-4 text-sm leading-relaxed text-navy-700"><strong>Reflective activity:</strong> {module.reflectiveActivity}</p>
          </details>
        ))}</div>
      </section>
      <section>
        <h2 className="font-heading text-2xl font-bold text-navy-900">Related reading</h2>
        <ul className="mt-4 space-y-3">{draft.relatedArticles.map(article => <li key={article.slug}><Link to={`/resources/${article.slug}`} className="text-sm font-semibold text-clinical-700 underline underline-offset-4">{article.title}</Link></li>)}</ul>
      </section>
      <section aria-labelledby={sectionId('Sources')}>
        <h2 id={sectionId('Sources')} className="scroll-mt-28 font-heading text-2xl font-bold text-navy-900">Sources and scope notes</h2>
        <p className="mt-3 text-sm leading-relaxed text-navy-600">Sources support educational understanding; they do not establish academy accreditation or approval. Recommendations apply to their stated populations and jurisdictions; qualified reviewers must check currency, applicability and local professional requirements before any future use.</p>
        <ul className="mt-5 space-y-5">{draft.evidence.map(source => (
          <li key={source.url} className="text-sm leading-relaxed">
            <a className="break-words font-semibold text-clinical-700 underline underline-offset-4" href={source.url} target="_blank" rel="noopener noreferrer">{source.organisation}: {source.title}<span className="sr-only"> (opens in a new tab)</span></a>
            <p className="mt-2 text-navy-600">{source.note}</p>
          </li>
        ))}</ul>
      </section>
      <section aria-labelledby={sectionId('FAQs')}>
        <h2 id={sectionId('FAQs')} className="mb-4 scroll-mt-28 font-heading text-2xl font-bold text-navy-900">Frequently asked questions</h2>
        <FAQAccordion items={draft.faqs.map((item, index) => ({ id: `${prefix}-faq-${index}`, ...item }))} />
      </section>
    </div>
  );
}
