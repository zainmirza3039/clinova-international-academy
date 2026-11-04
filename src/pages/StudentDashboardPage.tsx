import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, CalendarDays, CircleUserRound, GraduationCap, LogOut, RefreshCw, UserRound } from 'lucide-react';
import { useAuth } from '@/auth/authContext';
import { useSEO } from '@/hooks/useSEO';
import { learnerDataEnabled } from '@/lib/siteConfig';
import { createSignedCourseResourceUrl, fetchStudentWorkspace, markLessonProgress, updateStudentProfile, type StudentWorkspace } from '@/lib/learning';

type StudentTab = 'Overview' | 'My programmes' | 'Schedule' | 'Certificates' | 'Profile';
const tabs: StudentTab[] = ['Overview', 'My programmes', 'Schedule', 'Certificates', 'Profile'];
const emptyWorkspace: StudentWorkspace = { profile: null, enrollments: [], lessons: [], sessions: [], progress: [], certificates: [] };

function EmptyPanel({ icon: Icon, title, detail, action, to }: { icon: typeof BookOpen; title: string; detail: string; action?: string; to?: string }) {
  return <div className="portal-empty"><span className="portal-empty__icon"><Icon size={23} strokeWidth={1.7} aria-hidden="true" /></span><h3>{title}</h3><p>{detail}</p>{action && to && <Link to={to} className="portal-link">{action} <ArrowRight size={15} aria-hidden="true" /></Link>}</div>;
}

export default function StudentDashboardPage() {
  const auth = useAuth();
  const userId = auth.session?.user.id;
  const [activeTab, setActiveTab] = useState<StudentTab>('Overview');
  const [workspace, setWorkspace] = useState<StudentWorkspace>(emptyWorkspace);
  const [profileDraft, setProfileDraft] = useState({ full_name: '', professional_title: '', institution: '', country: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useSEO({ title: 'Student dashboard | Clinova International Academy', description: 'Your Clinova learner dashboard.', noindex: true });

  const refresh = useCallback(async () => {
    if (!userId || !learnerDataEnabled) { setWorkspace(emptyWorkspace); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const data = await fetchStudentWorkspace(userId);
      setWorkspace(data);
      setProfileDraft({
        full_name: data.profile?.full_name ?? '',
        professional_title: data.profile?.professional_title ?? '',
        institution: data.profile?.institution ?? '',
        country: data.profile?.country ?? '',
      });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your learning workspace could not be loaded.'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const myEnrollments = useMemo(() => workspace.enrollments.filter(item => item.enrollment_status !== 'cancelled'), [workspace.enrollments]);
  const activeEnrollments = useMemo(() => myEnrollments.filter(item => item.enrollment_status === 'active' || item.enrollment_status === 'completed'), [myEnrollments]);
  const pendingApplications = useMemo(() => myEnrollments.filter(item => item.enrollment_status === 'applied'), [myEnrollments]);
  const completedLessons = workspace.progress.filter(item => item.progress_status === 'completed').length;

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!userId || busy) return;
    setBusy(true); setError(null); setNotice(null);
    try { await updateStudentProfile(userId, profileDraft); setNotice('Your profile has been saved.'); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Profile could not be saved.'); }
    finally { setBusy(false); }
  }

  async function openResource(path: string) {
    if (!learnerDataEnabled) return;
    setError(null);
    try { const url = await createSignedCourseResourceUrl(path); window.open(url, '_blank', 'noopener,noreferrer'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Resource could not be opened.'); }
  }

  async function toggleLesson(enrollmentId: string, lessonId: string, completed: boolean) {
    if (!learnerDataEnabled || !userId || busy) return;
    setBusy(true); setError(null); setNotice(null);
    try { await markLessonProgress(userId, enrollmentId, lessonId, completed); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Progress could not be updated.'); }
    finally { setBusy(false); }
  }

  if (!learnerDataEnabled) {
    return <section className="mx-auto max-w-3xl px-6 py-24" aria-labelledby="student-dashboard-title">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Learner services</p>
      <h1 id="student-dashboard-title" className="mt-3 font-heading text-3xl font-bold text-navy-900">Learner services are not enabled</h1>
      <p className="mt-4 leading-relaxed text-navy-700">This release does not load learner records, lesson content, profile data or progress. No learner data request has been made.</p>
      <Link to="/cpd-courses" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4">Browse CPD programmes <ArrowRight size={16} /></Link>
    </section>;
  }

  async function signOut() {
    if (busy) return;
    setBusy(true); const result = await auth.signOut(); setBusy(false);
    if (result.error) setError(result.error.message);
  }

  return <div className="portal-shell" aria-labelledby="student-dashboard-title">
    <aside className="portal-sidebar">
      <div className="portal-sidebar__brand"><span className="portal-sidebar__mark">C</span><span>CLINOVA<small>LEARNER PORTAL</small></span></div>
      <p className="portal-sidebar__label">WORKSPACE</p>
      <nav aria-label="Student dashboard navigation">{tabs.map(tab => <button key={tab} type="button" className={activeTab === tab ? 'portal-nav-item is-active' : 'portal-nav-item'} aria-current={activeTab === tab ? 'page' : undefined} onClick={() => setActiveTab(tab)}>{tab === 'Overview' ? <GraduationCap size={17} /> : tab === 'My programmes' ? <BookOpen size={17} /> : tab === 'Schedule' ? <CalendarDays size={17} /> : tab === 'Certificates' ? <Award size={17} /> : <CircleUserRound size={17} />}{tab}</button>)}</nav>
      <div className="portal-sidebar__bottom"><Link to="/" className="portal-nav-item"><ArrowRight size={16} />Public website</Link><button type="button" onClick={() => void signOut()} disabled={busy} className="portal-nav-item"><LogOut size={16} />{busy ? 'Signing out…' : 'Sign out'}</button></div>
    </aside>
    <main className="portal-main">
      <header className="portal-topbar"><div><span className="portal-kicker">STUDENT WORKSPACE</span><p>{auth.session?.user.email ?? 'Learner account'}</p></div><span className="portal-avatar" aria-hidden="true">{(auth.session?.user.email?.[0] ?? 'S').toUpperCase()}</span></header>
      <div className="portal-content">
        <div className="portal-page-heading"><div><p className="portal-kicker">YOUR LEARNING</p><h1 id="student-dashboard-title">{activeTab === 'Overview' ? 'Welcome to your learning space' : activeTab}</h1><p>Manage your learning journey and keep your professional development organised.</p></div><div className="portal-heading-actions"><button type="button" onClick={() => void refresh()} disabled={loading} className="portal-refresh"><RefreshCw size={15} />Refresh</button><Link to="/cpd-courses" className="clinova-button clinova-button--primary">Browse programmes <ArrowRight size={16} /></Link></div></div>
        {error && <p role="alert" className="portal-alert">{error}</p>}{notice && <p role="status" className="portal-notice">{notice}</p>}
        {loading ? <div className="portal-loading" role="status">Loading your private learning records…</div> : <>
          {activeTab === 'Overview' && <>
            <div className="portal-metrics"><article><span>Enrolled programmes</span><strong>{activeEnrollments.length}</strong><small>Active and completed enrolments</small></article><article><span>Applications pending</span><strong>{pendingApplications.length}</strong><small>Awaiting academy review</small></article><article><span>Lesson progress</span><strong>{completedLessons}</strong><small>Lessons marked complete</small></article><article><span>Upcoming sessions</span><strong>{workspace.sessions.filter(s => s.session_status === 'scheduled' && new Date(s.starts_at) >= new Date()).length}</strong><small>Confirmed teaching sessions</small></article><article><span>Certificates</span><strong>{workspace.certificates.filter(c => !c.revoked_at).length}</strong><small>Valid issued certificates</small></article></div>
            <div className="portal-section-heading"><div><h2>Continue learning</h2><p>Your enrolled programmes and learning materials.</p></div></div>
            {activeEnrollments.length === 0 ? <EmptyPanel icon={BookOpen} title="No active programmes yet" detail="After your application is approved, your programme, lessons and live teaching sessions will appear here." action="Explore CPD programmes" to="/cpd-courses" /> : <div className="portal-course-list">{activeEnrollments.slice(0,3).map(enrollment => <article key={enrollment.id} className="portal-course-card"><div><span className="portal-status">{enrollment.enrollment_status}</span><h3>{enrollment.course?.title ?? 'CPD programme'}</h3><p>{enrollment.course?.description ?? 'Your enrolled programme workspace.'}</p></div><button type="button" className="portal-link-button" onClick={() => setActiveTab('My programmes')}>Open programme <ArrowRight size={15} /></button></article>)}</div>}
            <div className="portal-two-column"><section className="portal-card"><h2>Next teaching sessions</h2>{workspace.sessions.filter(s => s.session_status === 'scheduled' && new Date(s.starts_at) >= new Date()).slice(0,3).length ? workspace.sessions.filter(s => s.session_status === 'scheduled' && new Date(s.starts_at) >= new Date()).slice(0,3).map(session => <div key={session.id} className="portal-list-row"><div><strong>{session.title}</strong><small>{new Date(session.starts_at).toLocaleString()}</small></div>{session.meeting_url && <a href={session.meeting_url} target="_blank" rel="noreferrer">Join session</a>}</div>) : <EmptyPanel icon={CalendarDays} title="No upcoming sessions" detail="Confirmed teaching dates will appear here." />}</section><section className="portal-card"><h2>Certificates and records</h2>{workspace.certificates.length ? workspace.certificates.slice(0,3).map(certificate => <div key={certificate.id} className="portal-list-row"><div><strong>{certificate.course?.title ?? 'CPD certificate'}</strong><small>{certificate.certificate_number} · {certificate.revoked_at ? 'Revoked' : 'Valid'}</small></div><Link to={`/verify?code=${certificate.verification_code}`}>Verify</Link></div>) : <EmptyPanel icon={Award} title="No certificates issued" detail="Verified completion records will appear after an approved programme is completed." />}</section></div>
          </>}
          {activeTab === 'My programmes' && (myEnrollments.length ? <div className="portal-course-list">{myEnrollments.map(enrollment => <article key={enrollment.id} className="portal-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="portal-status">{enrollment.enrollment_status}</span><h2 className="mt-2">{enrollment.course?.title ?? 'CPD programme'}</h2><p className="portal-muted">{enrollment.course?.description ?? 'Your enrolled programme.'}</p></div><small className="text-xs text-slate-500">Applied {new Date(enrollment.applied_at).toLocaleDateString()}</small></div>{enrollment.enrollment_status === 'applied' && <p className="portal-muted">Your application is awaiting administrator review.</p>}{enrollment.enrollment_status === 'active' && <div className="mt-5 space-y-3">{workspace.lessons.filter(lesson => lesson.course_item_id === enrollment.course_item_id).map(lesson => {const done = workspace.progress.some(p => p.lesson_id === lesson.id && p.progress_status === 'completed');return <div key={lesson.id} className="portal-lesson-row"><label><input type="checkbox" checked={done} disabled={busy} onChange={event => void toggleLesson(enrollment.id, lesson.id, event.target.checked)} /><span><strong>{lesson.sequence_number}. {lesson.title}</strong>{lesson.summary && <small>{lesson.summary}</small>}{lesson.content_markdown && <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-clinical-700">Read lesson content</summary><div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy-700">{lesson.content_markdown}</div></details>}</span></label>{lesson.resource_path && <button type="button" className="portal-resource-link" onClick={() => void openResource(lesson.resource_path!)}>Open course resource</button>}</div>})}{!workspace.lessons.some(lesson => lesson.course_item_id === enrollment.course_item_id) && <p className="portal-muted">Your instructor has not published lessons yet.</p>}</div>}{enrollment.enrollment_status === 'completed' && <p className="portal-muted">Programme completion has been recorded.</p>}</article>)}</div> : <EmptyPanel icon={BookOpen} title="No programme enrolments" detail="Your programme applications and learning materials will appear here." action="Browse CPD programmes" to="/cpd-courses" />)}
          {activeTab === 'Schedule' && (workspace.sessions.length ? <div className="portal-card">{workspace.sessions.map(session => <div key={session.id} className="portal-list-row"><div><strong>{session.title}</strong><small>{new Date(session.starts_at).toLocaleString()} – {new Date(session.ends_at).toLocaleTimeString()}</small><small>{session.session_status}</small></div>{session.meeting_url && session.session_status === 'scheduled' && <a href={session.meeting_url} target="_blank" rel="noreferrer">Join session</a>}</div>)}</div> : <EmptyPanel icon={CalendarDays} title="Your calendar is clear" detail="Live teaching dates and programme deadlines will appear here after you are enrolled." />)}
          {activeTab === 'Certificates' && (workspace.certificates.length ? <div className="portal-card">{workspace.certificates.map(certificate => <div key={certificate.id} className="portal-list-row"><div><strong>{certificate.course?.title ?? 'CPD programme'}</strong><small>{certificate.certificate_number} · Issued {new Date(certificate.issued_at).toLocaleDateString()}</small><small>{certificate.revoked_at ? 'Revoked' : 'Valid'}</small></div><Link to={`/verify?code=${certificate.verification_code}`}>Verify certificate</Link></div>)}</div> : <EmptyPanel icon={Award} title="No certificates have been issued" detail="Certificates are issued only after completion is verified by the academy." action="Certification information" to="/certification" />)}
          {activeTab === 'Profile' && <section className="portal-card"><div className="flex items-center gap-3"><UserRound size={20} /><div><h2>Professional profile</h2><p className="portal-muted">Keep your learner details current.</p></div></div><form className="portal-profile-form" onSubmit={saveProfile}><label>Full name<input required maxLength={160} value={profileDraft.full_name} onChange={e => setProfileDraft(v => ({...v,full_name:e.target.value}))} /></label><label>Professional title<input maxLength={160} value={profileDraft.professional_title} onChange={e => setProfileDraft(v => ({...v,professional_title:e.target.value}))} placeholder="Doctor, DPT, nurse…" /></label><label>Institution<input maxLength={200} value={profileDraft.institution} onChange={e => setProfileDraft(v => ({...v,institution:e.target.value}))} /></label><label>Country<input maxLength={120} value={profileDraft.country} onChange={e => setProfileDraft(v => ({...v,country:e.target.value}))} /></label><button type="submit" disabled={busy || !profileDraft.full_name.trim()} className="clinova-button clinova-button--primary">{busy ? 'Saving…' : 'Save profile'}</button></form></section>}
        </>}
        <p className="portal-footnote">Your records are loaded from your authenticated Supabase session. Programme access, learner data and certificates are restricted by database policies.</p>
      </div>
    </main>
  </div>;
}
