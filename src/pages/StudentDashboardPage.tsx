import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, BadgeCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/auth/authContext';
import { useSEO } from '@/hooks/useSEO';

const portalAreas = [
  { title: 'CPD enrollment and learning', detail: 'Course enrollment, learning progress, quizzes and CPD history are not connected.', to: '/cpd-courses', action: 'CPD system status', icon: BookOpenCheck },
  { title: 'CPD completion credentials', detail: 'No CPD completion record or certificate is available in this build.', to: '/verify', action: 'Verification status', icon: BadgeCheck },
  { title: 'Professional certification', detail: 'Candidate applications, eligibility, competence assessments and independent decisions are unavailable.', to: '/certification', action: 'Certification status', icon: BadgeCheck },
  { title: 'Examination and OSCE', detail: 'No exam schedule, assessment evidence, result or feedback record is queried.', to: '/assessment', action: 'Assessment status', icon: ShieldAlert },
];

export default function StudentDashboardPage() {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useSEO({ title: 'Candidate and learner dashboard', description: 'Clinova learner and candidate portal availability.', noindex: true });
  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await auth.signOut();
      if (result.error) setError(result.error.message);
    } finally {
      setBusy(false);
    }
  };

  return <section className="min-h-[70vh] bg-surface-50/70 pb-16" aria-labelledby="dashboard-title">
    <div className="bg-navy-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Candidate and learner portal</p><h1 id="dashboard-title" className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">Account services are not connected</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">CPD learning and professional certification are distinct. No learner or candidate records were requested for this page.</p>{auth.session?.user.email && <p className="mt-2 text-xs text-white/55">Signed in as {auth.session.user.email}</p>}</div>
          {auth.session && <button type="button" onClick={() => void signOut()} disabled={busy} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60">{busy ? 'Signing out…' : 'Sign out'}</button>}
        </div>
      </div>
    </div>
    <div className="mx-auto max-w-6xl px-6">
      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}
      <div className="-mt-5 grid gap-5 sm:grid-cols-2">
        {portalAreas.map((area) => {
          const Icon = area.icon;
          return <article key={area.title} className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <Icon className="h-6 w-6 text-clinical-700" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-xl font-bold text-navy-900">{area.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">{area.detail}</p>
            <Link to={area.to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">{area.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>;
        })}
      </div>
      <p className="mt-7 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-navy-700" role="status">Authentication, candidate data, course enrollment, examination, credential downloads and renewal reminders are disabled. Public sign-up does not grant candidate, assessor, decision-maker or administrator permissions.</p>
    </div>
  </section>;
}
