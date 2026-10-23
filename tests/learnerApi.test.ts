import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createLearnerApi, LEARNER_PAGE_SIZE } from '../src/learner/learnerApi';

const userId = '11111111-1111-4111-8111-111111111111';
const courseId = '22222222-2222-4222-8222-222222222222';
const moduleId = '33333333-3333-4333-8333-333333333333';
const lessonId = '44444444-4444-4444-8444-444444444444';
const assessmentId = '55555555-5555-4555-8555-555555555555';
const attemptId = '66666666-6666-4666-8666-666666666666';
const questionId = '77777777-7777-4777-8777-777777777777';
function builder(data: unknown = [], error: unknown = null) {
  return {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(), range: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(() => Promise.resolve({ data, error })),
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve({ data, error }).then(resolve, reject),
  };
}
function clientFor(query: ReturnType<typeof builder>) {
  return { from: vi.fn(() => query), rpc: vi.fn() } as unknown as SupabaseClient;
}

describe('learner API contract', () => {
  it.each(['flag', 'client', 'owner', 'invalid-owner'])('fails closed for %s before every query or RPC', async reason => {
    const from = vi.fn(); const rpc = vi.fn();
    const client = reason === 'client' ? null : { from, rpc } as unknown as SupabaseClient;
    const api = createLearnerApi(client, reason !== 'flag', reason === 'owner' ? null : reason === 'invalid-owner' ? 'not-a-user' : userId);
    for (const operation of [() => api.getProfile(), () => api.listEnrolments(), () => api.listCourses([]), () => api.listModules(courseId), () => api.listLessons(courseId, moduleId), () => api.listProgress(courseId), () => api.setLessonCompletion(lessonId, true), () => api.listAssessments(courseId), () => api.listAssessmentQuestions(assessmentId, courseId), () => api.listAssessmentAttempts(assessmentId), () => api.startAssessmentAttempt(assessmentId), () => api.submitAssessmentAttempt(attemptId, [{ question_id: questionId, answer: 'A' }])]) {
      await expect(operation()).rejects.toThrow('currently unavailable');
    }
    expect(from).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled();
  });
  it('reads only the own-profile projection and distinguishes a missing row', async () => {
    const query = builder(null); const api = createLearnerApi(clientFor(query), true, userId);
    await expect(api.getProfile()).resolves.toBeNull();
    expect(query.select).toHaveBeenCalledWith('user_id, display_name');
    expect(query.eq).toHaveBeenCalledWith('user_id', userId);
    const row = { user_id: userId, display_name: 'Synthetic learner' };
    await expect(createLearnerApi(clientFor(builder(row)), true, userId).getProfile()).resolves.toEqual(row);
  });
  it('does not convert malformed or foreign profiles into valid/empty records', async () => {
    for (const row of [[], {}, { user_id: courseId, display_name: 'Other account' }, { user_id: userId, display_name: null }]) {
      await expect(createLearnerApi(clientFor(builder(row)), true, userId).getProfile()).rejects.toThrow('Unable to load learner data');
    }
    const query = builder(); query.maybeSingle.mockResolvedValueOnce({ data: undefined, error: null });
    await expect(createLearnerApi(clientFor(query), true, userId).getProfile()).rejects.toThrow('Unable to load learner data');
  });
  it('uses explicit projections, owner filters and stable bounded ranges', async () => {
    const query = builder([]); const client = clientFor(query); const api = createLearnerApi(client, true, userId);
    await api.listEnrolments(2);
    expect(client.from).toHaveBeenCalledWith('student_enrolments');
    expect(query.select).toHaveBeenCalledWith('id, course_id, status, enrolled_at');
    expect(query.eq).toHaveBeenCalledWith('user_id', userId);
    expect(query.order).toHaveBeenCalledWith('enrolled_at', { ascending: false });
    expect(query.order).toHaveBeenCalledWith('id', { ascending: true });
    expect(query.range).toHaveBeenCalledWith(20, 29);
    await api.listCourses([courseId]);
    expect(query.select).toHaveBeenCalledWith('id, slug, title, summary');
    expect(query.in).toHaveBeenCalledWith('id', [courseId]);
    expect(query.eq).toHaveBeenCalledWith('publication_status', 'published');
    expect(query.range).toHaveBeenCalledWith(0, LEARNER_PAGE_SIZE - 1);
    query.eq.mockClear(); await api.listModules(courseId);
    expect(query.select).toHaveBeenCalledWith('id, course_id, title, position');
    expect(query.eq.mock.calls).toEqual([['course_id', courseId]]);
    await api.listLessons(courseId, moduleId, 1);
    expect(query.select).toHaveBeenCalledWith('id, course_id, module_id, title, body_markdown, position');
    expect(query.eq).toHaveBeenCalledWith('course_id', courseId);
    expect(query.eq).toHaveBeenCalledWith('module_id', moduleId);
    expect(query.eq).toHaveBeenCalledWith('publication_status', 'published');
    expect(query.range).toHaveBeenCalledWith(10, 19);
    await api.listProgress(courseId);
    expect(query.select).toHaveBeenCalledWith('user_id, course_id, lesson_id, completed_at');
    expect(query.eq).toHaveBeenCalledWith('user_id', userId);
    expect(query.eq).toHaveBeenCalledWith('course_id', courseId);
    expect(query.order).toHaveBeenCalledWith('lesson_id', { ascending: true });
    expect(query.select.mock.calls.flat()).not.toContain('*');
    expect(client.from).not.toHaveBeenCalledWith('student_certificates');
    expect(client.from).not.toHaveBeenCalledWith('student_assessment_records');
  });
  it('bounds IDs/pages and never queries for an empty visible-course set', async () => {
    const from = vi.fn(); const api = createLearnerApi({ from } as unknown as SupabaseClient, true, userId);
    await expect(api.listCourses([])).resolves.toEqual([]);
    await expect(api.listCourses(Array.from({ length: 11 }, () => courseId))).rejects.toThrow('Invalid course IDs');
    for (const page of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) await expect(api.listEnrolments(page)).rejects.toThrow('Invalid learner page');
    await expect(api.listModules('')).rejects.toThrow('Invalid course ID');
    await expect(api.listLessons(courseId, '')).rejects.toThrow('Invalid module ID');
    expect(from).not.toHaveBeenCalled();
  });
  it('does not disguise backend errors or malformed lists as empty progress', async () => {
    for (const query of [builder(null), builder({}), builder([], { message: 'secret database detail' })]) {
      await expect(createLearnerApi(clientFor(query), true, userId).listProgress(courseId)).rejects.toThrow('Unable to load learner data');
      await expect(createLearnerApi(clientFor(query), true, userId).listProgress(courseId)).rejects.not.toThrow('secret database detail');
    }
  });
  it('uses only the narrow RPC payload for both marker states', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const api = createLearnerApi({ rpc } as unknown as SupabaseClient, true, userId);
    await api.setLessonCompletion(lessonId, true); await api.setLessonCompletion(lessonId, false);
    expect(rpc.mock.calls).toEqual([
      ['set_my_lesson_completion', { p_lesson_id: lessonId, p_completed: true }],
      ['set_my_lesson_completion', { p_lesson_id: lessonId, p_completed: false }],
    ]);
  });
  it('reads only published assessments and owner-filtered attempts with bounded ranges', async () => {
    const query = builder([]);
    const client = clientFor(query);
    const api = createLearnerApi(client, true, userId);
    await api.listAssessments(courseId, 1);
    expect(client.from).toHaveBeenCalledWith('learning_assessments');
    expect(query.select).toHaveBeenCalledWith('id, course_id, title, instructions, max_attempts');
    expect(query.eq).toHaveBeenCalledWith('course_id', courseId);
    expect(query.eq).toHaveBeenCalledWith('publication_status', 'published');
    expect(query.range).toHaveBeenCalledWith(10, 19);

    query.eq.mockClear();
    await api.listAssessmentQuestions(assessmentId, courseId);
    expect(client.from).toHaveBeenCalledWith('learning_assessment_questions');
    expect(query.eq.mock.calls).toEqual([['assessment_id', assessmentId], ['course_id', courseId]]);
    expect(query.range).toHaveBeenCalledWith(0, 100);

    query.eq.mockClear();
    await api.listAssessmentAttempts(assessmentId, 1);
    expect(client.from).toHaveBeenCalledWith('learning_assessment_attempts');
    expect(query.select).toHaveBeenCalledWith('id, assessment_id, attempt_number, status, score_percent, passed, started_at, submitted_at');
    expect(query.eq.mock.calls).toEqual([['user_id', userId], ['assessment_id', assessmentId]]);
    expect(query.range).toHaveBeenCalledWith(10, 19);
  });

  it('uses the owner-bound assessment RPC contract and validates responses before writing', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: [{ attempt_id: attemptId, attempt_number: 1 }], error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    const api = createLearnerApi({ rpc } as unknown as SupabaseClient, true, userId);
    await expect(api.startAssessmentAttempt(assessmentId)).resolves.toEqual({ attemptId, attemptNumber: 1 });
    await api.submitAssessmentAttempt(attemptId, [{ question_id: questionId, answer: 'A' }]);
    expect(rpc.mock.calls).toEqual([
      ['start_my_assessment_attempt', { p_assessment_id: assessmentId }],
      ['submit_my_assessment_attempt', { p_attempt_id: attemptId, p_responses: [{ question_id: questionId, answer: 'A' }] }],
    ]);

    const untouchedRpc = vi.fn();
    const invalidApi = createLearnerApi({ rpc: untouchedRpc } as unknown as SupabaseClient, true, userId);
    await expect(invalidApi.submitAssessmentAttempt(attemptId, [
      { question_id: questionId, answer: 'A' }, { question_id: questionId, answer: 'B' },
    ])).rejects.toThrow('Invalid assessment responses');
    await expect(invalidApi.submitAssessmentAttempt(attemptId, [{ question_id: questionId, answer: [] }])).rejects.toThrow('Invalid assessment responses');
    expect(untouchedRpc).not.toHaveBeenCalled();
  });

  it('does not report an errored or malformed RPC result as a confirmed write', async () => {
    for (const response of [{ error: { message: 'secret backend detail' } }, {}]) {
      const rpc = vi.fn().mockResolvedValue(response); const api = createLearnerApi({ rpc } as unknown as SupabaseClient, true, userId);
      await expect(api.setLessonCompletion(lessonId, true)).rejects.toThrow('Unable to update lesson progress');
      expect(rpc).toHaveBeenCalledTimes(1);
    }
  });
});
