import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/auth/authContext';
import PageHero from '@/components/PageHero';
import CmsAdminWorkspace from '@/components/CmsAdminWorkspace';
import { useSEO } from '@/hooks/useSEO';
import { learnerDataEnabled } from '@/lib/siteConfig';
import { publishedCPDCourses } from '@/data/cpdCourses';
import { publishedEducationalArticles } from '@/data/educationalArticles';
import { publishedProgrammes } from '@/data/programmes';

type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'withdrawn';
type Enrollment = { id: string; student_id: string; programme_slug: string; programme_title: string; status: EnrollmentStatus; enrolled_at: string };
type Progress = { id: string; student_id: string; enrollment_id: string; progress_percent: number; completed_lessons: number; total_lessons: number; updated_at: string };
type Certificate = { id: string; student_id: string; enrollment_id: string; certificate_number: string; programme_title: string; status: 'issued' | 'revoked'; issued_at: string; revoked_at: string | null };
type AdminSection = 'Overview' | 'Courses' | 'Applications' | 'Inquiries' | 'Content' | 'Events' | 'Faculty' | 'Learners' | 'Certificates' | 'Settings';
type CatalogueRow = { id: string; title: string; kind: string; category: string; href: string };

const adminSections: AdminSection[] = ['Overview', 'Courses', 'Applications', 'Inquiries', 'Content', 'Events', 'Faculty', 'Learners', 'Certificates', 'Settings'];
const protectedAreas = ['Courses', 'Applications', 'Inquiries', 'Content', 'Events', 'Faculty', 'Learners', 'Certificates', 'Settings'];
const inputClass = 'mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm text-navy-800';

const courseRows: CatalogueRow[] = [
  ...publishedProgrammes.map(programme => ({
    id: `programme-${programme.id}`,
    title: programme.title,
    kind: 'Learning guide',
    category: programme.department,
    href: `/programmes/${programme.slug}`,
  })),
  ...publishedCPDCourses.map(course => ({
    id: `cpd-${course.id}`,
    title: course.title,
    kind: 'CPD course',
    category: course.department,
    href: `/cpd-courses/${course.slug}`,
  })),
];

const articleRows: CatalogueRow[] = publishedEducationalArticles.map(article => ({
  id: `article-${article.id}`,
  title: article.title,
  kind: 'Educational article',
  category: article.category,
  href: `/resources/${article.slug}`,
}));

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
}

function maskReference(value: string) {
  return value.length > 6 ? `••••${value.slice(-6)}` : 'Hidden';
}

function DisabledAdmin() {
  return <><PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Admin access' }]} eyebrow="Restricted area" title="Administration is not enabled" description="This screen deliberately contains no login, credentials, registration flow or private records." /><section className="bg-surface-50 py-16 lg:py-24"><div className="mx-auto max-w-editorial px-6 lg:px-10"><div className="mx-auto max-w-3xl border border-navy-200 bg-white p-7 md:p-10"><div className="flex items-start gap-4"><ShieldAlert className="h-7 w-7 shrink-0 text-amber-600" aria-hidden="true" /><div><h2 className="font-heading text-2xl font-bold text-navy-800">Secure setup required</h2><p className="mt-3 text-sm leading-relaxed text-navy-600">Admin access is blocked until the application has a real server-side authentication and role contract. A production implementation must verify identity, enforce least-privilege roles on the server and audit access to private records.</p></div></div><div className="mt-8 border-t border-navy-100 pt-7"><h3 className="font-heading text-base font-bold text-navy-800">Protected areas</h3><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{protectedAreas.map(area => <div key={area} className="flex items-center gap-2 border border-navy-100 bg-surface-50 px-3 py-3 text-sm text-navy-500"><LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />{area}</div>)}</div></div><p role="status" className="mt-8 bg-navy-50 px-4 py-3 text-sm text-navy-700">No sign-in is offered and no private data has been requested or displayed.</p></div></div></section></>;
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <article className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-navy-600">{label}</p><p className="mt-2 text-3xl font-bold text-navy-900">{value}</p><p className="mt-2 text-xs leading-relaxed text-navy-500">{detail}</p></article>;
}

function SourceRecordsTable({ rows, label }: { rows: CatalogueRow[]; label: string }) {
  if (rows.length === 0) return <p className="rounded-lg border border-dashed border-navy-200 bg-white p-6 text-sm text-navy-600">No source records match this search.</p>;
  return <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
    <table aria-label={label} className="min-w-full divide-y divide-navy-100 text-left text-sm">
      <thead className="bg-surface-50 text-xs uppercase tracking-wide text-navy-600"><tr><th scope="col" className="px-4 py-3">Title</th><th scope="col" className="px-4 py-3">Type</th><th scope="col" className="px-4 py-3">Subject area</th><th scope="col" className="px-4 py-3">Source status</th></tr></thead>
      <tbody className="divide-y divide-navy-100">{rows.map(row => <tr key={row.id} className="align-top"><td className="px-4 py-3 font-medium text-navy-800"><Link className="underline decoration-teal-500 underline-offset-4 hover:text-teal-700" to={row.href}>{row.title}</Link></td><td className="px-4 py-3 text-navy-600">{row.kind}</td><td className="px-4 py-3 text-navy-600">{row.category}</td><td className="px-4 py-3"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">Published</span></td></tr>)}</tbody>
    </table>
  </div>;
}

function UnavailablePanel({ title, message, linkTo, linkLabel }: { title: string; message: string; linkTo?: string; linkLabel?: string }) {
  return <section aria-labelledby="unavailable-title" className="rounded-xl border border-amber-200 bg-amber-50 p-6">
    <h3 id="unavailable-title" className="text-lg font-semibold text-navy-900">{title}</h3>
    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-700">{message}</p>
    {linkTo && linkLabel && <Link className="mt-4 inline-flex font-semibold text-teal-800 underline underline-offset-4" to={linkTo}>{linkLabel}</Link>}
  </section>;
}

function ReadOnlyTable({ children, label }: { children: React.ReactNode; label: string }) {
  return <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white"><table aria-label={label} className="min-w-full divide-y divide-navy-100 text-left text-sm">{children}</table></div>;
}

export default function AdminPage() {
  const auth = useAuth();
  const isAdmin = auth.session?.user.app_metadata?.role === 'admin';
  const currentUserId = auth.session?.user.id ?? null;
  const [activeSection, setActiveSection] = useState<AdminSection>('Overview');
  const [courseSearch, setCourseSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [recordsLoaded, setRecordsLoaded] = useState(false);
  const [recordsOwnerId, setRecordsOwnerId] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  useSEO({ title: 'Admin access', description: 'Restricted Clinova administration.', noindex: true });

  const loadRecords = useCallback(async (isCurrent: () => boolean = () => true) => {
    if (!isAdmin || !learnerDataEnabled || !currentUserId) return;
    setLoading(true);
    setRecordsLoaded(false);
    setDataError(null);
    try {
      const { supabase } = await import('@/lib/supabase');
      const [enrollmentResult, progressResult, certificateResult] = await Promise.all([
        supabase.from('student_enrollments').select('id, student_id, programme_slug, programme_title, status, enrolled_at').order('enrolled_at', { ascending: false }).limit(100),
        supabase.from('student_learning_progress').select('id, student_id, enrollment_id, progress_percent, completed_lessons, total_lessons, updated_at').order('updated_at', { ascending: false }).limit(100),
        supabase.from('student_certificates').select('id, student_id, enrollment_id, certificate_number, programme_title, status, issued_at, revoked_at').order('issued_at', { ascending: false }).limit(100),
      ]);
      if ([enrollmentResult, progressResult, certificateResult].some(result => result.error)) throw new Error('Records unavailable');
      if (!isCurrent()) return;
      setEnrollments((enrollmentResult.data ?? []) as Enrollment[]);
      setProgress((progressResult.data ?? []) as Progress[]);
      setCertificates((certificateResult.data ?? []) as Certificate[]);
      setRecordsOwnerId(currentUserId);
      setRecordsLoaded(true);
    } catch {
      if (isCurrent()) setDataError('Private admin records could not be loaded. No change was made. Confirm the approved read-only data policy and trusted admin role.');
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [currentUserId, isAdmin]);

  useEffect(() => {
    if (!auth.enabled || auth.status !== 'ready' || !isAdmin || !learnerDataEnabled) return;
    let active = true;
    void loadRecords(() => active);
    return () => { active = false; };
  }, [auth.enabled, auth.status, auth.session?.user.id, isAdmin, loadRecords]);

  if (!auth.enabled) return <DisabledAdmin />;
  if (auth.status === 'loading') return <section className="mx-auto max-w-3xl px-6 py-20 text-center" role="status"><h1 className="text-3xl font-bold text-navy-900">Checking admin session…</h1><p className="mt-4 text-navy-600">Please wait while authentication is checked.</p></section>;
  if (auth.status === 'error') return <section className="mx-auto max-w-3xl px-6 py-20"><h1 className="text-3xl font-bold text-navy-900">Admin access unavailable</h1><p role="alert" className="mt-4 text-navy-600">{auth.error ?? 'Authentication could not be checked.'}</p></section>;
  if (!auth.session) return <section className="mx-auto max-w-3xl px-6 py-20"><h1 className="text-3xl font-bold text-navy-900">Admin sign-in required</h1><p className="mt-4 text-navy-600">Sign in with an existing account that has a trusted admin role. Public registration cannot grant administration access.</p><Link className="mt-6 inline-flex rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white" to="/sign-in?returnTo=%2Fadmin">Sign in to admin</Link></section>;
  if (!isAdmin) return <section className="mx-auto max-w-3xl px-6 py-20"><h1 className="text-3xl font-bold text-navy-900">Admin access denied</h1><p className="mt-4 text-navy-600">This account does not have the trusted admin role. Contact the project owner; roles cannot be assigned through public sign-up.</p></section>;

  const filteredCourses = courseRows.filter(row => `${row.title} ${row.kind} ${row.category}`.toLowerCase().includes(courseSearch.trim().toLowerCase()));
  const filteredArticles = articleRows.filter(row => `${row.title} ${row.category}`.toLowerCase().includes(contentSearch.trim().toLowerCase()));
  const hasCurrentRecords = recordsLoaded && recordsOwnerId === currentUserId;
  const privateDataState = !learnerDataEnabled ? 'Disabled' : dataError ? 'Unavailable' : loading ? 'Loading' : hasCurrentRecords ? 'Read-only available' : 'Waiting';

  return <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="admin-title">
    <header className="flex flex-col gap-4 border-b border-navy-100 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Restricted area</p><h1 id="admin-title" className="mt-2 text-3xl font-bold text-navy-900">Clinova admin panel</h1><p className="mt-2 text-sm text-navy-600">Signed in as {auth.session.user.email ?? 'verified admin'}. Private records are shown only through the existing data gate.</p></div>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={() => void auth.signOut()} className="rounded-lg border border-teal-700 px-4 py-2 font-semibold text-teal-800 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">Sign out</button>{learnerDataEnabled && <button type="button" onClick={() => void loadRecords()} disabled={loading} className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">{loading ? 'Refreshing…' : 'Refresh records'}</button>}</div>
    </header>

    <nav aria-label="Admin panel sections" className="mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
      {adminSections.map(section => <button key={section} type="button" aria-pressed={activeSection === section} onClick={() => setActiveSection(section)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${activeSection === section ? 'border-teal-700 bg-teal-700 text-white' : 'border-navy-200 bg-white text-navy-700 hover:bg-surface-50'}`}>{section}</button>)}
    </nav>

    {dataError && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{dataError}</p>}
    {!learnerDataEnabled && <p className="mt-5 rounded-lg border border-navy-200 bg-surface-50 p-3 text-sm text-navy-700" role="status">Private learner, progress and certificate records are not loaded because the learner-data gate is disabled. Public catalogue summaries below use repository source only.</p>}
    {learnerDataEnabled && loading && <p className="mt-5 text-sm text-navy-600" role="status">Loading read-only private records…</p>}

    {activeSection === 'Overview' && <section className="mt-8" aria-labelledby="overview-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="overview-title" className="text-2xl font-bold text-navy-900">Admin overview</h2><p className="mt-1 text-sm text-navy-600">Current published catalogue data and workflow availability; no invented activity metrics.</p></div></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Learning guides" value={publishedProgrammes.length} detail="Published programme source records" />
        <MetricCard label="CPD courses" value={publishedCPDCourses.length} detail="Published course source records" />
        <MetricCard label="Educational articles" value={publishedEducationalArticles.length} detail="Published article source records" />
        <MetricCard label="Private records" value={privateDataState} detail="Read-only access through the existing feature gate" />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-navy-100 bg-white p-5"><h3 className="text-lg font-semibold text-navy-900">Catalogue status</h3><p className="mt-2 text-sm leading-relaxed text-navy-600">Publication status is source metadata only. It is not clinical review, editorial approval, accreditation or evidence of certificate eligibility. Use the academy’s approved review process before changing source content.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => setActiveSection('Courses')} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">Browse courses</button><button type="button" onClick={() => setActiveSection('Content')} className="rounded-lg border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50">Browse articles</button></div></section>
        <section className="rounded-xl border border-navy-100 bg-white p-5"><h3 className="text-lg font-semibold text-navy-900">Unavailable workflows</h3><ul className="mt-3 space-y-2 text-sm text-navy-700"><li>Application submissions: no connected submission store.</li><li>Public inquiries: local draft validation only; no saved submissions.</li><li>Certificate issue/revoke: disabled; server-side eligibility enforcement is absent.</li><li>Event/faculty editing: no verified structured source or admin workflow.</li></ul></section>
      </div>
    </section>}

    {activeSection === 'Courses' && <section className="mt-8" aria-labelledby="courses-title"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="courses-title" className="text-2xl font-bold text-navy-900">Courses and learning guides</h2><p className="mt-1 text-sm text-navy-600">Read-only view of currently published source records.</p></div><label className="w-full sm:max-w-sm"><span className="text-sm font-medium text-navy-700">Search courses</span><input className={inputClass} type="search" value={courseSearch} onChange={event => setCourseSearch(event.target.value)} placeholder="Title, type or subject area" /></label></div><p className="mt-4 text-sm text-navy-600" role="status" aria-live="polite" aria-atomic="true">{filteredCourses.length} of {courseRows.length} courses shown</p><div className="mt-3"><SourceRecordsTable rows={filteredCourses} label="Published courses and learning guides" /></div><p className="mt-3 text-xs leading-relaxed text-navy-500">Editing and publication changes are unavailable here. Confirm content and review approvals through the academy’s approved process before changing source records.</p></section>}

    {activeSection === 'Applications' && <section className="mt-8" aria-labelledby="applications-title"><h2 id="applications-title" className="mb-4 text-2xl font-bold text-navy-900">Applications</h2><UnavailablePanel title="Application management is unavailable" message="The public application pages provide guidance only. This site has no connected application submission store or secure reviewer workflow, so this panel cannot list, accept or change applications." linkTo="/application" linkLabel="View public application information" /></section>}

    {activeSection === 'Inquiries' && <section className="mt-8" aria-labelledby="inquiries-title"><h2 id="inquiries-title" className="mb-4 text-2xl font-bold text-navy-900">Inquiries</h2><UnavailablePanel title="Inquiry management is unavailable" message="Contact and partnership forms do not save or send submissions. No inquiry records are available to list, assign or respond to from this panel." linkTo="/training-partners" linkLabel="View the collaboration draft page" /></section>}

    {activeSection === 'Content' && <section className="mt-8" aria-labelledby="content-title"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="content-title" className="text-2xl font-bold text-navy-900">Educational content</h2><p className="mt-1 text-sm text-navy-600">Published article records from the local repository source.</p></div><label className="w-full sm:max-w-sm"><span className="text-sm font-medium text-navy-700">Search articles</span><input className={inputClass} type="search" value={contentSearch} onChange={event => setContentSearch(event.target.value)} placeholder="Title or category" /></label></div><p className="mt-4 text-sm text-navy-600" role="status" aria-live="polite" aria-atomic="true">{filteredArticles.length} of {articleRows.length} articles shown</p><div className="mt-3"><SourceRecordsTable rows={filteredArticles} label="Published educational articles" /></div><p className="mt-3 text-xs leading-relaxed text-navy-500">The source publication flag is not clinical/editorial sign-off. This panel does not edit or approve article content.</p><CmsAdminWorkspace user={auth.session.user} /></section>}

    {activeSection === 'Events' && <section className="mt-8" aria-labelledby="events-title"><h2 id="events-title" className="mb-4 text-2xl font-bold text-navy-900">Events</h2><UnavailablePanel title="No confirmed events are available" message="The current public events page contains no event records. Event creation, registration and attendee management are not connected." linkTo="/events" linkLabel="View the public events page" /></section>}

    {activeSection === 'Faculty' && <section className="mt-8" aria-labelledby="faculty-title"><h2 id="faculty-title" className="mb-4 text-2xl font-bold text-navy-900">Faculty</h2><UnavailablePanel title="No verified faculty profiles are available" message="The current public faculty page contains no verified profile records. Adding or editing qualifications would require verified information and an approved content workflow." linkTo="/faculty" linkLabel="View the public faculty page" /></section>}

    {activeSection === 'Learners' && <section className="mt-8" aria-labelledby="learners-title"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="learners-title" className="text-2xl font-bold text-navy-900">Learner records</h2><p className="mt-1 text-sm text-navy-600">Read-only records from the existing gated source; up to the latest 100 per table.</p></div></div>{!learnerDataEnabled ? <UnavailablePanel title="Learner data access is disabled" message="No private learner, enrolment or progress records have been requested. Access remains behind the existing feature gate." /> : dataError ? <p className="mt-4 text-sm text-red-800" role="alert">Learner records are unavailable.</p> : hasCurrentRecords && !loading ? <div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-navy-100 bg-white p-5"><h3 className="text-lg font-semibold text-navy-900">Enrolments ({enrollments.length})</h3>{enrollments.length ? <ul className="mt-4 divide-y divide-navy-100">{enrollments.map(item => <li key={item.id} className="py-3 first:pt-0 last:pb-0"><p className="font-medium text-navy-800">{item.programme_title}</p><p className="mt-1 text-xs text-navy-600">Learner ref {maskReference(item.student_id)} · {item.status}</p><p className="mt-1 text-xs text-navy-500">Added {formatDate(item.enrolled_at)}</p></li>)}</ul> : <p className="mt-3 text-sm text-navy-600">No enrolments are available to this admin.</p>}</section><section className="rounded-xl border border-navy-100 bg-white p-5"><h3 className="text-lg font-semibold text-navy-900">Learning progress ({progress.length})</h3>{progress.length ? <ul className="mt-4 divide-y divide-navy-100">{progress.map(item => <li key={item.id} className="py-3 first:pt-0 last:pb-0"><p className="font-medium text-navy-800">{enrollments.find(enrollment => enrollment.id === item.enrollment_id)?.programme_title ?? 'Enrolment record'}</p><p className="mt-1 text-sm text-navy-600">{item.progress_percent}% · {item.completed_lessons}/{item.total_lessons} lessons</p><p className="mt-1 text-xs text-navy-500">Learner ref {maskReference(item.student_id)} · Updated {formatDate(item.updated_at)}</p></li>)}</ul> : <p className="mt-3 text-sm text-navy-600">No progress records are available to this admin.</p>}</section></div> : !loading ? <p className="mt-4 text-sm text-navy-600" role="status">Private records have not loaded yet.</p> : null}<p className="mt-4 text-xs leading-relaxed text-navy-500">No enrolment or progress writes are available in this panel. Completion status is not independent evidence of certificate eligibility.</p></section>}

    {activeSection === 'Certificates' && <section className="mt-8" aria-labelledby="certificates-title"><h2 id="certificates-title" className="text-2xl font-bold text-navy-900">Certificates</h2><UnavailablePanel title="Certificate issuance and revocation are disabled" message="No server-side course-completion or award-eligibility enforcement exists. This panel has no issue/revoke controls and must not be treated as a security boundary. The certificate list, when available through the existing read gate, is read-only; no direct database state was changed." />{!learnerDataEnabled ? <p className="mt-4 text-sm text-navy-600">Certificate records are not loaded because the learner-data gate is disabled.</p> : dataError ? <p className="mt-4 text-sm text-red-800" role="alert">Certificate records are unavailable.</p> : hasCurrentRecords && !loading ? certificates.length ? <div className="mt-5"><ReadOnlyTable label="Read-only certificate records"><thead className="bg-surface-50 text-xs uppercase tracking-wide text-navy-600"><tr><th scope="col" className="px-4 py-3">Programme</th><th scope="col" className="px-4 py-3">Reference</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3">Issued</th></tr></thead><tbody className="divide-y divide-navy-100">{certificates.map(item => <tr key={item.id}><td className="px-4 py-3 font-medium text-navy-800">{item.programme_title}</td><td className="px-4 py-3 text-navy-600">{maskReference(item.certificate_number)}</td><td className="px-4 py-3 text-navy-600">{item.status}</td><td className="px-4 py-3 text-navy-600">{formatDate(item.issued_at)}</td></tr>)}</tbody></ReadOnlyTable></div> : <p className="mt-4 text-sm text-navy-600">No certificate records are available to this admin.</p> : !loading ? <p className="mt-4 text-sm text-navy-600" role="status">Private records have not loaded yet.</p> : null}</section>}

    {activeSection === 'Settings' && <section className="mt-8" aria-labelledby="settings-title"><h2 id="settings-title" className="text-2xl font-bold text-navy-900">Settings</h2><p className="mt-1 text-sm text-navy-600">This panel shows safe operational status only; configuration is not editable here.</p><div className="mt-5 grid gap-4 md:grid-cols-2"><MetricCard label="Admin identity" value="Verified role required" detail="This page checks the existing authenticated admin claim; server-side RLS remains essential." /><MetricCard label="Private record access" value={privateDataState} detail="The existing feature gate controls read-only access. No credentials or configuration values are displayed." /><MetricCard label="Certificate issuance" value="Disabled" detail="No server-side completion and award-eligibility enforcement exists." /><MetricCard label="Applications and inquiries" value="Unavailable" detail="No connected submission store or review workflow is present." /></div><p className="mt-5 rounded-lg border border-navy-200 bg-surface-50 p-4 text-sm leading-relaxed text-navy-700">Authentication, role assignment, feature flags, database permissions and storage settings cannot be changed from this panel.</p></section>}
  </section>;
}
