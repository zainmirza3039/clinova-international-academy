import { useMemo, useRef, useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useSEO } from '@/hooks/useSEO';
import { createLearnerApi } from '@/learner/learnerApi';
import LearnerWorkspace from '@/learner/LearnerWorkspace';

export default function StudentDashboardPage() {
  const { session, signOut, client, enabled, status, recovery } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const learnerEnabled = import.meta.env.VITE_LEARNER_DATA_ENABLED === 'true';
  const ready = learnerEnabled && enabled && status === 'ready' && !recovery && Boolean(session?.user.id) && Boolean(client);
  const userId = session?.user.id ?? null;
  const api = useMemo(() => createLearnerApi(client ?? null, ready, userId), [client, ready, userId]);
  useSEO({ title: 'Student dashboard', description: 'Clinova student dashboard.', noindex: true });
  const handleSignOut = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(null);
    try {
      const result = await signOut();
      if (result.error) setError('Sign out could not be confirmed. Please try again.');
    } catch { setError('Sign out could not be confirmed. Please try again.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  return <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="dashboard-title">
    <header className="flex flex-col gap-5 border-b border-navy-100 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Student area</p><h1 id="dashboard-title" className="mt-2 text-3xl font-bold text-navy-900">Student dashboard</h1><p className="mt-2 text-navy-600">Read your own available learner records. No enrolment, assessment, certificate or account-deletion service is provided here.</p></div>{session && <button type="button" onClick={handleSignOut} disabled={busy} className="rounded-lg border border-teal-600 px-4 py-2 font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-60">{busy ? 'Signing out…' : 'Sign out'}</button>}</header>
    {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
    {ready ? <LearnerWorkspace key={userId} api={api} /> : <div className="mt-8 rounded-xl border border-navy-100 p-5" role="status"><h2 className="text-xl font-semibold">Learner records unavailable</h2><p className="mt-3">Learner data access is off until the backend contract, hosted authorization, callbacks and retention policy are approved. This does not mean that your enrolments or progress are zero.</p></div>}
  </section>;
}
