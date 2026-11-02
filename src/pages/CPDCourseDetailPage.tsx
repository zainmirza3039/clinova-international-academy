import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Info } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useSelfStudyLearning } from '@/hooks/useSelfStudyLearning';
import { safeReturnTarget } from '@/auth/authUtils';
import Breadcrumbs from '@/components/Breadcrumbs';
import CurriculumDraftContent from '@/components/CurriculumDraftContent';
import { publishedCPDCourses } from '@/data/cpdCourses';
import { getCPDCurriculum } from '@/data/cpdCurricula';

type SelfStudyWorkflow = ReturnType<typeof useSelfStudyLearning>;

function SelfStudyEnrollmentPanel({ workflow, returnTo }: { workflow: SelfStudyWorkflow; returnTo: string }) {
  const signInHref = `/sign-in?returnTo=${encodeURIComponent(safeReturnTarget(returnTo))}`;
  const progress = workflow.progress;
  const progressPercent = progress && progress.totalLessons > 0
    ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
    : 0;

  return (
    <section className="border-b border-navy-100 bg-surface-50 py-6" aria-labelledby="self-study-enrollment-title">
      <div className="mx-auto max-w-editorial px-6 lg:px-10">
        <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 id="self-study-enrollment-title" className="font-heading text-xl font-bold text-navy-900">Self-study enrollment and reading progress</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-600">Reading markers are self-reported. They are not graded assessment, verified completion, evidence of competence, CPD credit or certification.</p>

          {workflow.status === 'disabled' && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-950" role="status">Authenticated enrollment and saved reading markers are not enabled in this build. The public learning outline remains available; this page has not saved learner information.</p>}
          {workflow.status === 'auth-loading' && <p className="mt-4 text-sm text-navy-600" role="status">Checking your learner account…</p>}
          {workflow.status === 'signed-out' && <p className="mt-4 text-sm leading-6 text-navy-700">Sign in to enroll and save your own reading markers when learner services are enabled. <Link to={signInHref} className="font-semibold text-clinical-700 underline underline-offset-4">Sign in or create an account</Link>.</p>}
          {workflow.status === 'loading' && <p className="mt-4 text-sm text-navy-600" role="status">Loading your reading record…</p>}
          {workflow.status === 'error' && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{workflow.error ?? 'Self-study records are unavailable.'}</p>}

          {workflow.status === 'ready' && progress && !progress.enrollmentId && (
            <div className="mt-4">
              <button type="button" onClick={() => void workflow.enroll()} disabled={workflow.enrolling} className="inline-flex items-center justify-center rounded-md bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60">
                {workflow.enrolling ? 'Enrolling…' : 'Enroll for self-study reading'}
              </button>
              <p className="mt-2 text-xs leading-5 text-navy-500">Enrollment provides access to personal reading markers only; no graded assessment or award is included.</p>
            </div>
          )}

          {workflow.status === 'ready' && progress?.enrollmentId && (
            <div className="mt-4 max-w-xl">
              <p className="text-sm font-semibold text-navy-800">Enrolled for self-study reading</p>
              <div className="mt-3 flex items-center justify-between gap-4 text-sm text-navy-600">
                <span>Lessons marked as read</span>
                <span className="font-semibold tabular-nums text-navy-900">{progress.completedLessons} of {progress.totalLessons}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100" role="progressbar" aria-label="Lessons marked as read" aria-valuemin={0} aria-valuemax={progress.totalLessons} aria-valuenow={progress.completedLessons}>
                <div className="h-full rounded-full bg-teal-600" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="mt-2 text-xs leading-5 text-navy-500">This display counts your self-reported reading markers, not assessment or verified course completion.</p>
            </div>
          )}

          {workflow.actionError && <p className="mt-4 text-sm text-red-800" role="alert">{workflow.actionError}</p>}
        </div>
      </div>
    </section>
  );
}

export default function CPDCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const course = publishedCPDCourses.find((item) => item.slug === slug);
  const curriculum = slug ? getCPDCurriculum(slug) : undefined;
  const workflow = useSelfStudyLearning(course?.slug ?? '');

  useSEO({
    title: course?.title ?? 'Learning Topic Not Found',
    description: course?.description ?? 'The requested learning topic could not be found.',
    ogImage: course?.image,
  });

  if (!course) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 py-24 text-center">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy-900">Learning topic not found</h1>
          <p className="mt-3 text-sm text-navy-600">This address does not match a topic in the current catalogue.</p>
          <Link to="/cpd-courses" className="mt-6 inline-flex items-center gap-2 font-semibold text-clinical-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Browse self-study courses
          </Link>
        </div>
      </section>
    );
  }

  const related = publishedCPDCourses
    .filter((item) => item.slug !== course.slug && item.department === course.department)
    .slice(0, 3);
  const lessonCount = curriculum?.modules.reduce((total, module) => total + module.lessons.length, 0) ?? 0;
  const cpdHours = course.cpdHours === null
    ? 'Not listed in the course record'
    : `${course.cpdHours} ${course.cpdHours === 1 ? 'hour' : 'hours'}`;

  return (
    <>
      <header className="relative overflow-hidden bg-navy-900">
        <div className="absolute inset-0" aria-hidden="true">
          <img src={course.image} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/95 to-navy-900/60" />
        </div>
        <div className="relative mx-auto max-w-editorial px-6 pb-14 pt-28 lg:px-10 lg:pb-16 lg:pt-36">
          <Breadcrumbs items={[
            { label: 'Home', to: '/' },
            { label: 'Professional Development', to: '/cpd-courses' },
            { label: course.title },
          ]} />
          <div className="mt-8 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-300">
                Published self-study guide · {course.department}
              </p>
              <h1 className="mt-4 max-w-4xl font-heading text-3xl font-bold leading-tight text-white md:text-5xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-navy-100/80 md:text-lg">{course.description}</p>
              <div className="mt-6 flex flex-wrap gap-3" aria-label="Course summary">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
                  <BookOpen className="h-4 w-4 text-teal-300" aria-hidden="true" /> {course.duration}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
                  {course.level} level
                </span>
                {curriculum && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
                    {curriculum.modules.length} modules · {lessonCount} lessons
                  </span>
                )}
              </div>
            </div>
            <img
              src={course.image}
              alt=""
              className="hidden aspect-[5/4] w-full rounded-xl border border-white/15 object-cover shadow-xl lg:col-span-4 lg:block"
            />
          </div>
        </div>
      </header>

      <aside className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-editorial items-start gap-3 px-6 py-5 lg:px-10">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
          <p className="text-sm leading-6 text-amber-950">
            <strong>Current learning offer:</strong> This public guide provides educational reading and reflective activities. Where authenticated learner services are enabled, you may enroll and save self-reported reading markers. There is no graded assessment, verified completion, certificate or approved CPD-hour value listed for this course.
          </p>
        </div>
      </aside>

      <SelfStudyEnrollmentPanel workflow={workflow} returnTo={`${location.pathname}${location.search}`} />

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-editorial grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-12 lg:px-10">
          <article className="min-w-0 space-y-10 lg:col-span-8">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinical-700">About this course</p>
              <h2 className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">Published learning outline</h2>
              <p className="mt-4 text-base leading-7 text-navy-700">
                Review the learning outcomes, intended audience, prerequisites, modules and evidence sources below. This independent study material does not establish clinical competence or replace professional judgement, supervision or local requirements.
              </p>
              {curriculum ? (
                <div className="mt-6">
                  <CurriculumDraftContent
                    draft={curriculum}
                    allowSelfStudyMarkers
                    completedLessonKeys={workflow.progress?.completedLessonKeys}
                    savingLessonKey={workflow.savingLessonKey}
                    onMarkLessonRead={workflow.status === 'ready' && workflow.progress?.enrollmentId ? workflow.markRead : undefined}
                  />
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-navy-100 bg-surface-50 p-6">
                  <h3 className="font-heading text-xl font-bold text-navy-900">Curriculum details unavailable</h3>
                  <p className="mt-2 text-sm leading-6 text-navy-600">A detailed learning outline is not present in the current published records for this topic.</p>
                </div>
              )}
            </section>
          </article>

          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-navy-100 p-6 shadow-sm lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinical-700">At a glance</p>
              <h2 className="mt-3 font-heading text-xl font-bold text-navy-900">Course information</h2>
              <dl className="mt-5 divide-y divide-navy-100">
                <div className="py-3">
                  <dt className="text-xs text-navy-500">Subject area</dt>
                  <dd className="mt-1 text-sm font-semibold text-navy-800">{course.department}</dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs text-navy-500">Study level</dt>
                  <dd className="mt-1 text-sm font-semibold text-navy-800">{course.level}</dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs text-navy-500">Study format</dt>
                  <dd className="mt-1 text-sm font-semibold text-navy-800">{course.duration}</dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs text-navy-500">CPD hours</dt>
                  <dd className="mt-1 text-sm font-semibold text-navy-800">{cpdHours}</dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs text-navy-500">Instructor</dt>
                  <dd className="mt-1 text-sm font-semibold text-navy-800">Not listed in the published course record</dd>
                </div>
              </dl>
              <div className="mt-5 border-t border-navy-100 pt-5">
                <p className="text-sm leading-6 text-navy-600">
                  The guide does not award CPD credit or a certificate. Any saved reading markers are self-reported; they do not represent graded or verified completion.
                </p>
                <Link to="/contact" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800">
                  Contact the Academy <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to="/cpd-courses" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-navy-200 px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Browse other courses
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-surface-50 py-12">
          <div className="mx-auto max-w-editorial px-6 lg:px-10">
            <h2 className="font-heading text-2xl font-bold text-navy-900">Related learning topics</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    className="flex h-full items-center justify-between gap-3 rounded-lg border border-navy-100 bg-white p-4 text-sm font-semibold text-navy-800 hover:border-clinical-300 hover:text-clinical-700"
                    to={`/cpd-courses/${item.slug}`}
                  >
                    {item.title}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
