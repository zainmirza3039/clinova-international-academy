import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, ClipboardList, CircleUserRound, GraduationCap, LogOut, RefreshCw, Users, Upload } from 'lucide-react';
import { useAuth } from '@/auth/authContext';
import { useSEO } from '@/hooks/useSEO';
import { createCourseLesson, createTeachingSession, deleteCourseResource, fetchInstructorWorkspace, uploadCourseResource, type InstructorWorkspace } from '@/lib/learning';

type InstructorTab = 'Overview' | 'My programmes' | 'Teaching schedule' | 'Learners' | 'Resources' | 'Profile';
const tabs: InstructorTab[] = ['Overview', 'My programmes', 'Teaching schedule', 'Learners', 'Resources', 'Profile'];
const emptyWorkspace: InstructorWorkspace = { assignments: [], sessions: [], learners: [], lessons: [] };

export default function InstructorDashboardPage() {
  const auth = useAuth();
  const location = useLocation();
  const userId = auth.session?.user.id;
  const claims = auth.session?.user.app_metadata;
  const roles = Array.isArray(claims?.clinova_roles) ? claims.clinova_roles : [];
  const instructorAllowed = claims?.role === 'instructor' || claims?.role === 'faculty' || roles.includes('instructor') || roles.includes('faculty') || claims?.role === 'admin';
  const [activeTab, setActiveTab] = useState<InstructorTab>('Overview');
  const [workspace, setWorkspace] = useState<InstructorWorkspace>(emptyWorkspace);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sessionDraft, setSessionDraft] = useState({ course_item_id: '', title: '', starts_at: '', ends_at: '', meeting_url: '' });
  const [lessonDraft, setLessonDraft] = useState({ course_item_id: '', title: '', summary: '', content_markdown: '', sequence_number: '1' });
  const [resourceFiles, setResourceFiles] = useState<Record<string, File | null>>({});
  useSEO({ title: 'Instructor workspace | Clinova International Academy', description: 'Clinova instructor workspace.', noindex: true });

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true); setError(null);
    try {
      const data = await fetchInstructorWorkspace(userId);
      setWorkspace(data);
      setSessionDraft(v => ({ ...v, course_item_id: v.course_item_id || data.assignments[0]?.id || '' }));
      setLessonDraft(v => ({ ...v, course_item_id: v.course_item_id || data.assignments[0]?.id || '' }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Instructor workspace could not be loaded.'); }
    finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { void refresh(); }, [refresh]);

  if (!auth.enabled || auth.status === 'disabled') return <section className="mx-auto max-w-3xl px-6 py-20"><h1 className="text-3xl font-semibold text-navy-900">Instructor access is not configured</h1><p className="mt-3 text-navy-600">The secure instructor account service is not enabled.</p></section>;
  if (auth.status === 'loading') return <section className="mx-auto max-w-3xl px-6 py-20" role="status">Checking instructor access…</section>;
  if (auth.status === 'error') return <section className="mx-auto max-w-3xl px-6 py-20" role="alert">{auth.error ?? 'Unable to check your session.'}</section>;
  if (!auth.session) return <Navigate to={`/sign-in?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (!auth.emailVerified) return <Navigate to="/sign-in?verification=required" replace />;
  if (!instructorAllowed) return <section className="mx-auto max-w-3xl px-6 py-20"><p className="portal-kicker">RESTRICTED WORKSPACE</p><h1 className="mt-3 text-3xl font-semibold text-navy-900">Instructor access required</h1><p className="mt-3 text-navy-600">This account does not have an administrator-assigned instructor role. Public registration cannot grant teaching permissions.</p><Link to="/become-an-instructor" className="mt-6 inline-flex items-center gap-2 font-semibold text-teal-800">Instructor information <ArrowRight size={16} /></Link></section>;

  async function createSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!userId || busy) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      await createTeachingSession(userId, { ...sessionDraft, starts_at: new Date(sessionDraft.starts_at).toISOString(), ends_at: new Date(sessionDraft.ends_at).toISOString(), meeting_url: sessionDraft.meeting_url || undefined });
      setNotice('Teaching session created.'); setSessionDraft(v => ({ ...v, title: '', starts_at: '', ends_at: '', meeting_url: '' })); await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Session could not be created.'); }
    finally { setBusy(false); }
  }

  async function createLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!userId || busy) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      const file = resourceFiles[lessonDraft.course_item_id];
      let resourcePath: string | null = null;
      if (file) resourcePath = await uploadCourseResource(userId, lessonDraft.course_item_id, file);
      try {
        await createCourseLesson(userId, { ...lessonDraft, sequence_number: Number(lessonDraft.sequence_number), resource_path: resourcePath });
      } catch (reason) {
        if (resourcePath) await deleteCourseResource(resourcePath).catch(() => undefined);
        throw reason;
      }
      setNotice(file ? 'Lesson and private resource saved as an unpublished draft.' : 'Lesson saved as an unpublished draft. An administrator must review and publish it before learners can access it.');
      setLessonDraft(v => ({ ...v, title: '', summary: '', content_markdown: '', sequence_number: String(Number(v.sequence_number) + 1) }));
      setResourceFiles(v => ({ ...v, [lessonDraft.course_item_id]: null }));
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Lesson could not be created.'); }
    finally { setBusy(false); }
  }

  async function signOut() {
    if (busy) return;
    setBusy(true); const result = await auth.signOut(); setBusy(false);
    if (result.error) setError(result.error.message);
  }

  return <div className="portal-shell" aria-labelledby="instructor-dashboard-title">
    <aside className="portal-sidebar"><div className="portal-sidebar__brand"><span className="portal-sidebar__mark">C</span><span>CLINOVA<small>INSTRUCTOR PORTAL</small></span></div><p className="portal-sidebar__label">TEACHING WORKSPACE</p><nav aria-label="Instructor dashboard navigation">{tabs.map(tab => <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined} className={activeTab === tab ? 'portal-nav-item is-active' : 'portal-nav-item'}>{tab === 'Overview' ? <GraduationCap size={17} /> : tab === 'My programmes' ? <BookOpen size={17} /> : tab === 'Teaching schedule' ? <CalendarDays size={17} /> : tab === 'Learners' ? <Users size={17} /> : tab === 'Resources' ? <ClipboardList size={17} /> : <CircleUserRound size={17} />}{tab}</button>)}</nav><div className="portal-sidebar__bottom"><Link to="/" className="portal-nav-item"><ArrowRight size={16} />Public website</Link><button type="button" className="portal-nav-item" onClick={() => void signOut()} disabled={busy}><LogOut size={16} />{busy ? 'Signing out…' : 'Sign out'}</button></div></aside>
    <main className="portal-main"><header className="portal-topbar"><div><span className="portal-kicker">INSTRUCTOR WORKSPACE</span><p>{auth.session.user.email ?? 'Instructor account'}</p></div><span className="portal-avatar" aria-hidden="true">I</span></header>
      <div className="portal-content"><div className="portal-page-heading"><div><p className="portal-kicker">TEACHING AND COURSE DELIVERY</p><h1 id="instructor-dashboard-title">{activeTab === 'Overview' ? 'Instructor overview' : activeTab}</h1><p>Manage assigned teaching activity and programme resources.</p></div><div className="portal-heading-actions"><button type="button" className="portal-refresh" onClick={() => void refresh()} disabled={loading}><RefreshCw size={15} />Refresh</button><Link to="/become-an-instructor" className="clinova-button clinova-button--secondary">Instructor guidance</Link></div></div>
        {error && <p role="alert" className="portal-alert">{error}</p>}{notice && <p role="status" className="portal-notice">{notice}</p>}
        {loading ? <div className="portal-loading" role="status">Loading assigned teaching records…</div> : <>
          {activeTab === 'Overview' && <><div className="portal-metrics"><article><span>Assigned programmes</span><strong>{workspace.assignments.length}</strong><small>Active teaching assignments</small></article><article><span>Teaching sessions</span><strong>{workspace.sessions.filter(s => s.session_status === 'scheduled').length}</strong><small>Scheduled sessions</small></article><article><span>Assigned learners</span><strong>{workspace.learners.filter(l => ['active','completed'].includes(l.enrollment_status)).length}</strong><small>Within your assigned courses</small></article><article><span>Lesson resources</span><strong>{workspace.lessons.length}</strong><small>Published and draft lesson records</small></article></div><div className="portal-two-column"><section className="portal-card"><h2>My programmes</h2>{workspace.assignments.length ? workspace.assignments.map(course => <div key={course.id} className="portal-list-row"><div><strong>{course.title}</strong><small>{course.description ?? 'Assigned CPD programme'}</small></div><button type="button" onClick={() => setActiveTab('Resources')}>Manage resources</button></div>) : <div className="portal-empty"><BookOpen size={22} /><h3>No programmes assigned</h3><p>An administrator must assign a published CPD programme to your account.</p></div>}</section><section className="portal-card"><h2>Next teaching sessions</h2>{workspace.sessions.length ? workspace.sessions.slice(0,4).map(session => <div key={session.id} className="portal-list-row"><div><strong>{session.title}</strong><small>{new Date(session.starts_at).toLocaleString()}</small></div><span>{session.session_status}</span></div>) : <div className="portal-empty"><CalendarDays size={22} /><h3>No sessions scheduled</h3><p>Schedule a live teaching session for an assigned programme.</p></div>}</section></div></>}
          {activeTab === 'My programmes' && (workspace.assignments.length ? <div className="portal-course-list">{workspace.assignments.map(course => <article className="portal-card" key={course.id}><h2>{course.title}</h2><p className="portal-muted">{course.description ?? 'Assigned CPD programme'}</p><p className="portal-muted">{workspace.lessons.filter(l => l.course_item_id === course.id).length} lesson records · {workspace.learners.filter(l => l.course_item_id === course.id).length} learner applications/enrolments</p></article>)}</div> : <div className="portal-empty"><BookOpen size={22} /><h3>No programmes assigned</h3><p>Approved teaching assignments will appear here.</p></div>)}
          {activeTab === 'Teaching schedule' && <><form className="portal-card portal-form" onSubmit={createSession}><h2>Schedule a teaching session</h2><label>Programme<select required value={sessionDraft.course_item_id} onChange={e => setSessionDraft(v => ({...v,course_item_id:e.target.value}))}><option value="">Choose an assigned programme</option>{workspace.assignments.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label>Session title<input required maxLength={200} value={sessionDraft.title} onChange={e => setSessionDraft(v => ({...v,title:e.target.value}))} /></label><div className="portal-form-grid"><label>Starts<input required type="datetime-local" value={sessionDraft.starts_at} onChange={e => setSessionDraft(v => ({...v,starts_at:e.target.value}))} /></label><label>Ends<input required type="datetime-local" value={sessionDraft.ends_at} onChange={e => setSessionDraft(v => ({...v,ends_at:e.target.value}))} /></label></div><label>Meeting link (optional)<input type="url" placeholder="https://…" value={sessionDraft.meeting_url} onChange={e => setSessionDraft(v => ({...v,meeting_url:e.target.value}))} /></label><button className="clinova-button clinova-button--primary" disabled={busy || !workspace.assignments.length}>{busy ? 'Saving…' : 'Create session'}</button></form><div className="portal-card">{workspace.sessions.map(session => <div className="portal-list-row" key={session.id}><div><strong>{session.title}</strong><small>{new Date(session.starts_at).toLocaleString()} – {new Date(session.ends_at).toLocaleTimeString()}</small></div><span>{session.session_status}</span></div>)}</div></>}
          {activeTab === 'Learners' && (workspace.learners.length ? <div className="portal-card portal-table-wrap"><table className="portal-table"><thead><tr><th>Learner</th><th>Professional title</th><th>Programme</th><th>Enrolment status</th></tr></thead><tbody>{workspace.learners.map(row => <tr key={row.id}><td>{row.profile?.full_name ?? 'Learner'}</td><td>{row.profile?.professional_title ?? '—'}</td><td>{row.course?.title ?? 'CPD programme'}</td><td>{row.enrollment_status}</td></tr>)}</tbody></table></div> : <div className="portal-empty"><Users size={22} /><h3>No assigned learners</h3><p>Only learners enrolled in your assigned programmes are listed here.</p></div>)}
          {activeTab === 'Resources' && <><form className="portal-card portal-form" onSubmit={createLesson}><h2>Create a lesson</h2><p className="portal-muted">New lessons are saved as unpublished drafts. Only an administrator can publish learner-facing material.</p><label>Programme<select required value={lessonDraft.course_item_id} onChange={e => setLessonDraft(v => ({...v,course_item_id:e.target.value}))}><option value="">Choose an assigned programme</option>{workspace.assignments.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label>Lesson title<input required maxLength={200} value={lessonDraft.title} onChange={e => setLessonDraft(v => ({...v,title:e.target.value}))} /></label><label>Short summary<textarea rows={2} maxLength={1000} value={lessonDraft.summary} onChange={e => setLessonDraft(v => ({...v,summary:e.target.value}))} /></label><label>Lesson content<textarea rows={6} maxLength={50000} value={lessonDraft.content_markdown} onChange={e => setLessonDraft(v => ({...v,content_markdown:e.target.value}))} /></label><label>Sequence number<input required type="number" min="1" step="1" value={lessonDraft.sequence_number} onChange={e => setLessonDraft(v => ({...v,sequence_number:e.target.value}))} /></label><label className="portal-upload"><Upload size={17} />Attach private resource (PDF, office document, image or MP4)<input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.mp4" onChange={e => setResourceFiles(v => ({...v,[lessonDraft.course_item_id]:e.target.files?.[0] ?? null}))} /></label><button className="clinova-button clinova-button--primary" disabled={busy || !workspace.assignments.length}>{busy ? 'Saving…' : 'Save lesson draft'}</button></form><div className="portal-card"><h2>Existing lesson records</h2>{workspace.lessons.map(lesson => <div className="portal-list-row" key={lesson.id}><div><strong>{lesson.sequence_number}. {lesson.title}</strong><small>{lesson.summary ?? 'No summary'} · {lesson.resource_path ? 'Private resource attached' : 'No resource'}</small></div><span>{lesson.is_published ? 'Published' : 'Draft'}</span></div>)}</div></>}
          {activeTab === 'Profile' && <section className="portal-card"><h2>Instructor identity</h2><dl className="portal-profile-list"><div><dt>Account email</dt><dd>{auth.session.user.email ?? 'Not available'}</dd></div><div><dt>Role</dt><dd>Administrator-assigned instructor access</dd></div><div><dt>Teaching assignments</dt><dd>{workspace.assignments.length}</dd></div></dl><p className="portal-muted">Public biography and professional credentials are maintained in the verified instructor profile, separately from your login identity.</p></section>}
        </>}
        <p className="portal-footnote">Learner lists are restricted to courses assigned to this instructor. New lesson content remains unpublished until an authorized administrator approves it.</p>
      </div>
    </main>
  </div>;
}
