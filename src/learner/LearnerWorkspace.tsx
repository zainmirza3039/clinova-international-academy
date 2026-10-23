import { useCallback, useMemo, useRef, useState } from 'react';
import { createLearnerApi, LEARNER_PAGE_SIZE, type Enrolment, type LearningCourse, type LearningLesson, type LearningModule } from './learnerApi';
import { useLearnerRead } from './useLearnerRead';
import AssessmentWorkspace from './AssessmentWorkspace';

type LearnerApi = ReturnType<typeof createLearnerApi>;
const buttonClass = 'rounded-lg border border-teal-600 px-3 py-2 text-sm font-semibold text-teal-800 disabled:opacity-50';
const panelClass = 'mt-6 rounded-xl border border-navy-100 bg-white p-5';

function ReadNotice({ name, status, retry }: { name: string; status: 'loading' | 'error'; retry: () => void }) {
  return status === 'loading'
    ? <p role="status" className="mt-4">Loading {name}…</p>
    : <div role="alert" className="mt-4"><p>{name} could not be loaded. This is not evidence of missing records or zero progress.</p><button type="button" className={`${buttonClass} mt-3`} onClick={retry}>Retry {name}</button></div>;
}
function Pages({ name, page, rows, setPage }: { name: string; page: number; rows: number; setPage: (page: number) => void }) {
  return <nav aria-label={`${name} pagination`} className="mt-4 flex flex-wrap items-center gap-3"><button type="button" className={buttonClass} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous {name}</button><span>Page {page + 1}</span><button type="button" className={buttonClass} disabled={rows < LEARNER_PAGE_SIZE} onClick={() => setPage(page + 1)}>Next {name}</button></nav>;
}

export default function LearnerWorkspace({ api }: { api: LearnerApi }) {
  const profileLoad = useCallback(() => api.getProfile(), [api]);
  const profile = useLearnerRead(profileLoad);
  const [page, setPage] = useState(0);
  const enrolmentsLoad = useCallback(() => api.listEnrolments(page), [api, page]);
  const enrolments = useLearnerRead(enrolmentsLoad);
  return <div className="mt-8 text-navy-800">
    <p className="rounded-lg bg-amber-50 p-4">Local integration candidate only. The learner schema is not applied live; hosted RLS, sign-in callbacks and persistence have not been verified. Completion markers are self-reported study activity, not assessment passes, CPD credit or awards.</p>
    <section className={panelClass} aria-labelledby="learner-profile"><h2 id="learner-profile" className="text-xl font-semibold">Your profile</h2>
      {profile.state.status !== 'ready' ? <ReadNotice name="profile" status={profile.state.status} retry={profile.reload} /> : profile.state.data ? <p className="mt-3 break-words">Display name: {profile.state.data.display_name}</p> : <p className="mt-3">No profile has been provisioned for this account. Profile creation and editing are not available here.</p>}
    </section>
    <section className={panelClass} aria-labelledby="learner-enrolments"><h2 id="learner-enrolments" className="text-xl font-semibold">Your enrolment records</h2><p className="mt-2 text-sm">Only your existing records are read. This page does not offer enrolment or change its status.</p>
      {enrolments.state.status !== 'ready' ? <ReadNotice name="enrolments" status={enrolments.state.status} retry={enrolments.reload} /> : <>
        <EnrolmentPage key={page} api={api} enrolments={enrolments.state.data} />
        <Pages name="enrolments" page={page} rows={enrolments.state.data.length} setPage={setPage} />
      </>}
    </section>
  </div>;
}

function EnrolmentPage({ api, enrolments }: { api: LearnerApi; enrolments: Enrolment[] }) {
  const ids = enrolments.map(record => record.course_id).join(',');
  const coursesLoad = useCallback(() => api.listCourses(ids ? ids.split(',') : []), [api, ids]);
  const courses = useLearnerRead(coursesLoad);
  const [selected, setSelected] = useState<string | null>(null);
  if (!enrolments.length) return <p className="mt-4">No enrolment records were returned for this page. Nothing has been created or inferred.</p>;
  if (courses.state.status !== 'ready') return <ReadNotice name="published course details" status={courses.state.status} retry={courses.reload} />;
  const selectedRecord = enrolments.find(record => record.course_id === selected);
  const selectedCourse = courses.state.data.find(course => course.id === selected);
  return <>
    <ul className="mt-4 space-y-4">{enrolments.map(record => {
      const course = courses.state.status === 'ready' ? courses.state.data.find(item => item.id === record.course_id) : undefined;
      return <li key={record.id} className="rounded-lg bg-navy-50 p-4"><h3 className="font-semibold">{course?.title ?? 'Course currently unavailable'}</h3><p className="mt-1">Enrolment status: {record.status}</p>
        {course && record.status !== 'withdrawn' ? <button type="button" className={`${buttonClass} mt-3`} onClick={() => setSelected(course.id)}>Read {course.title}</button> : <p className="mt-2 text-sm">Lesson access is unavailable for this record. No enrolment or publication state is changed here.</p>}
      </li>;
    })}</ul>
    {selectedRecord && selectedCourse && <CourseReading key={`${selectedRecord.id}-${selectedRecord.status}`} api={api} course={selectedCourse} enrolment={selectedRecord} />}
  </>;
}

function CourseReading({ api, course, enrolment }: { api: LearnerApi; course: LearningCourse; enrolment: Enrolment }) {
  const [modulePage, setModulePage] = useState(0);
  const [progressPage, setProgressPage] = useState(0);
  const moduleLoad = useCallback(() => api.listModules(course.id, modulePage), [api, course.id, modulePage]);
  const progressLoad = useCallback(() => api.listProgress(course.id, progressPage), [api, course.id, progressPage]);
  const modules = useLearnerRead(moduleLoad);
  const progress = useLearnerRead(progressLoad);
  const [message, setMessage] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [showAssessments, setShowAssessments] = useState(false);
  const recorded = useMemo(() => progress.state.status === 'ready' ? new Set(progress.state.data.map(marker => marker.lesson_id)) : new Set<string>(), [progress.state]);
  const reloadProgress = () => {
    setVerificationPending(true);
    progress.reload();
  };
  // Both ambiguous writes and accepted writes require a successful marker reread.
  const mayRetry = verificationPending && progress.state.status === 'ready';
  const writeLocked = busy || ((uncertain || accepted) && !mayRetry);
  const complete = async (lessonId: string, completed: boolean) => {
    if (busyRef.current || enrolment.status !== 'active' || writeLocked) return;
    busyRef.current = true; setBusy(true); setMessage(null); setUncertain(false); setAccepted(false); setVerificationPending(false);
    try {
      await api.setLessonCompletion(lessonId, completed);
      setAccepted(true);
      setVerificationPending(true);
      progress.reload();
    } catch {
      setMessage('We could not confirm the completion change. It may have reached the server. Reload saved markers before trying again; no automatic retry was sent.');
      setUncertain(true);
    } finally { busyRef.current = false; setBusy(false); }
  };
  return <section className={panelClass} aria-labelledby="course-reading-title"><h2 id="course-reading-title" className="text-2xl font-semibold">{course.title}</h2><p className="mt-3 whitespace-pre-wrap break-words">{course.summary}</p>
    <p className="mt-3 text-sm">Published content is read from the backend contract only. The draft public curricula are not copied, published or linked to real enrolment records.</p>
    {enrolment.status !== 'active' && <p className="mt-3">Read-only access: completed enrolments cannot change completion markers.</p>}
    {busy && <p className="mt-4" role="status">Saving completion change…</p>}
    {message && <p className="mt-4 rounded-lg bg-amber-50 p-3" role={uncertain ? 'alert' : 'status'}>{message}</p>}
    {accepted && <p className="mt-4 rounded-lg bg-amber-50 p-3" role={progress.state.status === 'error' ? 'alert' : 'status'}>{progress.state.status === 'ready'
      ? 'Completion change accepted. Saved markers reloaded; this is not assessment or award evidence.'
      : progress.state.status === 'error'
        ? 'Completion change accepted, but saved markers could not be verified. Completion controls remain locked. Reload saved markers before making another change; no automatic write retry was sent.'
        : 'Completion change accepted. Verifying saved markers; completion controls remain locked until they reload successfully.'}</p>}
    <section className={panelClass} aria-labelledby="saved-markers"><h3 id="saved-markers" className="text-lg font-semibold">Saved completion markers</h3><p className="mt-2 text-sm">Paginated records, not a total or percentage. Absence on this page does not mean a lesson is incomplete. Assessment and certificate records are not queried.</p>
      <button type="button" className={`${buttonClass} mt-3`} disabled={busy || progress.state.status === 'loading'} onClick={reloadProgress}>Reload saved markers</button>
      {progress.state.status !== 'ready' ? <ReadNotice name="saved completion markers" status={progress.state.status} retry={reloadProgress} /> : <>
        {progress.state.data.length ? <ul className="mt-3 list-disc space-y-2 pl-5">{progress.state.data.map(marker => <li key={marker.lesson_id}>Saved study marker for lesson <span className="break-all">{marker.lesson_id}</span><span className="sr-only">. This is not a course completion or certificate.</span></li>)}</ul> : <p className="mt-3">No saved markers were returned for this page.</p>}
        <Pages name="markers" page={progressPage} rows={progress.state.data.length} setPage={setProgressPage} />
      </>}
    </section>
    {modules.state.status !== 'ready' ? <ReadNotice name="modules" status={modules.state.status} retry={modules.reload} /> : <>
      {!modules.state.data.length && <p className="mt-4">No modules are currently available for this page and access level.</p>}
      {modules.state.data.map(module => <ModuleReading key={module.id} api={api} module={module} active={enrolment.status === 'active'} writeLocked={writeLocked} onComplete={complete} recorded={recorded} />)}
      <Pages name="modules" page={modulePage} rows={modules.state.data.length} setPage={setModulePage} />
    </>}
    <section className={panelClass} aria-labelledby="course-assessments-toggle">
      <h3 id="course-assessments-toggle" className="text-lg font-semibold">Assessments</h3>
      <p className="mt-2 text-sm">Assessment records are loaded only when you open this section.</p>
      <button type="button" className={`${buttonClass} mt-3`} aria-expanded={showAssessments} aria-controls="course-assessments-panel" onClick={() => setShowAssessments(value => !value)}>
        {showAssessments ? 'Hide assessments' : 'View assessments'}
      </button>
      {showAssessments && <div id="course-assessments-panel"><AssessmentWorkspace api={api} courseId={course.id} active={enrolment.status === 'active'} /></div>}
    </section>
  </section>;
}

function ModuleReading({ api, module, active, writeLocked, onComplete, recorded }: {
  api: LearnerApi; module: LearningModule; active: boolean; writeLocked: boolean;
  onComplete: (id: string, completed: boolean) => Promise<void>; recorded: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  return <section className={panelClass}><h3 className="text-xl font-semibold">{module.title}</h3><button type="button" className={`${buttonClass} mt-3`} aria-expanded={open} aria-controls={`module-${module.id}-lessons`} onClick={() => setOpen(value => !value)}>{open ? 'Hide' : 'Open'} lessons: {module.title}</button>
    <div id={`module-${module.id}-lessons`} hidden={!open}>{open && <LessonPage api={api} module={module} active={active} writeLocked={writeLocked} onComplete={onComplete} recorded={recorded} />}</div>
  </section>;
}
function LessonPage({ api, module, active, writeLocked, onComplete, recorded }: {
  api: LearnerApi; module: LearningModule; active: boolean; writeLocked: boolean;
  onComplete: (id: string, completed: boolean) => Promise<void>; recorded: Set<string>;
}) {
  const [page, setPage] = useState(0);
  const load = useCallback(() => api.listLessons(module.course_id, module.id, page), [api, module.course_id, module.id, page]);
  const lessons = useLearnerRead(load);
  return <div>
    {lessons.state.status !== 'ready' ? <ReadNotice name={`lessons for ${module.title}`} status={lessons.state.status} retry={lessons.reload} /> : <>
      {!lessons.state.data.length && <p className="mt-4">No published lessons are available on this page.</p>}
      {lessons.state.data.map((lesson: LearningLesson) => <article key={lesson.id} className="mt-5 border-t border-navy-100 pt-5"><h4 className="text-lg font-semibold">{lesson.title}</h4><p className="mt-2 text-xs">Lesson reading, displayed as plain text. Embedded HTML and links are not executed.</p><div className="mt-4 whitespace-pre-wrap break-words">{lesson.body_markdown}</div>
        {recorded.has(lesson.id) && <p className="mt-3">A saved self-reported marker appears on the loaded markers page.</p>}
        {active && <div className="mt-4 flex flex-wrap gap-3"><button type="button" className={buttonClass} disabled={writeLocked} onClick={() => void onComplete(lesson.id, true)} aria-label={`Mark reading complete: ${lesson.title}`}>Mark reading complete</button><button type="button" className={buttonClass} disabled={writeLocked} onClick={() => void onComplete(lesson.id, false)} aria-label={`Remove completion marker: ${lesson.title}`}>Remove completion marker</button></div>}
      </article>)}
      <Pages name={`lessons for ${module.title}`} page={page} rows={lessons.state.data.length} setPage={setPage} />
    </>}
  </div>;
}
