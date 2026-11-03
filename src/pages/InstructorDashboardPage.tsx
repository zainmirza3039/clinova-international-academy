import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, ClipboardList, CircleUserRound, GraduationCap, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/auth/authContext';
import { useSEO } from '@/hooks/useSEO';

type InstructorTab = 'Overview' | 'My programmes' | 'Teaching schedule' | 'Learners' | 'Resources' | 'Profile';
const tabs: InstructorTab[] = ['Overview', 'My programmes', 'Teaching schedule', 'Learners', 'Resources', 'Profile'];

function EmptyState({ icon: Icon, title, detail }: { icon: typeof BookOpen; title: string; detail: string }) {
  return <div className="portal-empty"><span className="portal-empty__icon"><Icon size={23} strokeWidth={1.7} aria-hidden="true" /></span><h3>{title}</h3><p>{detail}</p></div>;
}

export default function InstructorDashboardPage() {
  const auth = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<InstructorTab>('Overview');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useSEO({ title: 'Instructor workspace | Clinova International Academy', description: 'Clinova instructor workspace.', noindex: true });

  if (!auth.enabled || auth.status === 'disabled') return <section className="mx-auto max-w-3xl px-6 py-20"><h1 className="text-3xl font-semibold text-navy-900">Instructor access is not configured</h1><p className="mt-3 text-navy-600">The secure instructor account service is not enabled.</p></section>;
  if (auth.status === 'loading') return <section className="mx-auto max-w-3xl px-6 py-20" role="status">Checking instructor access…</section>;
  if (!auth.session) return <Navigate to={`/sign-in?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (!auth.emailVerified) return <Navigate to="/sign-in?verification=required" replace />;
  const role = auth.session.user.app_metadata?.role;
  if (role !== 'instructor' && role !== 'faculty') return <section className="mx-auto max-w-3xl px-6 py-20"><p className="portal-kicker">RESTRICTED WORKSPACE</p><h1 className="mt-3 text-3xl font-semibold text-navy-900">Instructor access required</h1><p className="mt-3 text-navy-600">This account does not have an administrator-assigned instructor or faculty role. Public registration cannot grant teaching permissions.</p><Link to="/become-an-instructor" className="mt-6 inline-flex items-center gap-2 font-semibold text-teal-800">Instructor information <ArrowRight size={16} /></Link></section>;

  const signOut = async () => { if (busy) return; setBusy(true); setError(null); try { const result = await auth.signOut(); if (result.error) setError(result.error.message); } finally { setBusy(false); } };

  return <div className="portal-shell" aria-labelledby="instructor-dashboard-title">
    <aside className="portal-sidebar"><div className="portal-sidebar__brand"><span className="portal-sidebar__mark">C</span><span>CLINOVA<small>INSTRUCTOR PORTAL</small></span></div><p className="portal-sidebar__label">TEACHING WORKSPACE</p><nav aria-label="Instructor dashboard navigation">{tabs.map(tab => <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined} className={activeTab === tab ? 'portal-nav-item is-active' : 'portal-nav-item'}>{tab === 'Overview' ? <GraduationCap size={17} /> : tab === 'My programmes' ? <BookOpen size={17} /> : tab === 'Teaching schedule' ? <CalendarDays size={17} /> : tab === 'Learners' ? <Users size={17} /> : tab === 'Resources' ? <ClipboardList size={17} /> : <CircleUserRound size={17} />}{tab}</button>)}</nav><div className="portal-sidebar__bottom"><Link to="/" className="portal-nav-item"><ArrowRight size={16} />Public website</Link><button type="button" className="portal-nav-item" onClick={() => void signOut()} disabled={busy}><LogOut size={16} />{busy ? 'Signing out…' : 'Sign out'}</button></div></aside>
    <main className="portal-main"><header className="portal-topbar"><div><span className="portal-kicker">INSTRUCTOR WORKSPACE</span><p>{auth.session.user.email ?? 'Instructor account'}</p></div><span className="portal-avatar" aria-hidden="true">I</span></header>
      <div className="portal-content"><div className="portal-page-heading"><div><p className="portal-kicker">TEACHING AND COURSE DELIVERY</p><h1 id="instructor-dashboard-title">{activeTab === 'Overview' ? 'Instructor overview' : activeTab}</h1><p>Manage assigned teaching activity and programme resources.</p></div><Link to="/become-an-instructor" className="clinova-button clinova-button--secondary">Instructor guidance</Link></div>
        {error && <p role="alert" className="portal-alert">{error}</p>}
        {activeTab === 'Overview' && <><div className="portal-metrics"><article><span>Assigned programmes</span><strong>—</strong><small>No assignments connected</small></article><article><span>Teaching sessions</span><strong>—</strong><small>No confirmed schedule</small></article><article><span>Active learners</span><strong>—</strong><small>Learner records unavailable</small></article><article><span>Resources awaiting review</span><strong>—</strong><small>No teaching materials assigned</small></article></div><div className="portal-section-heading"><div><h2>Teaching activity</h2><p>Only confirmed assignments and approved programme records will appear here.</p></div></div><div className="portal-two-column"><section className="portal-card"><h2>My programmes</h2><EmptyState icon={BookOpen} title="No programmes assigned" detail="Programme assignments will appear here after an administrator confirms your instructor appointment and course allocation." /></section><section className="portal-card"><h2>Upcoming teaching</h2><EmptyState icon={CalendarDays} title="No sessions scheduled" detail="Confirmed teaching dates and session details will appear in this area." /></section></div></>}
        {activeTab === 'My programmes' && <EmptyState icon={BookOpen} title="No programme assignments" detail="Your approved CPD programmes, teaching plans and course materials will appear here when assigned." />}
        {activeTab === 'Teaching schedule' && <EmptyState icon={CalendarDays} title="No teaching schedule available" detail="Live classes, teaching dates and attendance records are not yet connected." />}
        {activeTab === 'Learners' && <EmptyState icon={Users} title="Learner information is not available" detail="Learner lists and progress are private records and will only be shown after server-side instructor-to-course authorization is implemented." />}
        {activeTab === 'Resources' && <EmptyState icon={ClipboardList} title="No teaching resources assigned" detail="Upload and review controls will be enabled when private storage permissions and course-level access rules are verified." />}
        {activeTab === 'Profile' && <section className="portal-card"><h2>Instructor profile</h2><dl className="portal-profile-list"><div><dt>Account email</dt><dd>{auth.session.user.email ?? 'Not available'}</dd></div><div><dt>Instructor name</dt><dd>Profile details pending administrator verification</dd></div><div><dt>Professional credentials</dt><dd>Not yet verified</dd></div></dl><p className="portal-muted">Teaching permissions and public profile details are managed separately from self-service account registration.</p></section>}
        <p className="portal-footnote">Instructor workspace preview. No learner records, course assignments, attendance, assessment results or teaching materials are currently queried or changed.</p>
      </div>
    </main>
  </div>;
}
