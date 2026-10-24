import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useSEO } from '@/hooks/useSEO';
import { learnerDataEnabled } from '@/lib/siteConfig';

type Enrollment = { id: string; programme_title: string; status: string; enrolled_at: string };
type Progress = { id: string; enrollment_id: string; progress_percent: number; completed_lessons: number; total_lessons: number; updated_at: string };
type Certificate = { id: string; certificate_number: string; programme_title: string; issued_at: string };

function EmptySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-navy-100 bg-white p-5 shadow-[0_10px_34px_-28px_rgba(8,43,76,0.45)] sm:p-6" aria-labelledby={`${title}-heading`}><div className="flex items-center justify-between gap-3 border-b border-navy-100 pb-4"><h2 id={`${title}-heading`} className="font-heading text-lg font-bold text-navy-900">{title}</h2><span className="h-2 w-2 rounded-full bg-teal-600" aria-hidden="true" /></div><div className="mt-4 text-sm leading-relaxed text-navy-600">{children}</div></section>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
}

export default function StudentDashboardPage() {
  const { session, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(learnerDataEnabled);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const busyRef = useRef(false);
  useSEO({ title: 'Student dashboard', description: 'Clinova student dashboard.', noindex: true });

  useEffect(() => {
    const userId = session?.user.id;
    if (!learnerDataEnabled || !userId) {
      setProfileName(null);
      setEnrollments([]);
      setProgress([]);
      setCertificates([]);
      setRecordsLoading(false);
      return;
    }

    let active = true;
    setProfileName(null);
    setEnrollments([]);
    setProgress([]);
    setCertificates([]);
    setRecordsLoading(true);
    setError(null);
    void (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const [profileResult, enrollmentResult, progressResult, certificateResult] = await Promise.all([
          supabase.from('student_profiles').select('full_name').eq('user_id', userId).maybeSingle(),
          supabase.from('student_enrollments').select('id, programme_title, status, enrolled_at').eq('student_id', userId).order('enrolled_at', { ascending: false }),
          supabase.from('student_learning_progress').select('id, enrollment_id, progress_percent, completed_lessons, total_lessons, updated_at').eq('student_id', userId).order('updated_at', { ascending: false }),
          supabase.from('student_certificates').select('id, certificate_number, programme_title, issued_at').eq('student_id', userId).eq('status', 'issued').order('issued_at', { ascending: false }),
        ]);
        const failed = [profileResult, enrollmentResult, progressResult, certificateResult].some(result => result.error);
        if (failed) throw new Error('Learner records are not available.');
        if (!active) return;
        setProfileName(profileResult.data?.full_name ?? null);
        setEnrollments((enrollmentResult.data ?? []) as Enrollment[]);
        setProgress((progressResult.data ?? []) as Progress[]);
        setCertificates((certificateResult.data ?? []) as Certificate[]);
      } catch {
        if (active) setError('Student records are unavailable. The learner database setup may still be pending; no record has been changed.');
      } finally {
        if (active) setRecordsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [session?.user.id, learnerDataEnabled]);

  const handleSignOut = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(null);
    try { const result = await signOut(); if (result.error) setError(result.error.message); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const email = session?.user.email;
  return (
    <section className="min-h-[70vh] bg-surface-50/70 pb-16" aria-labelledby="dashboard-title">
      <div className="bg-navy-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Learner portal</p>
              <h1 id="dashboard-title" className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">Welcome back{profileName ? ', ' + profileName : ''}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">Your learning records, progress and issued certificates in one place.</p>
              {email && <p className="mt-2 text-xs text-white/55">{email}</p>}
            </div>
            <button type="button" onClick={handleSignOut} disabled={busy} className="inline-flex shrink-0 items-center justify-center rounded-md border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Signing out…' : 'Sign out'}</button>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6">
        {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5 -mt-5">
          {[
            { label: 'Enrolments', value: recordsLoading ? '—' : String(enrollments.length), detail: 'Programme records' },
            { label: 'Progress records', value: recordsLoading ? '—' : String(progress.length), detail: 'Tracked learning activity' },
            { label: 'Certificates', value: recordsLoading ? '—' : String(certificates.length), detail: 'Issued records only' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-navy-100 bg-white p-5 shadow-[0_12px_38px_-28px_rgba(8,43,76,0.45)]">
              <p className="text-sm font-medium text-navy-500">{stat.label}</p>
              <p className="mt-2 font-heading text-3xl font-bold tabular-nums text-navy-900">{stat.value}</p>
              <p className="mt-1 text-xs text-navy-500">{stat.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between gap-4">
          <div><h2 className="font-heading text-xl font-bold text-navy-900">Your learning</h2><p className="mt-1 text-sm text-navy-500">Only records available through your authorized account are shown.</p></div>
          {recordsLoading && <span className="text-xs font-medium text-teal-800" role="status">Loading records…</span>}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <EmptySection title="Profile">{recordsLoading ? 'Loading profile…' : profileName ?? 'Profile details are not available yet.'}</EmptySection>
          <EmptySection title="Enrolments">{recordsLoading ? 'Loading enrolments…' : enrollments.length ? <ul className="space-y-3">{enrollments.map(item => <li key={item.id} className="border-b border-navy-100 pb-3 last:border-0 last:pb-0"><p className="font-semibold text-navy-800">{item.programme_title}</p><p className="mt-1 text-sm capitalize text-navy-500">Status: {item.status.replace(/_/g, ' ')}</p><p className="mt-1 text-xs text-navy-400">Added {formatDate(item.enrolled_at)}</p></li>)}</ul> : 'No enrolment information is available yet.'}</EmptySection>
          <EmptySection title="Progress">{recordsLoading ? 'Loading progress…' : progress.length ? <ul className="space-y-4">{progress.map(item => <li key={item.id} className="border-b border-navy-100 pb-4 last:border-0 last:pb-0"><div className="flex justify-between gap-3"><span className="text-sm font-medium text-navy-700">{enrollments.find(enrolment => enrolment.id === item.enrollment_id)?.programme_title ?? 'Programme progress'}</span><span className="text-sm font-bold tabular-nums text-navy-900">{item.progress_percent}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-100"><div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: String(Math.max(0, Math.min(100, item.progress_percent))) + '%' }} /></div><p className="mt-2 text-xs text-navy-500">{item.completed_lessons} of {item.total_lessons} lessons recorded</p></li>)}</ul> : 'Progress information will appear when an authorized record exists.'}</EmptySection>
          <EmptySection title="Certificates">{recordsLoading ? 'Loading certificates…' : certificates.length ? <ul className="space-y-3">{certificates.map(item => <li key={item.id} className="rounded-lg border border-navy-100 bg-surface-50 p-4"><p className="font-semibold text-navy-800">{item.programme_title}</p><p className="mt-1 break-all text-sm text-navy-600">Certificate number: {item.certificate_number}</p><p className="mt-1 text-xs text-navy-500">Issued {formatDate(item.issued_at)}</p></li>)}</ul> : 'No issued certificate records are available.'}</EmptySection>
        </div>
      </div>
    </section>
  );
}
