import { useRef, useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useSEO } from '@/hooks/useSEO';

function EmptySection({ title, children }: { title: string; children: string }) {
  return <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm" aria-labelledby={`${title}-heading`}><h2 id={`${title}-heading`} className="text-xl font-semibold text-navy-900">{title}</h2><p className="mt-3 text-navy-600">{children}</p></section>;
}

export default function StudentDashboardPage() {
  const { session, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  useSEO({ title: 'Student dashboard', description: 'Clinova student dashboard.', noindex: true });
  const handleSignOut = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(null);
    try { const result = await signOut(); if (result.error) setError(result.error.message); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const email = session?.user.email;
  return <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="dashboard-title">
    <header className="flex flex-col gap-5 border-b border-navy-100 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Student area</p><h1 id="dashboard-title" className="mt-2 text-3xl font-bold text-navy-900">Welcome{email ? `, ${email}` : ''}</h1><p className="mt-2 text-navy-600">Your account is signed in. Student records will appear here when they are available.</p></div><button type="button" onClick={handleSignOut} disabled={busy} className="rounded-lg border border-teal-600 px-4 py-2 font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-60">{busy ? 'Signing out…' : 'Sign out'}</button></header>
    {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
    <div className="mt-8 grid gap-6 md:grid-cols-2"><EmptySection title="Profile">Profile details are not available yet.</EmptySection><EmptySection title="Enrolment">No enrolment information is available yet.</EmptySection><EmptySection title="Progress">Progress information will appear when it is available.</EmptySection><EmptySection title="Certificates">No certificate information is available yet.</EmptySection></div>
  </section>;
}
