import { useMemo } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
const USER = '11111111-1111-4111-8111-111111111111';
const COURSE = '22222222-2222-4222-8222-222222222222';
const MODULE = '33333333-3333-4333-8333-333333333333';
const LESSON = '44444444-4444-4444-8444-444444444444';
const ENROLMENT = '55555555-5555-4555-8555-555555555555';
const scenario = new URLSearchParams(location.search).get('scenario') || 'ready';
type Result = { data: unknown; error: { message: string } | null };
type MockQuery = {
  select: () => MockQuery; eq: () => MockQuery; in: () => MockQuery; order: () => MockQuery;
  range: () => Promise<Result>; maybeSingle: () => Promise<Result>;
};
const result = (data: unknown, error: Result['error'] = null): Result => ({ data, error });
const profile = { user_id: USER, display_name: 'Synthetic Learner' };
function makeClient() {
  const from = (table: string): MockQuery => {
    const rows: Record<string, unknown> = {
      student_profiles: profile,
      student_enrolments: [{ id: ENROLMENT, course_id: COURSE, status: scenario === 'completed' ? 'completed' : 'active', enrolled_at: '2026-01-01T00:00:00Z' }],
      learning_courses: [{ id: COURSE, slug: 'synthetic', title: 'Synthetic Course', summary: 'Synthetic harness content' }],
      learning_modules: [{ id: MODULE, course_id: COURSE, title: 'Synthetic Module', position: 1 }],
      learning_lessons: [{ id: LESSON, course_id: COURSE, module_id: MODULE, title: 'Synthetic Lesson', body_markdown: 'Synthetic plaintext lesson', position: 1 }],
      lesson_progress: [],
    };
    if (!(table in rows)) throw new Error('Unexpected table in synthetic harness.');
    const query: MockQuery = {
      select: () => query, eq: () => query, in: () => query, order: () => query,
      range: () => {
        if (scenario === 'loading') return new Promise<Result>(() => {});
        if (scenario === 'error' && table === 'student_enrolments') return Promise.resolve(result(null, { message: 'Synthetic error' }));
        if (scenario === 'empty' && table === 'student_enrolments') return Promise.resolve(result([]));
        return Promise.resolve(result(rows[table]));
      },
      maybeSingle: () => Promise.resolve(result(profile)),
    };
    return query;
  };
  return {
    from,
    rpc: (name: string, payload: Record<string, unknown>): Promise<Result> => {
      if (name !== 'set_my_lesson_completion' || payload.p_lesson_id !== LESSON || typeof payload.p_completed !== 'boolean' || Object.keys(payload).length !== 2) throw new Error('Unexpected synthetic RPC.');
      if (scenario === 'write-error') return Promise.resolve(result(null, { message: 'Synthetic write error' }));
      if (scenario === 'write-pending') return new Promise<Result>(() => {});
      return Promise.resolve(result(null));
    },
  } as unknown as SupabaseClient;
}
const session = { user: { id: USER } };
export function useAuth() {
  return useMemo(() => ({ enabled: true, status: 'ready', recovery: false, session, client: makeClient(), signOut: async () => ({ error: null }) }), []);
}
