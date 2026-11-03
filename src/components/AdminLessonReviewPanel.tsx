import { useCallback, useEffect, useState } from 'react';
import { Check, Eye, RefreshCw, X } from 'lucide-react';
import { createSignedCourseResourceUrl, fetchAdminLessonDrafts, setCourseLessonPublished, type LearningLesson } from '@/lib/learning';

type LessonRecord = LearningLesson & { is_published: boolean; course: { id: string; title: string; description: string | null } | null };

export default function AdminLessonReviewPanel() {
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setLessons(await fetchAdminLessonDrafts() as LessonRecord[]); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Lesson records could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function setPublished(lesson: LessonRecord, published: boolean) {
    setBusyId(lesson.id); setError(null); setNotice(null);
    try { await setCourseLessonPublished(lesson.id, published); setNotice(published ? 'Lesson published to enrolled learners.' : 'Lesson removed from learner access.'); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Lesson status could not be changed.'); }
    finally { setBusyId(null); }
  }

  async function previewResource(path: string) {
    try { const url = await createSignedCourseResourceUrl(path); window.open(url, '_blank', 'noopener,noreferrer'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Resource preview is unavailable.'); }
  }

  return <section className="mt-8" aria-labelledby="lesson-review-title">
    <div className="admin-learning-heading"><div><p className="portal-kicker">TEACHING MATERIALS</p><h2 id="lesson-review-title">Lesson review and publication</h2><p>Instructor-submitted lessons remain private drafts until an administrator publishes them.</p></div><button type="button" className="portal-refresh" onClick={() => void refresh()} disabled={loading}><RefreshCw size={15}/>Refresh</button></div>
    {error && <p className="portal-alert" role="alert">{error}</p>}{notice && <p className="portal-notice" role="status">{notice}</p>}
    {loading ? <p className="portal-loading" role="status">Loading lesson records…</p> : lessons.length === 0 ? <p className="portal-empty">No lesson records have been created yet.</p> : <div className="portal-admin-records">{lessons.map(lesson => <article key={lesson.id} className="portal-admin-record"><div><span className={lesson.is_published ? 'portal-status portal-status--valid' : 'portal-status'}>{lesson.is_published ? 'published' : 'draft'}</span><h3>{lesson.sequence_number}. {lesson.title}</h3><p>{lesson.course?.title ?? 'CPD programme'} · {lesson.summary ?? 'No summary provided'}</p>{lesson.content_markdown && <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-teal-800">Review teaching content</summary><pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{lesson.content_markdown}</pre></details>}{lesson.resource_path && <button type="button" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-teal-800" onClick={() => void previewResource(lesson.resource_path!)}><Eye size={14}/>Preview attached resource</button>}</div><div className="portal-record-actions">{!lesson.is_published ? <button type="button" disabled={busyId === lesson.id} onClick={() => void setPublished(lesson,true)}><Check size={14}/>Publish</button> : <button type="button" disabled={busyId === lesson.id} onClick={() => void setPublished(lesson,false)}><X size={14}/>Unpublish</button>}</div></article>)}</div>}
  </section>;
}
