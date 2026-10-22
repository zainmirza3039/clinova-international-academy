import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createLearnerApi, LEARNER_PAGE_SIZE } from '../src/learner/learnerApi';

const userId = '11111111-1111-4111-8111-111111111111';
const courseId = '22222222-2222-4222-8222-222222222222';
const moduleId = '33333333-3333-4333-8333-333333333333';
const lessonId = '44444444-4444-4444-8444-444444444444';
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
    for (const operation of [() => api.getProfile(), () => api.listEnrolments(), () => api.listCourses([]), () => api.listModules(courseId), () => api.listLessons(courseId, moduleId), () => api.listProgress(courseId), () => api.setLessonCompletion(lessonId, true)]) {
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
  it('does not report an errored or malformed RPC result as a confirmed write', async () => {
    for (const response of [{ error: { message: 'secret backend detail' } }, {}]) {
      const rpc = vi.fn().mockResolvedValue(response); const api = createLearnerApi({ rpc } as unknown as SupabaseClient, true, userId);
      await expect(api.setLessonCompletion(lessonId, true)).rejects.toThrow('Unable to update lesson progress');
      expect(rpc).toHaveBeenCalledTimes(1);
    }
  });
});
