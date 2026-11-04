import { supabase } from '@/lib/supabase';

export type LearningProfile = {
  user_id: string;
  full_name: string | null;
  professional_title: string | null;
  institution: string | null;
  country: string | null;
};
export type LearningCourse = { id: string; title: string; description: string | null };
export type LearningEnrollment = {
  id: string; course_item_id: string; enrollment_status: string; applied_at: string;
  completed_at: string | null; course: LearningCourse | null;
};
export type LearningLesson = {
  id: string; course_item_id: string; title: string; summary: string | null;
  content_markdown: string | null; resource_path: string | null; sequence_number: number;
};
export type LearningSession = {
  id: string; course_item_id: string; title: string; starts_at: string; ends_at: string;
  meeting_url: string | null; session_status: string;
};
export type LearningProgress = { lesson_id: string; progress_status: string; completed_at: string | null };
export type LearningCertificate = {
  id: string; enrollment_id: string; course_item_id: string; certificate_number: string; verification_code: string; student_id?: string;
  issued_at: string; revoked_at: string | null; course: LearningCourse | null;
};
export type StudentWorkspace = {
  profile: LearningProfile | null;
  enrollments: LearningEnrollment[];
  lessons: LearningLesson[];
  sessions: LearningSession[];
  progress: LearningProgress[];
  certificates: LearningCertificate[];
};
export type InstructorWorkspace = {
  assignments: LearningCourse[];
  sessions: LearningSession[];
  learners: { id: string; course_item_id: string; enrollment_status: string; profile: LearningProfile | null; course: LearningCourse | null }[];
  lessons: LearningLesson[];
};
export type AdminLearningWorkspace = {
  profiles: LearningProfile[];
  instructors: { user_id: string; public_name: string; professional_title: string; biography: string | null; credentials: string[]; verification_evidence: unknown[]; verification_rationale: string | null; verification_status: string; is_public: boolean }[];
  enrollments: { id: string; course_item_id: string; student_id: string; enrollment_status: string; applied_at: string; course: LearningCourse | null; learner: LearningProfile | null }[];
  courses: LearningCourse[];
  certificates: (LearningCertificate & { learner: LearningProfile | null })[];
};

function ensureNoError(error: { message?: string } | null, message: string): void {
  if (error) throw new Error(message);
}

async function getCourses(ids: string[]): Promise<Map<string, LearningCourse>> {
  if (!ids.length) return new Map();
  const [items, versions] = await Promise.all([
    supabase.from('content_items').select('id,kind').in('id', ids),
    supabase.from('content_versions').select('content_item_id,snapshot,workflow_status,version_number').in('content_item_id', ids).in('workflow_status', ['published','archived']).order('version_number', { ascending: false }),
  ]);
  ensureNoError(items.error, 'Programme records are unavailable.');
  ensureNoError(versions.error, 'Published programme details are unavailable.');
  const itemIds = new Set((items.data ?? []).filter((item: any) => item.kind === 'cpd_course').map((item: any) => item.id));
  const map = new Map<string, LearningCourse>();
  for (const version of (versions.data ?? []) as any[]) {
    if (!itemIds.has(version.content_item_id) || map.has(version.content_item_id)) continue;
    const snapshot = version.snapshot as Record<string, unknown>;
    map.set(version.content_item_id, {
      id: version.content_item_id,
      title: typeof snapshot.title === 'string' ? snapshot.title : 'CPD programme',
      description: typeof snapshot.description === 'string' ? snapshot.description : null,
    });
  }
  return map;
}

async function getCurrentlyPublishedCourses(ids: string[]): Promise<Map<string, LearningCourse>> {
  if (!ids.length) return new Map();
  const { data, error } = await supabase.from('content_versions')
    .select('content_item_id,snapshot')
    .eq('kind', 'cpd_course')
    .eq('workflow_status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .in('content_item_id', ids);
  ensureNoError(error, 'Published CPD programmes are unavailable.');
  const map = new Map<string, LearningCourse>();
  for (const version of (data ?? []) as any[]) {
    const snapshot = version.snapshot as Record<string, unknown>;
    if (typeof snapshot.title !== 'string' || map.has(version.content_item_id)) continue;
    map.set(version.content_item_id, {
      id: version.content_item_id,
      title: snapshot.title,
      description: typeof snapshot.description === 'string' ? snapshot.description : null,
    });
  }
  return map;
}

export async function fetchStudentWorkspace(userId: string): Promise<StudentWorkspace> {
  const [profileResult, enrollmentResult, certificateResult] = await Promise.all([
    supabase.from('profiles').select('user_id,full_name,professional_title,institution,country').eq('user_id', userId).maybeSingle(),
    supabase.from('course_enrollments').select('id,course_item_id,enrollment_status,applied_at,completed_at').eq('student_id', userId).order('applied_at', { ascending: false }),
    supabase.from('course_certificates').select('id,enrollment_id,course_item_id,certificate_number,verification_code,issued_at,revoked_at').eq('student_id', userId).order('issued_at', { ascending: false }),
  ]);
  ensureNoError(profileResult.error, 'Your profile could not be loaded.');
  ensureNoError(enrollmentResult.error, 'Your enrolments could not be loaded.');
  ensureNoError(certificateResult.error, 'Your certificates could not be loaded.');
  const enrollmentsRaw = (enrollmentResult.data ?? []) as any[];
  const certificatesRaw = (certificateResult.data ?? []) as any[];
  const ids = [...new Set([...enrollmentsRaw.map(x => x.course_item_id), ...certificatesRaw.map(x => x.course_item_id)])];
  const courses = await getCourses(ids);
  const [lessonResult, sessionResult, progressResult] = await Promise.all([
    ids.length ? supabase.from('course_lessons').select('id,course_item_id,title,summary,content_markdown,resource_path,sequence_number').in('course_item_id', ids).eq('is_published', true).order('sequence_number') : Promise.resolve({ data: [], error: null }),
    ids.length ? supabase.from('course_live_sessions').select('id,course_item_id,title,starts_at,ends_at,meeting_url,session_status').in('course_item_id', ids).order('starts_at') : Promise.resolve({ data: [], error: null }),
    supabase.from('course_lesson_progress').select('lesson_id,progress_status,completed_at').eq('student_id', userId),
  ]);
  ensureNoError(lessonResult.error, 'Course lessons are unavailable.');
  ensureNoError(sessionResult.error, 'Teaching sessions are unavailable.');
  ensureNoError(progressResult.error, 'Learning progress is unavailable.');
  return {
    profile: profileResult.data as LearningProfile | null,
    enrollments: enrollmentsRaw.map(row => ({ ...row, course: courses.get(row.course_item_id) ?? null })),
    lessons: (lessonResult.data ?? []) as LearningLesson[],
    sessions: (sessionResult.data ?? []) as LearningSession[],
    progress: (progressResult.data ?? []) as LearningProgress[],
    certificates: certificatesRaw.map(row => ({ ...row, course: courses.get(row.course_item_id) ?? null })),
  };
}

export async function updateStudentProfile(userId: string, values: Pick<LearningProfile, 'full_name'|'professional_title'|'institution'|'country'>): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ user_id: userId, ...values }, { onConflict: 'user_id' });
  ensureNoError(error, 'Your profile could not be saved.');
}

export async function applyToCourse(userId: string, courseItemId: string): Promise<void> {
  const { error } = await supabase.from('course_enrollments').insert({ course_item_id: courseItemId, student_id: userId, enrollment_status: 'applied' });
  if (error?.code === '23505') throw new Error('You have already applied to this programme.');
  ensureNoError(error, 'Your application could not be submitted. Check that the programme is published and enrolment is open.');
}

export async function markLessonProgress(userId: string, enrollmentId: string, lessonId: string, completed: boolean): Promise<void> {
  const { error } = await supabase.from('course_lesson_progress').upsert({
    enrollment_id: enrollmentId,
    lesson_id: lessonId,
    student_id: userId,
    progress_status: completed ? 'completed' : 'started',
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'enrollment_id,lesson_id' });
  ensureNoError(error, 'Learning progress could not be updated.');
}

export async function fetchInstructorWorkspace(userId: string): Promise<InstructorWorkspace> {
  const { data: assignmentData, error: assignmentError } = await supabase.from('course_instructor_assignments')
    .select('course_item_id').eq('instructor_id', userId).eq('assignment_status', 'active');
  ensureNoError(assignmentError, 'Your teaching assignments could not be loaded.');
  const courseIds = [...new Set((assignmentData ?? []).map((row: any) => row.course_item_id))];
  if (!courseIds.length) return { assignments: [], sessions: [], learners: [], lessons: [] };
  const [courses, sessions, enrollments, lessons] = await Promise.all([
    getCourses(courseIds),
    supabase.from('course_live_sessions').select('id,course_item_id,title,starts_at,ends_at,meeting_url,session_status').in('course_item_id', courseIds).order('starts_at'),
    supabase.from('course_enrollments').select('id,course_item_id,student_id,enrollment_status,applied_at').in('course_item_id', courseIds).order('applied_at', { ascending: false }),
    supabase.from('course_lessons').select('id,course_item_id,title,summary,content_markdown,resource_path,sequence_number').in('course_item_id', courseIds).order('sequence_number'),
  ]);
  ensureNoError(sessions.error, 'Teaching sessions could not be loaded.');
  ensureNoError(enrollments.error, 'Assigned learners could not be loaded.');
  ensureNoError(lessons.error, 'Teaching resources could not be loaded.');
  const studentIds = [...new Set((enrollments.data ?? []).map((row: any) => row.student_id))];
  const profiles = studentIds.length
    ? await supabase.from('profiles').select('user_id,full_name,professional_title,institution,country').in('user_id', studentIds)
    : { data: [], error: null };
  ensureNoError(profiles.error, 'Assigned learner profiles could not be loaded.');
  const profileMap = new Map(((profiles.data ?? []) as LearningProfile[]).map(profile => [profile.user_id, profile]));
  return {
    assignments: courseIds.map(id => courses.get(id)).filter((course): course is LearningCourse => Boolean(course)),
    sessions: (sessions.data ?? []) as LearningSession[],
    lessons: (lessons.data ?? []) as LearningLesson[],
    learners: (enrollments.data ?? []).map((row: any) => ({
      ...row,
      profile: profileMap.get(row.student_id) ?? null,
      course: courses.get(row.course_item_id) ?? null,
    })),
  };
}

export async function createTeachingSession(userId: string, input: { course_item_id: string; title: string; starts_at: string; ends_at: string; meeting_url?: string }): Promise<void> {
  const start = Date.parse(input.starts_at);
  const end = Date.parse(input.ends_at);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('Choose a valid session start and an end time after the start.');
  if (!input.title.trim() || input.title.trim().length > 200) throw new Error('Enter a session title of 1–200 characters.');
  if (input.meeting_url) {
    let url: URL;
    try { url = new URL(input.meeting_url); } catch { throw new Error('Enter a valid HTTPS meeting link.'); }
    if (url.protocol !== 'https:') throw new Error('Meeting links must use HTTPS.');
  }
  const { error } = await supabase.from('course_live_sessions').insert({ ...input, title: input.title.trim(), created_by: userId, session_status: 'scheduled' });
  ensureNoError(error, 'The teaching session could not be created.');
}

export async function createCourseLesson(userId: string, input: { course_item_id: string; title: string; summary?: string; content_markdown?: string; resource_path?: string | null; sequence_number: number }): Promise<string> {
  const { data, error } = await supabase.from('course_lessons').insert({ ...input, created_by: userId, is_published: false }).select('id').single();
  ensureNoError(error, 'The lesson could not be created.');
  if (!data?.id) throw new Error('The lesson was not returned after creation.');
  return data.id as string;
}

export async function attachCourseResource(lessonId: string, resourcePath: string): Promise<void> {
  const { error } = await supabase.from('course_lessons').update({ resource_path: resourcePath }).eq('id', lessonId);
  ensureNoError(error, 'The uploaded resource could not be attached to the lesson.');
}

export async function createSignedCourseResourceUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('course-resources').createSignedUrl(path, 300);
  ensureNoError(error, 'This course resource is not available to your account.');
  if (!data?.signedUrl) throw new Error('A secure resource link could not be created.');
  return data.signedUrl;
}

export async function uploadCourseResource(userId: string, courseItemId: string, file: File): Promise<string> {
  const allowedTypes = new Set(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png','image/webp','video/mp4']);
  if (!allowedTypes.has(file.type)) throw new Error('This file type is not supported. Upload a PDF, Office document, JPG, PNG, WebP or MP4.');
  if (file.size <= 0 || file.size > 100 * 1024 * 1024) throw new Error('Course resources must be smaller than 100 MB.');
  const safeName = file.name.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120);
  const path = `${courseItemId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('course-resources').upload(path, file, { upsert: false });
  ensureNoError(error, 'The resource could not be uploaded. Check file type, size and instructor assignment.');
  return path;
}

export async function deleteCourseResource(path: string): Promise<void> {
  if (!path || path.startsWith('/') || path.split('/').length < 2) throw new Error('Invalid course resource path.');
  const { error } = await supabase.storage.from('course-resources').remove([path]);
  ensureNoError(error, 'The unused uploaded resource could not be removed.');
}

export async function fetchAdminLessonDrafts(): Promise<(LearningLesson & { is_published: boolean; course: LearningCourse | null })[]> {
  const { data, error } = await supabase.from('course_lessons').select('id,course_item_id,title,summary,content_markdown,resource_path,sequence_number,is_published').order('created_at', { ascending: false }).limit(200);
  ensureNoError(error, 'Course lesson records are unavailable.');
  const courses = await getCourses([...new Set((data ?? []).map((row: any) => row.course_item_id))]);
  return (data ?? []).map((row: any) => ({ ...row, course: courses.get(row.course_item_id) ?? null }));
}

export async function setCourseLessonPublished(lessonId: string, published: boolean): Promise<void> {
  const { error } = await supabase.from('course_lessons').update({ is_published: published, updated_at: new Date().toISOString() }).eq('id', lessonId);
  ensureNoError(error, 'Lesson publication status could not be changed.');
}

export async function createAdminCourseAssignment(courseItemId: string, instructorId: string, adminId: string): Promise<void> {
  const { error } = await supabase.from('course_instructor_assignments').upsert({
    course_item_id: courseItemId, instructor_id: instructorId, assigned_by: adminId, assignment_status: 'active',
  }, { onConflict: 'course_item_id,instructor_id' });
  ensureNoError(error, 'The instructor could not be assigned.');
}

export async function setEnrollmentStatus(enrollmentId: string, status: 'active'|'completed'|'cancelled', adminId: string): Promise<void> {
  const { error } = await supabase.from('course_enrollments').update({
    enrollment_status: status,
    reviewed_by: adminId,
    reviewed_at: new Date().toISOString(),
    completed_at: status === 'completed' ? new Date().toISOString() : null,
  }).eq('id', enrollmentId);
  ensureNoError(error, 'The enrolment status could not be updated.');
}

export async function issueCpdCertificate(enrollmentId: string, certificateNumber: string): Promise<string> {
  const { data, error } = await supabase.rpc('issue_cpd_certificate', { p_enrollment_id: enrollmentId, p_certificate_number: certificateNumber });
  ensureNoError(error, 'The certificate could not be issued. Confirm the learner has completed the programme and the number is unique.');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.verification_code) throw new Error('The certificate was not returned by the issuer.');
  return row.verification_code as string;
}

export async function fetchAdminLearningWorkspace(): Promise<AdminLearningWorkspace> {
  const [profiles, instructors, enrollments, items, certificates] = await Promise.all([
    supabase.from('profiles').select('user_id,full_name,professional_title,institution,country').order('created_at', { ascending: false }).limit(200),
    supabase.rpc('get_admin_instructor_profiles'),
    supabase.from('course_enrollments').select('id,course_item_id,student_id,enrollment_status,applied_at').order('applied_at', { ascending: false }).limit(200),
    supabase.from('content_items').select('id,kind').eq('kind', 'cpd_course').limit(200),
    supabase.from('course_certificates').select('id,enrollment_id,course_item_id,certificate_number,verification_code,issued_at,revoked_at,student_id').order('issued_at', { ascending: false }).limit(200),
  ]);
  ensureNoError(profiles.error, 'Learner profiles are unavailable.');
  ensureNoError(instructors.error, 'Instructor profiles are unavailable.');
  ensureNoError(enrollments.error, 'Enrolment records are unavailable.');
  ensureNoError(items.error, 'Course records are unavailable.');
  ensureNoError(certificates.error, 'Certificate records are unavailable.');
  const courseIds = [...new Set([...(items.data ?? []).map((item: any) => item.id), ...(certificates.data ?? []).map((row: any) => row.course_item_id)])];
  const [courses, publishedCourses] = await Promise.all([getCourses(courseIds), getCurrentlyPublishedCourses((items.data ?? []).map((item: any) => item.id))]);
  const learnerIds = [...new Set([...(enrollments.data ?? []).map((row: any) => row.student_id), ...(certificates.data ?? []).map((row: any) => row.student_id)])];
  const learnerProfiles = learnerIds.length
    ? await supabase.from('profiles').select('user_id,full_name,professional_title,institution,country').in('user_id', learnerIds)
    : { data: [], error: null };
  ensureNoError(learnerProfiles.error, 'Enrolled learner details are unavailable.');
  const profileMap = new Map(((learnerProfiles.data ?? []) as LearningProfile[]).map(profile => [profile.user_id, profile]));
  return {
    profiles: (profiles.data ?? []) as LearningProfile[],
    instructors: (instructors.data ?? []).map((row: any) => ({ ...row, credentials: Array.isArray(row.credentials) ? row.credentials.filter((item: unknown): item is string => typeof item === 'string') : [], verification_evidence: Array.isArray(row.verification_evidence) ? row.verification_evidence : [] })) as AdminLearningWorkspace['instructors'],
    courses: [...publishedCourses.values()],
    certificates: (certificates.data ?? []).map((row: any) => ({ ...row, course: courses.get(row.course_item_id) ?? null, learner: profileMap.get(row.student_id) ?? null })),
    enrollments: (enrollments.data ?? []).map((row: any) => ({
      ...row,
      course: courses.get(row.course_item_id) ?? null,
      learner: profileMap.get(row.student_id) ?? null,
    })),
  };
}

export async function createInstructorProfile(userId: string, publicName: string, professionalTitle: string, biography: string, credentials: string[]): Promise<void> {
  const cleanCredentials = credentials.map(value => value.trim()).filter(Boolean).slice(0, 30);
  const { error } = await supabase.from('instructor_profiles').upsert({ user_id: userId, public_name: publicName.trim(), professional_title: professionalTitle.trim(), biography: biography.trim() || null, credentials: cleanCredentials, verification_status: 'pending', is_public: false }, { onConflict: 'user_id' });
  ensureNoError(error, 'Instructor profile could not be created. Confirm the user ID belongs to an existing account.');
}

export async function revokeCpdCertificate(certificateId: string, reason: string): Promise<void> {
  const { error } = await supabase.from('course_certificates').update({ revoked_at: new Date().toISOString(), revocation_reason: reason.trim() }).eq('id', certificateId);
  ensureNoError(error, 'Certificate revocation could not be saved.');
}

export async function manageClinovaRole(userId: string, role: string, enabled: boolean): Promise<void> {
  const { error } = await supabase.functions.invoke('manage-clinova-role', { body: { user_id: userId, role, enabled } });
  ensureNoError(error, 'The role change was rejected by the secure administrator service.');
}

export async function reviewInstructorProfile(userId: string, adminId: string, approved: boolean, evidenceReferences: string[], rationale: string): Promise<void> {
  const evidence = evidenceReferences.map(value => value.trim()).filter(Boolean).slice(0, 30);
  const reason = rationale.trim();
  if (reason.length < 10 || reason.length > 2000) throw new Error('A reviewer rationale of 10–2,000 characters is required.');
  if (approved && evidence.length === 0) throw new Error('At least one qualification evidence reference is required before verification.');
  // Change the trusted role first. A failed role/audit operation must never leave an unassigned public instructor profile.
  await manageClinovaRole(userId, 'instructor', approved);
  const { error } = await supabase.from('instructor_profiles').update({
    verification_status: approved ? 'verified' : 'rejected',
    is_public: approved,
    verification_evidence: evidence,
    verification_rationale: reason,
    reviewed_by: adminId,
    reviewed_at: new Date().toISOString(),
  }).eq('user_id', userId);
  ensureNoError(error, 'The instructor role was updated, but the profile review could not be saved. Refresh and reconcile the profile before assigning teaching.');
}
