import { useCallback, useRef, useState } from 'react';
import { useLearnerRead } from './useLearnerRead';
import type {
  AssessmentAnswer, AssessmentAttempt, AssessmentQuestion, AssessmentResponseInput,
  LearningAssessment, createLearnerApi,
} from './learnerApi';

type LearnerApi = ReturnType<typeof createLearnerApi>;
const buttonClass = 'rounded-lg border border-teal-600 px-3 py-2 text-sm font-semibold text-teal-800 disabled:opacity-50';
const panelClass = 'mt-5 rounded-xl border border-navy-100 bg-white p-5';

function AssessmentNotice({ name, status, retry }: { name: string; status: 'loading' | 'error'; retry: () => void }) {
  return status === 'loading'
    ? <p role="status" className="mt-3">Loading {name}…</p>
    : <div role="alert" className="mt-3"><p>{name} could not be loaded. This does not mean no records exist.</p><button type="button" className={`${buttonClass} mt-2`} onClick={retry}>Retry {name}</button></div>;
}

function completeAnswer(question: AssessmentQuestion, answer: AssessmentAnswer | undefined) {
  if (question.question_type === 'true_false') return typeof answer === 'boolean';
  if (question.question_type === 'multiple_choice') return Array.isArray(answer) && answer.length > 0;
  return typeof answer === 'string' && answer.trim().length > 0;
}

export default function AssessmentWorkspace({ api, courseId, active }: { api: LearnerApi; courseId: string; active: boolean }) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<LearningAssessment | null>(null);
  const [attemptPage, setAttemptPage] = useState(0);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [message, setMessage] = useState<string | null>(null);

  const assessmentsLoad = useCallback(() => api.listAssessments(courseId, page), [api, courseId, page]);
  const assessments = useLearnerRead(assessmentsLoad);
  const attemptsLoad = useCallback(
    () => selected ? api.listAssessmentAttempts(selected.id, attemptPage) : Promise.resolve([] as AssessmentAttempt[]),
    [api, selected?.id, attemptPage],
  );
  const attempts = useLearnerRead(attemptsLoad);
  const questionsLoad = useCallback(
    () => selected && activeAttemptId ? api.listAssessmentQuestions(selected.id, courseId) : Promise.resolve([] as AssessmentQuestion[]),
    [api, selected?.id, courseId, activeAttemptId],
  );
  const questions = useLearnerRead(questionsLoad);

  const chooseAssessment = (assessment: LearningAssessment) => {
    setSelected(assessment);
    setAttemptPage(0);
    setActiveAttemptId(null);
    setAnswers({});
    setMessage(null);
  };

  const startAttempt = async (assessment: LearningAssessment) => {
    if (busyRef.current || !active) return;
    busyRef.current = true;
    setBusy(true);
    setMessage(null);
    setSelected(assessment);
    setAttemptPage(0);
    setAnswers({});
    try {
      const attempt = await api.startAssessmentAttempt(assessment.id);
      setActiveAttemptId(attempt.attemptId);
      attempts.reload();
    } catch {
      setMessage('We could not confirm whether an attempt was created. Reload your attempts before starting again; no automatic retry was sent.');
      setActiveAttemptId(null);
      attempts.reload();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const resumeAttempt = (attempt: AssessmentAttempt) => {
    if (attempt.status !== 'in_progress') return;
    setActiveAttemptId(attempt.id);
    setAnswers({});
    setMessage(null);
  };

  const submitAttempt = async () => {
    if (!selected || !activeAttemptId || busyRef.current || questions.state.status !== 'ready') return;
    const payload: AssessmentResponseInput[] = questions.state.data.map(question => ({
      question_id: question.id,
      answer: answers[question.id],
    }));
    if (!payload.length || questions.state.data.some(question => !completeAnswer(question, answers[question.id]))) {
      setMessage('Answer every question before submitting.');
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await api.submitAssessmentAttempt(activeAttemptId, payload);
      setMessage('Your responses were submitted. No grade or pass result is inferred; the trusted grading workflow is separate.');
      setActiveAttemptId(null);
      setAnswers({});
      attempts.reload();
    } catch {
      setMessage('We could not confirm the submission. Reload your attempts to check its status before trying again; no automatic retry was sent.');
      setActiveAttemptId(null);
      setAnswers({});
      attempts.reload();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const activeAttempt = attempts.state.status === 'ready'
    ? attempts.state.data.find(attempt => attempt.id === activeAttemptId)
    : undefined;

  return <section className={panelClass} aria-labelledby="assessment-workspace-title">
    <h3 id="assessment-workspace-title" className="text-xl font-semibold">Assessments</h3>
    <p className="mt-2 text-sm">Only published assessments for this course are shown. Submitting responses does not issue a grade, CPD credit, or certificate.</p>
    {!active && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm">This enrolment is read-only. You can review previous attempt statuses but cannot start or change an attempt.</p>}
    {message && <p role="status" aria-live="polite" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm">{message}</p>}

    {assessments.state.status !== 'ready' ? <AssessmentNotice name="assessments" status={assessments.state.status} retry={assessments.reload} /> : <>
      {!assessments.state.data.length && <p className="mt-3">No published assessments are available on this page.</p>}
      <ul className="mt-3 space-y-3">{assessments.state.data.map(assessment => <li key={assessment.id} className="rounded-lg bg-navy-50 p-4">
        <h4 className="font-semibold">{assessment.title}</h4>
        {assessment.instructions && <p className="mt-2 whitespace-pre-wrap">{assessment.instructions}</p>}
        <p className="mt-2 text-sm">Maximum attempts: {assessment.max_attempts}</p>
        <button type="button" className={`${buttonClass} mt-3`} onClick={() => chooseAssessment(assessment)} aria-pressed={selected?.id === assessment.id}>View attempts</button>
        {active && <button type="button" className={`${buttonClass} ml-2 mt-3`} disabled={busy} onClick={() => void startAttempt(assessment)}>Start new attempt</button>}
      </li>)}</ul>
      <nav aria-label="Assessment pagination" className="mt-3 flex items-center gap-3">
        <button type="button" className={buttonClass} disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous assessments</button>
        <span>Page {page + 1}</span>
        <button type="button" className={buttonClass} disabled={assessments.state.data.length < 10} onClick={() => setPage(value => value + 1)}>Next assessments</button>
      </nav>
    </>}

    {selected && <section className="mt-6 border-t border-navy-100 pt-5" aria-labelledby="assessment-attempts-title">
      <h4 id="assessment-attempts-title" className="text-lg font-semibold">{selected.title}: your attempts</h4>
      {attempts.state.status !== 'ready' ? <AssessmentNotice name="attempts" status={attempts.state.status} retry={attempts.reload} /> : <>
        {!attempts.state.data.length && <p className="mt-3">No attempts were returned. Starting an attempt requires an active enrolment.</p>}
        <ul className="mt-3 space-y-2">{attempts.state.data.map(attempt => <li key={attempt.id} className="rounded-lg bg-navy-50 p-3">
          <p className="font-medium">Attempt {attempt.attempt_number}: {attempt.status.replace('_', ' ')}</p>
          {attempt.status === 'graded' && <p className="mt-1 text-sm">Recorded result: {attempt.score_percent ?? 'Unavailable'}% — {attempt.passed === true ? 'Passed' : attempt.passed === false ? 'Not passed' : 'Outcome unavailable'}</p>}
          {attempt.status === 'submitted' && <p className="mt-1 text-sm">Submitted for grading; no pass result is available yet.</p>}
          {attempt.status === 'in_progress' && active && <button type="button" className={`${buttonClass} mt-2`} disabled={busy} onClick={() => resumeAttempt(attempt)}>Resume attempt {attempt.attempt_number}</button>}
        </li>)}</ul>
        <button type="button" className={`${buttonClass} mt-3`} disabled={busy} onClick={attempts.reload}>Reload attempts</button>
        <nav aria-label="Attempt pagination" className="mt-3 flex items-center gap-3">
          <button type="button" className={buttonClass} disabled={attemptPage === 0} onClick={() => setAttemptPage(value => value - 1)}>Previous attempts</button>
          <span>Page {attemptPage + 1}</span>
          <button type="button" className={buttonClass} disabled={attempts.state.data.length < 10} onClick={() => setAttemptPage(value => value + 1)}>Next attempts</button>
        </nav>
      </>}
    </section>}

    {selected && activeAttemptId && activeAttempt?.status !== 'submitted' && activeAttempt?.status !== 'graded' && activeAttempt?.status !== 'voided' && <section className="mt-6 border-t border-navy-100 pt-5" aria-labelledby="active-assessment-title">
      <h4 id="active-assessment-title" className="text-lg font-semibold">Assessment in progress</h4>
      {questions.state.status !== 'ready' ? <AssessmentNotice name="questions" status={questions.state.status} retry={questions.reload} /> : <>
        {questions.state.data.length === 0 && <p role="alert" className="mt-3">This assessment has no available questions. Do not submit an empty attempt; contact the academy.</p>}
        <div className="mt-4 space-y-5">{questions.state.data.map((question, index) => <fieldset key={question.id} className="rounded-lg border border-navy-100 p-4">
          <legend className="px-1 font-semibold">{index + 1}. {question.prompt}</legend>
          {question.question_type === 'single_choice' && <div className="mt-3 space-y-2">{(question.choices ?? []).map(choice => {
            const id = `q-${question.id}-${choice.id}`;
            return <label key={choice.id} htmlFor={id} className="flex items-start gap-2"><input id={id} type="radio" name={question.id} checked={answers[question.id] === choice.id} onChange={() => setAnswers(value => ({ ...value, [question.id]: choice.id }))} /><span>{choice.label}</span></label>;
          })}</div>}
          {question.question_type === 'multiple_choice' && <div className="mt-3 space-y-2">{(question.choices ?? []).map(choice => {
            const id = `q-${question.id}-${choice.id}`;
            const selectedValues = Array.isArray(answers[question.id]) ? answers[question.id] as string[] : [];
            return <label key={choice.id} htmlFor={id} className="flex items-start gap-2"><input id={id} type="checkbox" checked={selectedValues.includes(choice.id)} onChange={event => setAnswers(value => {
              const current = Array.isArray(value[question.id]) ? value[question.id] as string[] : [];
              const next = event.target.checked ? [...current, choice.id] : current.filter(item => item !== choice.id);
              return { ...value, [question.id]: next };
            })} /><span>{choice.label}</span></label>;
          })}</div>}
          {question.question_type === 'true_false' && <div className="mt-3 flex gap-5">{[true, false].map(value => <label key={String(value)} className="flex items-center gap-2"><input type="radio" name={question.id} checked={answers[question.id] === value} onChange={() => setAnswers(current => ({ ...current, [question.id]: value }))} />{value ? 'True' : 'False'}</label>)}</div>}
          {question.question_type === 'short_answer' && <label className="mt-3 block">Your answer<textarea className="mt-2 w-full rounded-lg border border-navy-200 p-3" rows={4} maxLength={10000} value={typeof answers[question.id] === 'string' ? answers[question.id] as string : ''} onChange={event => setAnswers(current => ({ ...current, [question.id]: event.target.value }))} /></label>}
        </fieldset>)}</div>
        <button type="button" className={`${buttonClass} mt-5`} disabled={busy || !questions.state.data.length || questions.state.data.some(question => !completeAnswer(question, answers[question.id]))} onClick={() => void submitAttempt()}>{busy ? 'Submitting…' : 'Submit assessment'}</button>
        <p className="mt-2 text-xs text-navy-500">Once accepted by the server, responses are locked. If the request outcome is uncertain, reload your attempts before trying again.</p>
      </>}
    </section>}
  </section>;
}
