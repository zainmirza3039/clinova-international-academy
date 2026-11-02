import { useCallback, useEffect, useState } from 'react';
import { useOptionalAuth } from '@/auth/authContext';
import { selfStudyLearningEnabled } from '@/lib/siteConfig';
import { loadMySelfStudyEnrollments, type SelfStudyEnrollmentSummary } from '@/lib/selfStudyLearning';
import {
  enrollInSelfStudyCourse,
  loadSelfStudyCourseProgress,
  markSelfStudyLessonRead,
} from '@/lib/selfStudyLearning';
import type { SelfStudyProgress } from '@/types/selfStudyLearning';

type WorkflowStatus = 'disabled' | 'auth-loading' | 'signed-out' | 'loading' | 'ready' | 'error';

export function useSelfStudyLearning(courseSlug: string) {
  const auth = useOptionalAuth();
  const [status, setStatus] = useState<WorkflowStatus>('disabled');
  const [progress, setProgress] = useState<SelfStudyProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [savingLessonKey, setSavingLessonKey] = useState<string | null>(null);
  const authEnabled = Boolean(courseSlug) && selfStudyLearningEnabled && Boolean(auth?.enabled);
  const userId = auth?.session?.user.id ?? null;
  const sessionReady = authEnabled && auth?.status === 'ready' && auth.emailVerified === true && Boolean(userId);

  useEffect(() => {
    let active = true;
    setProgress(null);
    setError(null);
    setActionError(null);
    if (!authEnabled) {
      setStatus('disabled');
      return () => { active = false; };
    }
    if (auth?.status === 'loading') {
      setStatus('auth-loading');
      return () => { active = false; };
    }
    if (auth?.status === 'error') {
      setStatus('error');
      setError('Learner sign-in is unavailable in this environment.');
      return () => { active = false; };
    }
    if (!sessionReady) {
      setStatus('signed-out');
      return () => { active = false; };
    }

    setStatus('loading');
    void loadSelfStudyCourseProgress(courseSlug).then((result) => {
      if (!active) return;
      setProgress(result);
      setStatus('ready');
    }).catch(() => {
      if (!active) return;
      setError('Your self-study record could not be loaded. No course progress has been changed.');
      setStatus('error');
    });
    return () => { active = false; };
  }, [auth?.status, authEnabled, courseSlug, sessionReady, userId]);

  const enroll = useCallback(async () => {
    if (!sessionReady || enrolling) return;
    setEnrolling(true);
    setActionError(null);
    try {
      await enrollInSelfStudyCourse(courseSlug);
      const next = await loadSelfStudyCourseProgress(courseSlug);
      setProgress(next);
      setStatus('ready');
    } catch {
      setActionError('Enrollment could not be saved. Please try again.');
    } finally {
      setEnrolling(false);
    }
  }, [courseSlug, enrolling, sessionReady]);

  const markRead = useCallback(async (lessonKey: string) => {
    if (!sessionReady || !progress?.enrollmentId || savingLessonKey) return;
    setSavingLessonKey(lessonKey);
    setActionError(null);
    try {
      await markSelfStudyLessonRead(courseSlug, lessonKey);
      const next = await loadSelfStudyCourseProgress(courseSlug);
      setProgress(next);
      setStatus('ready');
    } catch {
      setActionError('Reading progress could not be saved. Please try again.');
    } finally {
      setSavingLessonKey(null);
    }
  }, [courseSlug, progress?.enrollmentId, savingLessonKey, sessionReady]);

  return {
    status,
    progress,
    error,
    actionError,
    enrolling,
    savingLessonKey,
    enroll,
    markRead,
  };
}

export type SelfStudyEnrollmentListStatus = 'disabled' | 'auth-loading' | 'signed-out' | 'loading' | 'ready' | 'error';

export function useMySelfStudyEnrollments() {
  const auth = useOptionalAuth();
  const [status, setStatus] = useState<SelfStudyEnrollmentListStatus>('disabled');
  const [enrollments, setEnrollments] = useState<SelfStudyEnrollmentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userId = auth?.session?.user.id ?? null;
  const featureEnabled = selfStudyLearningEnabled && auth?.enabled === true;
  const learnerAuthorized = featureEnabled
    && auth?.status === 'ready'
    && auth.emailVerified === true
    && Boolean(userId);

  useEffect(() => {
    let active = true;
    setEnrollments([]);
    setError(null);

    if (!featureEnabled) {
      setStatus('disabled');
      return () => { active = false; };
    }
    if (auth?.status === 'loading') {
      setStatus('auth-loading');
      return () => { active = false; };
    }
    if (auth?.status === 'error') {
      setStatus('error');
      setError('Learner sign-in could not be verified. Self-study records were not requested.');
      return () => { active = false; };
    }
    if (!learnerAuthorized) {
      setStatus('signed-out');
      return () => { active = false; };
    }

    setStatus('loading');
    void loadMySelfStudyEnrollments().then((result) => {
      if (!active) return;
      setEnrollments(result);
      setStatus('ready');
    }).catch(() => {
      if (!active) return;
      setError('Your self-study courses could not be loaded. Please try again.');
      setStatus('error');
    });

    return () => { active = false; };
  }, [auth?.status, featureEnabled, learnerAuthorized, userId]);

  return { status, enrollments, error };
}
