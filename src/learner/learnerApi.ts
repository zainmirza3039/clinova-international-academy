import type { SupabaseClient } from '@supabase/supabase-js';

export const LEARNER_PAGE_SIZE = 10;

export type StudentProfile = { user_id: string; display_name: string };
export type Enrolment = {
  id: string;
  course_id: string;
  status: 'active' | 'completed' | 'withdrawn';
  enrolled_at: string;
};
export type LearningCourse = { id: string; slug: string; title: string; summary: string };
export type LearningModule = { id: string; course_id: string; title: string; position: number };
export type LearningLesson = {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  body_markdown: string;
  position: number;
};
export type LessonProgress = {
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed_at: string;
};
export type LearningAssessment = {
  id: string;
  course_id: string;
  title: string;
  instructions: string | null;
  max_attempts: number;
};
export type AssessmentChoice = { id: string; label: string };
export type AssessmentQuestion = {
  id: string;
  assessment_id: string;
  course_id: string;
  prompt: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer';
  choices: AssessmentChoice[] | null;
  points: number;
  position: number;
};
export type AssessmentAnswer = string | string[] | boolean;
export type AssessmentResponseInput = { question_id: string; answer: AssessmentAnswer };
export type AssessmentAttempt = {
  id: string;
  assessment_id: string;
  attempt_number: number;
  status: 'in_progress' | 'submitted' | 'graded' | 'voided';
  score_percent: number | null;
  passed: boolean | null;
  started_at: string;
  submitted_at: string | null;
};

const PROFILE_COLUMNS = 'user_id, display_name';
const ENROLMENT_COLUMNS = 'id, course_id, status, enrolled_at';
const COURSE_COLUMNS = 'id, slug, title, summary';
const MODULE_COLUMNS = 'id, course_id, title, position';
const LESSON_COLUMNS = 'id, course_id, module_id, title, body_markdown, position';
const PROGRESS_COLUMNS = 'user_id, course_id, lesson_id, completed_at';
const ASSESSMENT_COLUMNS = 'id, course_id, title, instructions, max_attempts';
const QUESTION_COLUMNS = 'id, assessment_id, course_id, prompt, question_type, choices, points, position';
const ATTEMPT_COLUMNS = 'id, assessment_id, attempt_number, status, score_percent, passed, started_at, submitted_at';
const SAFE_LOAD_ERROR = 'Unable to load learner data. Please try again.';
const SAFE_WRITE_ERROR = 'Unable to update lesson progress. Please try again.';
const SAFE_ASSESSMENT_ERROR = 'Unable to complete the assessment action. Please try again.';
const SAFE_UNAVAILABLE_ERROR = 'Learner access is currently unavailable.';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type QueryResult<T> = { data: T | null; error: unknown };

function pageRange(page: number) {
  return [page * LEARNER_PAGE_SIZE, (page + 1) * LEARNER_PAGE_SIZE - 1] as const;
}

function validPage(page: number) {
  return Number.isSafeInteger(page) && page >= 0 && Number.isSafeInteger((page + 1) * LEARNER_PAGE_SIZE);
}

function safeError(kind: 'load' | 'write' | 'assessment' | 'unavailable') {
  return new Error(kind === 'write' ? SAFE_WRITE_ERROR : kind === 'assessment' ? SAFE_ASSESSMENT_ERROR : kind === 'unavailable' ? SAFE_UNAVAILABLE_ERROR : SAFE_LOAD_ERROR);
}

function assertResponse<T>(result: QueryResult<T>, kind: 'load' | 'write'): T {
  if (result.error || result.data === null || result.data === undefined) throw safeError(kind);
  return result.data;
}

function assertList<T>(result: QueryResult<T[]>, kind: 'load' | 'write'): T[] {
  const data = assertResponse(result, kind);
  if (!Array.isArray(data)) throw safeError(kind);
  return data;
}

function assertPage(page: number) {
  if (!validPage(page)) throw new Error('Invalid learner page.');
}

function assertUuid(value: string, label: string) {
  if (!UUID.test(value)) throw new Error(`Invalid ${label}.`);
}

export function createLearnerApi(client: SupabaseClient | null, enabled: boolean, userId: string | null) {
  const available = enabled && client !== null && userId !== null && UUID.test(userId);
  const unavailable = () => { throw safeError('unavailable'); };

  const getProfile = async (): Promise<StudentProfile | null> => {
    if (!available) return unavailable();
    try {
      const result = await client!.from('student_profiles').select(PROFILE_COLUMNS).eq('user_id', userId!).maybeSingle();
      if (result.error) throw safeError('load');
      if (result.data === null) return null;
      if (typeof result.data !== 'object' || result.data === undefined || Array.isArray(result.data) ||
        result.data.user_id !== userId || typeof result.data.display_name !== 'string') throw safeError('load');
      return result.data as StudentProfile;
    } catch (error) {
      if (error instanceof Error && (error.message === SAFE_LOAD_ERROR || error.message === SAFE_UNAVAILABLE_ERROR)) throw error;
      throw safeError('load');
    }
  };

  const listEnrolments = async (page = 0): Promise<Enrolment[]> => {
    if (!available) return unavailable();
    assertPage(page);
    const [from, to] = pageRange(page);
    try {
      const result = await client!.from('student_enrolments').select(ENROLMENT_COLUMNS).eq('user_id', userId!).order('enrolled_at', { ascending: false }).order('id', { ascending: true }).range(from, to);
      return assertList(result, 'load') as Enrolment[];
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_LOAD_ERROR) throw error;
      throw safeError('load');
    }
  };

  const listCourses = async (ids: string[]): Promise<LearningCourse[]> => {
    if (!available) return unavailable();
    if (ids.length === 0) return [];
    if (ids.length > LEARNER_PAGE_SIZE || ids.some((id) => typeof id !== 'string' || !UUID.test(id))) throw new Error('Invalid course IDs.');
    try {
      const result = await client!.from('learning_courses').select(COURSE_COLUMNS).in('id', ids).eq('publication_status', 'published').order('title', { ascending: true }).order('id', { ascending: true }).range(0, LEARNER_PAGE_SIZE - 1);
      return assertList(result, 'load') as LearningCourse[];
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_LOAD_ERROR) throw error;
      throw safeError('load');
    }
  };

  const listModules = async (courseId: string, page = 0): Promise<LearningModule[]> => {
    if (!available) return unavailable();
    assertUuid(courseId, 'course ID');
    assertPage(page);
    const [from, to] = pageRange(page);
    try {
      const result = await client!.from('learning_modules').select(MODULE_COLUMNS).eq('course_id', courseId).order('position', { ascending: true }).order('id', { ascending: true }).range(from, to);
      return assertList(result, 'load') as LearningModule[];
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_LOAD_ERROR) throw error;
      throw safeError('load');
    }
  };

  const listLessons = async (courseId: string, moduleId: string, page = 0): Promise<LearningLesson[]> => {
    if (!available) return unavailable();
    assertUuid(courseId, 'course ID');
    assertUuid(moduleId, 'module ID');
    assertPage(page);
    const [from, to] = pageRange(page);
    try {
      const result = await client!.from('learning_lessons').select(LESSON_COLUMNS).eq('course_id', courseId).eq('module_id', moduleId).eq('publication_status', 'published').order('position', { ascending: true }).order('id', { ascending: true }).range(from, to);
      return assertList(result, 'load') as LearningLesson[];
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_LOAD_ERROR) throw error;
      throw safeError('load');
    }
  };

  const listProgress = async (courseId: string, page = 0): Promise<LessonProgress[]> => {
    if (!available) return unavailable();
    assertUuid(courseId, 'course ID');
    assertPage(page);
    const [from, to] = pageRange(page);
    try {
      const result = await client!.from('lesson_progress').select(PROGRESS_COLUMNS).eq('user_id', userId!).eq('course_id', courseId).order('lesson_id', { ascending: true }).range(from, to);
      return assertList(result, 'load') as LessonProgress[];
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_LOAD_ERROR) throw error;
      throw safeError('load');
    }
  };

  const setLessonCompletion = async (lessonId: string, completed: boolean): Promise<void> => {
    if (!available) return unavailable();
    assertUuid(lessonId, 'lesson ID');
    if (typeof completed !== 'boolean') throw new Error('Invalid completion state.');
    try {
      const result = await client!.rpc('set_my_lesson_completion', { p_lesson_id: lessonId, p_completed: completed });
      if (result.error !== null) throw safeError('write');
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_WRITE_ERROR) throw error;
      throw safeError('write');
    }
  };

  const listAssessments = async (courseId: string, page = 0): Promise<LearningAssessment[]> => {
    if (!available) return unavailable();
    assertUuid(courseId, 'course ID');
    assertPage(page);
    const [from, to] = pageRange(page);
    try {
      const result = await client!.from('learning_assessments').select(ASSESSMENT_COLUMNS)
        .eq('course_id', courseId).eq('publication_status', 'published')
        .order('title', { ascending: true }).order('id', { ascending: true }).range(from, to);
      return assertList(result, 'load') as LearningAssessment[];
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_LOAD_ERROR) throw error;
      throw safeError('load');
    }
  };

  const listAssessmentQuestions = async (assessmentId: string, courseId: string): Promise<AssessmentQuestion[]> => {
    if (!available) return unavailable();
    assertUuid(assessmentId, 'assessment ID');
    assertUuid(courseId, 'course ID');
    try {
      // A bounded read prevents a malformed content record from loading an unbounded quiz.
      const result = await client!.from('learning_assessment_questions').select(QUESTION_COLUMNS)
        .eq('assessment_id', assessmentId).eq('course_id', courseId)
        .order('position', { ascending: true }).order('id', { ascending: true }).range(0, 100);
      const questions = assertList(result, 'load') as AssessmentQuestion[];
      if (questions.length > 100) throw safeError('assessment');
      return questions;
    } catch (error) {
      if (error instanceof Error && (error.message === SAFE_LOAD_ERROR || error.message === SAFE_ASSESSMENT_ERROR)) throw error;
      throw safeError('load');
    }
  };

  const listAssessmentAttempts = async (assessmentId: string, page = 0): Promise<AssessmentAttempt[]> => {
    if (!available) return unavailable();
    assertUuid(assessmentId, 'assessment ID');
    assertPage(page);
    const [from, to] = pageRange(page);
    try {
      const result = await client!.from('learning_assessment_attempts').select(ATTEMPT_COLUMNS)
        .eq('user_id', userId!).eq('assessment_id', assessmentId)
        .order('attempt_number', { ascending: false }).range(from, to);
      return assertList(result, 'load') as AssessmentAttempt[];
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_LOAD_ERROR) throw error;
      throw safeError('load');
    }
  };

  const startAssessmentAttempt = async (assessmentId: string): Promise<{ attemptId: string; attemptNumber: number }> => {
    if (!available) return unavailable();
    assertUuid(assessmentId, 'assessment ID');
    try {
      const result = await client!.rpc('start_my_assessment_attempt', { p_assessment_id: assessmentId });
      if (result.error || !Array.isArray(result.data) || result.data.length !== 1) throw safeError('assessment');
      const row = result.data[0] as { attempt_id?: unknown; attempt_number?: unknown };
      if (typeof row.attempt_id !== 'string' || !UUID.test(row.attempt_id) ||
          !Number.isSafeInteger(row.attempt_number) || (row.attempt_number as number) < 1) throw safeError('assessment');
      return { attemptId: row.attempt_id, attemptNumber: row.attempt_number as number };
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_ASSESSMENT_ERROR) throw error;
      throw safeError('assessment');
    }
  };

  const submitAssessmentAttempt = async (attemptId: string, responses: AssessmentResponseInput[]): Promise<void> => {
    if (!available) return unavailable();
    assertUuid(attemptId, 'attempt ID');
    if (!Array.isArray(responses) || responses.length < 1 || responses.length > 100) throw new Error('Invalid assessment responses.');
    const seen = new Set<string>();
    for (const response of responses) {
      if (!response || typeof response !== 'object' || Object.keys(response).length !== 2 ||
          typeof response.question_id !== 'string' || !UUID.test(response.question_id) ||
          seen.has(response.question_id)) throw new Error('Invalid assessment responses.');
      seen.add(response.question_id);
      const answer = response.answer;
      const validAnswer = typeof answer === 'boolean'
        || (typeof answer === 'string' && answer.trim().length > 0 && answer.length <= 10000)
        || (Array.isArray(answer) && answer.length > 0 && answer.length <= 100 && answer.every(item => typeof item === 'string' && item.trim().length > 0 && item.length <= 100));
      if (!validAnswer) throw new Error('Invalid assessment responses.');
    }
    try {
      const result = await client!.rpc('submit_my_assessment_attempt', { p_attempt_id: attemptId, p_responses: responses });
      if (result.error) throw safeError('assessment');
    } catch (error) {
      if (error instanceof Error && error.message === SAFE_ASSESSMENT_ERROR) throw error;
      throw safeError('assessment');
    }
  };

  return { getProfile, listEnrolments, listCourses, listModules, listLessons, listProgress, setLessonCompletion,
    listAssessments, listAssessmentQuestions, listAssessmentAttempts, startAssessmentAttempt, submitAssessmentAttempt };
}
