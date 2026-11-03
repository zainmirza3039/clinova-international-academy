import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, CalendarDays, CircleUserRound, Clock3, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/authContext';
import { useSEO } from '@/hooks/useSEO';

type StudentTab = 'Overview' | 'My programmes' | 'Schedule' | 'Certificates' | 'Profile';

const tabs: StudentTab[] = ['Overview', 'My programmes', 'Schedule', 'Certificates', 'Profile'];

function EmptyPanel({ icon: Icon, title, detail, action, to }: { icon: typeof BookOpen; title: string; detail: string; action?: string; to?: string }) {
  return <div className="portal-empty">
    <span className="portal-empty__icon"><Icon size={23} strokeWidth={1.7} aria-hidden="true" /></span>
    <h3>{title}</h3><p>{detail}</p>
    {action && to && <Link to={to} className="portal-link">{action} <ArrowRight size={15} aria-hidden="true" /></Link>}
  </div>;
}

export default function StudentDashboardPage() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<StudentTab>('Overview');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useSEO({ title: 'Student dashboard | Clinova International Academy', description: 'Your Clinova learner dashboard.', noindex: true });

  const signOut = async () => {
    if (busy) return;
    setBusy(true); setError(null);
    try { const result = await auth.signOut(); if (result.error) setError(result.error.message); }
    finally { setBusy(false); }
  };

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
        <div className="portal-page-heading"><div><p className="portal-kicker">YOUR LEARNING</p><h1 id="student-dashboard-title">{activeTab === 'Overview' ? 'Welcome to your learning space' : activeTab}</h1><p>Manage your learning journey and keep your professional development organised.</p></div><Link to="/cpd-courses" className="clinova-button clinova-button--primary">Browse programmes <ArrowRight size={16} /></Link></div>
        {error && <p role="alert" className="portal-alert">{error}</p>}
        {activeTab === 'Overview' && <>
          <div className="portal-metrics"><article><span>Enrolled programmes</span><strong>—</strong><small>No enrolment records connected</small></article><article><span>Learning progress</span><strong>—</strong><small>Progress tracking not yet active</small></article><article><span>Upcoming sessions</span><strong>—</strong><small>No teaching schedule available</small></article><article><span>Certificates</span><strong>—</strong><small>No credentials issued through this portal</small></article></div>
          <div className="portal-section-heading"><div><h2>Continue learning</h2><p>Your active programmes will appear here after enrolment is enabled.</p></div></div>
          <EmptyPanel icon={BookOpen} title="Your programme list is empty" detail="When you enrol in an approved Clinova programme, its teaching materials, schedule and progress will be organised here." action="Explore CPD programmes" to="/cpd-courses" />
          <div className="portal-two-column"><section className="portal-card"><h2>Learning calendar</h2><EmptyPanel icon={CalendarDays} title="No sessions scheduled" detail="Confirmed live teaching sessions will appear in your calendar." /></section><section className="portal-card"><h2>Certificates and records</h2><EmptyPanel icon={Award} title="No certificates available" detail="Completion records will appear here when an approved programme and issuance workflow are active." action="Verification information" to="/verify" /></section></div>
        </>}
        {activeTab === 'My programmes' && <EmptyPanel icon={BookOpen} title="No programmes to display" detail="Your enrolled programmes and learning materials will appear here when learner enrolment is activated." action="Browse CPD programmes" to="/cpd-courses" />}
        {activeTab === 'Schedule' && <EmptyPanel icon={Clock3} title="Your calendar is clear" detail="Teaching dates, online sessions and programme deadlines will be shown here once a confirmed timetable is available." />}
        {activeTab === 'Certificates' && <EmptyPanel icon={Award} title="No certificates have been issued" detail="This area will display verified completion records and downloadable certificates when the certificate lifecycle is operational." action="Read about certification" to="/certification" />}
        {activeTab === 'Profile' && <section className="portal-card"><h2>Account information</h2><dl className="portal-profile-list"><div><dt>Email address</dt><dd>{auth.session?.user.email ?? 'Not available'}</dd></div><div><dt>Account status</dt><dd>{auth.emailVerified ? 'Email verified' : 'Verification required'}</dd></div><div><dt>Professional details</dt><dd>Not yet provided</dd></div></dl><p className="portal-muted">Profile editing and professional registration fields will be enabled after the account data model and privacy controls are completed.</p></section>}
        <p className="portal-footnote">Portal preview: learner records, enrolment, attendance, assessment, progress and certificate issuance are not connected yet. No sample learner activity is being presented as real data.</p>
      </div>
    </main>
  </div>;
}
