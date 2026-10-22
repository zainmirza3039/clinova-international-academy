import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useSEO } from '@/hooks/useSEO';
import { learnerDataEnabled } from '@/lib/siteConfig';

type Enrollment = { id: string; programme_title: string; status: string; enrolled_at: string };
type Progress = { id: string; enrollment_id: string; progress_percent: number; completed_lessons: number; total_lessons: number; updated_at: string };
type Certificate = { id: string; certificate_number: string; programme_title: string; issued_at: string };

function EmptySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm" aria-labelledby={`${title}-heading`}><h2 id={`${title}-heading`} className="text-xl font-semibold text-navy-900">{title}</h2><div className="mt-3 text-navy-600">{children}</div></section>;
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
  return <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="dashboard-title">
    <header className="flex flex-col gap-5 border-b border-navy-100 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Student area</p><h1 id="dashboard-title" className="mt-2 text-3xl font-bold text-navy-900">Welcome{email ? `, ${email}` : ''}</h1><p className="mt-2 text-navy-600">Your account is signed in. This dashboard displays only records allowed by the learner database policies.</p></div><button type="button" onClick={handleSignOut} disabled={busy} className="rounded-lg border border-teal-600 px-4 py-2 font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-60">{busy ? 'Signing out…' : 'Sign out'}</button></header>
    {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <EmptySection title="Profile">{recordsLoading ? 'Loading profile…' : profileName ?? 'Profile details are not available yet.'}</EmptySection>
      <EmptySection title="Enrolment">{recordsLoading ? 'Loading enrolments…' : enrollments.length ? <ul className="space-y-3">{enrollments.map(item => <li key={item.id} className="border-b border-navy-100 pb-3 last:border-0"><p className="font-semibold text-navy-800">{item.programme_title}</p><p className="mt-1 text-sm capitalize text-navy-500">Status: {item.status.replace(/_/g, ' ')}</p><p className="text-xs text-navy-400">Added {formatDate(item.enrolled_at)}</p></li>)}</ul> : 'No enrolment information is available yet.'}</EmptySection>
      <EmptySection title="Progress">{recordsLoading ? 'Loading progress…' : progress.length ? <ul className="space-y-3">{progress.map(item => <li key={item.id} className="border-b border-navy-100 pb-3 last:border-0"><div className="flex justify-between gap-3"><span className="text-sm text-navy-700">{enrollments.find(enrolment => enrolment.id === item.enrollment_id)?.programme_title ?? 'Programme progress'}</span><span className="text-sm font-semibold text-navy-800">{item.progress_percent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${item.progress_percent}%` }} /></div><p className="mt-1 text-xs text-navy-400">{item.completed_lessons} of {item.total_lessons} lessons recorded</p></li>)}</ul> : 'Progress information will appear when an authorized record exists.'}</EmptySection>
      <EmptySection title="Certificates">{recordsLoading ? 'Loading certificates…' : certificates.length ? <ul className="space-y-3">{certificates.map(item => <li key={item.id} className="border-b border-navy-100 pb-3 last:border-0"><p className="font-semibold text-navy-800">{item.programme_title}</p><p className="mt-1 text-sm text-navy-600">Certificate number: {item.certificate_number}</p><p className="text-xs text-navy-400">Issued {formatDate(item.issued_at)}</p></li>)}</ul> : 'No issued certificate records are available.'}</EmptySection>
    </div>
  </section>;
}
