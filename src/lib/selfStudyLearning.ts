import type { SelfStudyProgress } from '@/types/selfStudyLearning';

function lessonKeyPart(value: string) {
  return value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function selfStudyLessonKey(moduleTitle: string, lessonTitle: string) {
  return `${lessonKeyPart(moduleTitle)}/${lessonKeyPart(lessonTitle)}`;
}

function requestError() {
  return new Error('Your self-study request could not be completed. Please try again.');
}

export async function loadSelfStudyCourseProgress(courseSlug: string): Promise<SelfStudyProgress> {
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase.rpc('get_self_study_course_progress', {
    p_course_slug: courseSlug,
  });
  if (error || !data || typeof data !== 'object' || Array.isArray(data)) throw requestError();

  const result = data as Record<string, unknown>;
  const completedLessonKeys = Array.isArray(result.completed_lesson_keys)
    ? result.completed_lesson_keys.filter((key): key is string => typeof key === 'string')
    : [];
  const completedLessons = Number(result.completed_lessons);
  const totalLessons = Number(result.total_lessons);
  return {
    courseSlug: typeof result.course_slug === 'string' ? result.course_slug : courseSlug,
    enrollmentId: typeof result.enrollment_id === 'string' ? result.enrollment_id : null,
    enrolledAt: typeof result.enrolled_at === 'string' ? result.enrolled_at : null,
    completedLessonKeys,
    completedLessons: Number.isFinite(completedLessons) ? Math.max(0, Math.trunc(completedLessons)) : 0,
    totalLessons: Number.isFinite(totalLessons) ? Math.max(0, Math.trunc(totalLessons)) : 0,
  };
}

export type SelfStudyEnrollmentSummary = {
  courseSlug: string;
  courseTitle: string;
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
};

function readLessonCount(value: unknown) {
  const count = typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))
    ? Number(value)
    : Number.NaN;
  if (!Number.isSafeInteger(count) || count < 0) throw requestError();
  return count;
}

export async function loadMySelfStudyEnrollments(): Promise<SelfStudyEnrollmentSummary[]> {
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase.rpc('get_my_self_study_enrollments');
  if (error || !Array.isArray(data)) throw requestError();

  return data.map((row: unknown) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw requestError();
    const record = row as Record<string, unknown>;
    if (
      typeof record.course_slug !== 'string'
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.course_slug)
      || typeof record.course_title !== 'string'
      || !record.course_title.trim()
      || typeof record.enrolled_at !== 'string'
      || Number.isNaN(Date.parse(record.enrolled_at))
    ) throw requestError();

    const completedLessons = readLessonCount(record.completed_lessons);
    const totalLessons = readLessonCount(record.total_lessons);
    if (completedLessons > totalLessons) throw requestError();
    return {
      courseSlug: record.course_slug,
      courseTitle: record.course_title,
      enrolledAt: record.enrolled_at,
      completedLessons,
      totalLessons,
    };
  });
}

export async function enrollInSelfStudyCourse(courseSlug: string) {
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase.rpc('enroll_self_study_course', {
    p_course_slug: courseSlug,
  });
  const row = Array.isArray(data) ? data[0] as Record<string, unknown> | undefined : undefined;
  if (error || !row || typeof row.enrollment_id !== 'string') throw requestError();
}

export async function markSelfStudyLessonRead(courseSlug: string, lessonKey: string) {
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase.rpc('mark_self_study_lesson_read', {
    p_course_slug: courseSlug,
    p_lesson_key: lessonKey,
  });
  if (error || typeof data !== 'string' || Number.isNaN(Date.parse(data))) throw requestError();
  return data;
}
