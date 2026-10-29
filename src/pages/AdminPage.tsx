import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';
import { learnerDataEnabled } from '@/lib/siteConfig';

type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'withdrawn';
type Enrollment = { id: string; student_id: string; programme_slug: string; programme_title: string; status: EnrollmentStatus; enrolled_at: string };
type Progress = { id: string; student_id: string; enrollment_id: string; progress_percent: number; completed_lessons: number; total_lessons: number; updated_at: string };
type Certificate = { id: string; student_id: string; enrollment_id: string; certificate_number: string; programme_title: string; status: 'issued' | 'revoked'; issued_at: string; revoked_at: string | null };

const sections = ['Courses', 'Applications', 'Inquiries', 'Content', 'Events', 'Faculty', 'Settings'];
const inputClass = 'mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm text-navy-800';
const labelClass = 'block text-sm font-medium text-navy-700';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
}

function DisabledAdmin() {
  return <><PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Admin access' }]} eyebrow="Restricted area" title="Administration is not enabled" description="This screen deliberately contains no login, credentials, registration flow or private records." /><section className="py-16 lg:py-24 bg-surface-50"><div className="max-w-editorial mx-auto px-6 lg:px-10"><div className="max-w-3xl mx-auto bg-white border border-navy-200 p-7 md:p-10"><div className="flex items-start gap-4"><ShieldAlert className="w-7 h-7 text-amber-600 shrink-0" aria-hidden="true" /><div><h2 className="font-heading text-2xl font-bold text-navy-800">Secure setup required</h2><p className="mt-3 text-sm leading-relaxed text-navy-600">Admin access is blocked until the application has a real server-side authentication and role contract. A production implementation must verify identity, enforce least-privilege roles on the server and audit access to private records.</p></div></div><div className="mt-8 border-t border-navy-100 pt-7"><h3 className="font-heading text-base font-bold text-navy-800">Protected areas</h3><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">{sections.map(section => <div key={section} className="flex items-center gap-2 border border-navy-100 bg-surface-50 px-3 py-3 text-sm text-navy-500"><LockKeyhole className="w-4 h-4 shrink-0" aria-hidden="true" />{section}</div>)}</div></div><p role="status" className="mt-8 bg-navy-50 px-4 py-3 text-sm text-navy-700">No sign-in is offered and no private data has been requested or displayed.</p></div></div></section></>;
}

export default function AdminPage() {
  const auth = useAuth();
  const isAdmin = auth.session?.user.app_metadata?.role === 'admin';
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const busyRef = useRef(false);
  useSEO({ title: 'Admin access', description: 'Restricted Clinova administration.', noindex: true });

  const loadRecords = useCallback(async (isCurrent: () => boolean = () => true) => {
    if (!isAdmin || !learnerDataEnabled) return;
    setLoading(true);
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
    } catch {
      if (isCurrent()) setDataError('Admin records could not be loaded. Confirm that the learner migration is installed and this account has the trusted admin role.');
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!auth.enabled || auth.status !== 'ready' || !isAdmin || !learnerDataEnabled) return;
    let active = true;
    void loadRecords(() => active);
    return () => { active = false; };
  }, [auth.enabled, auth.status, auth.session?.user.id, isAdmin, loadRecords]);

  const runAction = async (action: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setActionError(null);
    setActionMessage(null);
    try { await action(); }
    catch { setActionError('The action failed. Check the entered values, database setup and admin permissions.'); }
    finally { busyRef.current = false; setBusy(false); }
  };

  const createEnrollment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    void runAction(async () => {
      const studentId = String(values.get('student_id') ?? '').trim();
      const programmeSlug = String(values.get('programme_slug') ?? '').trim();
      const programmeTitle = String(values.get('programme_title') ?? '').trim();
      if (!studentId || !programmeSlug || !programmeTitle) throw new Error('Missing values');
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('student_enrollments').insert({
        student_id: studentId,
        programme_slug: programmeSlug,
        programme_title: programmeTitle,
        status: 'pending',
      });
      if (error) throw error;
      form.reset();
      setActionMessage('Enrolment record created.');
      await loadRecords();
    });
  };

  const saveProgress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    void runAction(async () => {
      const enrollment = enrollments.find(item => item.id === String(values.get('enrollment_id') ?? ''));
      const progressPercent = Number(values.get('progress_percent'));
      const completedLessons = Number(values.get('completed_lessons'));
      const totalLessons = Number(values.get('total_lessons'));
      if (!enrollment || !Number.isInteger(progressPercent) || progressPercent < 0 || progressPercent > 100 ||
          !Number.isInteger(completedLessons) || completedLessons < 0 ||
          !Number.isInteger(totalLessons) || totalLessons < 0 || completedLessons > totalLessons) {
        throw new Error('Invalid progress values');
      }
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('student_learning_progress').upsert({
        student_id: enrollment.student_id,
        enrollment_id: enrollment.id,
        progress_percent: progressPercent,
        completed_lessons: completedLessons,
        total_lessons: totalLessons,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'enrollment_id' });
      if (error) throw error;
      form.reset();
      setActionMessage('Learning progress saved.');
      await loadRecords();
    });
  };

  const issueCertificate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    void runAction(async () => {
      const enrollment = enrollments.find(item => item.id === String(values.get('enrollment_id') ?? ''));
      const certificateNumber = String(values.get('certificate_number') ?? '').trim();
      if (!enrollment || certificateNumber.length < 4 || certificateNumber.length > 120) throw new Error('Invalid certificate details');
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('student_certificates').insert({
        student_id: enrollment.student_id,
        enrollment_id: enrollment.id,
        certificate_number: certificateNumber,
        programme_title: enrollment.programme_title,
        issued_by: auth.session?.user.id,
      });
      if (error) throw error;
      form.reset();
      setActionMessage('Certificate record issued. Public verification is not enabled by this page.');
      await loadRecords();
    });
  };

  const updateEnrollmentStatus = (id: string, status: EnrollmentStatus) => {
    void runAction(async () => {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('student_enrollments').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setActionMessage('Enrolment status updated.');
      await loadRecords();
    });
  };

  const revokeCertificate = (certificate: Certificate) => {
    if (certificate.status !== 'issued') return;
    if (!window.confirm('Revoke this certificate? The record will be retained for audit.')) return;
    void runAction(async () => {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('student_certificates').update({ status: 'revoked', revoked_at: new Date().toISOString() }).eq('id', certificate.id).eq('status', 'issued');
      if (error) throw error;
      setActionMessage('Certificate revoked; the record has been retained.');
      await loadRecords();
    });
  };

  if (!auth.enabled) return <DisabledAdmin />;
  if (auth.status === 'loading') return <section className="mx-auto max-w-3xl px-6 py-20 text-center" role="status"><h1 className="text-3xl font-bold text-navy-900">Checking admin session…</h1><p className="mt-4 text-navy-600">Please wait while authentication is checked.</p></section>;
  if (auth.status === 'error') return <section className="mx-auto max-w-3xl px-6 py-20"><h1 className="text-3xl font-bold text-navy-900">Admin access unavailable</h1><p role="alert" className="mt-4 text-navy-600">{auth.error ?? 'Authentication could not be checked.'}</p></section>;
  if (!auth.session) return <section className="mx-auto max-w-3xl px-6 py-20"><h1 className="text-3xl font-bold text-navy-900">Admin sign-in required</h1><p className="mt-4 text-navy-600">Sign in with an existing account that has a trusted admin role. Public registration cannot grant administration access.</p><Link className="mt-6 inline-flex rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white" to="/sign-in?returnTo=%2Fadmin">Sign in to admin</Link></section>;
  if (!isAdmin) return <section className="mx-auto max-w-3xl px-6 py-20"><h1 className="text-3xl font-bold text-navy-900">Admin access denied</h1><p className="mt-4 text-navy-600">This account does not have the trusted admin role. Contact the project owner; roles cannot be assigned through public sign-up.</p></section>;
  if (!learnerDataEnabled) return <section className="mx-auto max-w-3xl px-6 py-20"><h1 className="text-3xl font-bold text-navy-900">Admin data access is disabled</h1><p className="mt-4 text-navy-600">The learner schema and RLS tests must be completed in a non-production environment before this panel can access records.</p></section>;

  return <section className="mx-auto max-w-7xl px-6 py-12" aria-labelledby="admin-title">
    <header className="flex flex-col gap-4 border-b border-navy-100 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Restricted area</p><h1 id="admin-title" className="mt-2 text-3xl font-bold text-navy-900">Clinova administration</h1><p className="mt-2 text-navy-600">Signed in as {auth.session.user.email ?? 'verified admin'}; access is also enforced by database RLS.</p></div><button type="button" onClick={() => void auth.signOut()} className="rounded-lg border border-teal-600 px-4 py-2 font-semibold text-teal-700 hover:bg-teal-50">Sign out</button></header>
    {dataError && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{dataError}</p>}
    {actionError && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{actionError}</p>}
    {actionMessage && <p className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-teal-800" role="status">{actionMessage}</p>}
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <form onSubmit={createEnrollment} className="space-y-4 rounded-xl border border-navy-100 bg-white p-5">
        <h2 className="text-lg font-semibold text-navy-900">Create enrolment</h2>
        <label className={labelClass}>Student user ID<input className={inputClass} name="student_id" required maxLength={36} placeholder="UUID from trusted Auth admin" /></label>
        <label className={labelClass}>Programme slug<input className={inputClass} name="programme_slug" required maxLength={160} /></label>
        <label className={labelClass}>Programme title<input className={inputClass} name="programme_title" required maxLength={200} /></label>
        <button disabled={busy || loading} className="w-full rounded-lg bg-teal-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Create enrolment'}</button>
      </form>
      <form onSubmit={saveProgress} className="space-y-4 rounded-xl border border-navy-100 bg-white p-5">
        <h2 className="text-lg font-semibold text-navy-900">Update progress</h2>
        <label className={labelClass}>Enrolment<select className={inputClass} name="enrollment_id" required defaultValue=""><option value="" disabled>Select enrolment</option>{enrollments.map(item => <option key={item.id} value={item.id}>{item.programme_title} — {item.student_id.slice(0, 8)}</option>)}</select></label>
        <label className={labelClass}>Progress percent<input className={inputClass} name="progress_percent" type="number" min="0" max="100" step="1" required /></label>
        <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Completed lessons<input className={inputClass} name="completed_lessons" type="number" min="0" step="1" required /></label><label className={labelClass}>Total lessons<input className={inputClass} name="total_lessons" type="number" min="0" step="1" required /></label></div>
        <button disabled={busy || loading || enrollments.length === 0} className="w-full rounded-lg bg-teal-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save progress'}</button>
      </form>
      <form onSubmit={issueCertificate} className="space-y-4 rounded-xl border border-navy-100 bg-white p-5">
        <h2 className="text-lg font-semibold text-navy-900">Issue certificate record</h2>
        <label className={labelClass}>Completed enrolment<select className={inputClass} name="enrollment_id" required defaultValue=""><option value="" disabled>Select enrolment</option>{enrollments.filter(item => item.status === 'completed').map(item => <option key={item.id} value={item.id}>{item.programme_title} — {item.student_id.slice(0, 8)}</option>)}</select></label>
        <label className={labelClass}>Certificate number<input className={inputClass} name="certificate_number" required minLength={4} maxLength={120} /></label>
        <p className="text-xs text-navy-500">This creates a private record only. It does not confirm accreditation or enable public verification.</p>
        <button disabled={busy || loading || !enrollments.some(item => item.status === 'completed')} className="w-full rounded-lg bg-teal-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Issue record'}</button>
      </form>
    </div>
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-navy-100 bg-white p-5"><h2 className="text-xl font-semibold text-navy-900">Enrolments ({enrollments.length})</h2>{loading ? <p role="status" className="mt-4 text-sm text-navy-500">Loading records…</p> : enrollments.length ? <div className="mt-4 space-y-4">{enrollments.map(item => <div key={item.id} className="border-b border-navy-100 pb-4 last:border-0"><p className="font-semibold text-navy-800">{item.programme_title}</p><p className="mt-1 break-all text-xs text-navy-500">Student: {item.student_id}</p><p className="break-all text-xs text-navy-400">Record: {item.id}</p><div className="mt-2 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-navy-500">Added {formatDate(item.enrolled_at)}</span><label className="text-sm text-navy-600">Status<select aria-label={`Status for ${item.programme_title} ${item.id}`} className="ml-2 rounded border border-navy-200 px-2 py-1" value={item.status} disabled={busy} onChange={event => updateEnrollmentStatus(item.id, event.target.value as EnrollmentStatus)}>{(['pending', 'active', 'completed', 'withdrawn'] as EnrollmentStatus[]).map(status => <option key={status} value={status}>{status}</option>)}</select></label></div></div>)}</div> : <p className="mt-4 text-sm text-navy-500">No enrolments recorded.</p>}</section>
      <section className="rounded-xl border border-navy-100 bg-white p-5"><h2 className="text-xl font-semibold text-navy-900">Learning progress ({progress.length})</h2>{progress.length ? <div className="mt-4 space-y-4">{progress.map(item => <div key={item.id} className="border-b border-navy-100 pb-4 last:border-0"><p className="font-semibold text-navy-800">{enrollments.find(enrollment => enrollment.id === item.enrollment_id)?.programme_title ?? item.enrollment_id}</p><p className="mt-1 text-sm text-navy-600">{item.progress_percent}% · {item.completed_lessons}/{item.total_lessons} lessons</p><p className="break-all text-xs text-navy-400">Student: {item.student_id}</p></div>)}</div> : <p className="mt-4 text-sm text-navy-500">No progress records.</p>}</section>
      <section className="rounded-xl border border-navy-100 bg-white p-5 lg:col-span-2"><h2 className="text-xl font-semibold text-navy-900">Certificates ({certificates.length})</h2>{certificates.length ? <div className="mt-4 space-y-4">{certificates.map(item => <div key={item.id} className="flex flex-col gap-3 border-b border-navy-100 pb-4 sm:flex-row sm:items-center sm:justify-between last:border-0"><div><p className="font-semibold text-navy-800">{item.programme_title}</p><p className="mt-1 text-sm text-navy-600">{item.certificate_number} · {item.status}</p><p className="break-all text-xs text-navy-400">Student: {item.student_id}</p><p className="text-xs text-navy-400">Issued {formatDate(item.issued_at)}</p></div>{item.status === 'issued' && <button type="button" disabled={busy} onClick={() => revokeCertificate(item)} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60">Revoke certificate</button>}</div>)}</div> : <p className="mt-4 text-sm text-navy-500">No certificate records.</p>}</section>
    </div>
  </section>;
}
