import { Link, useLocation } from 'react-router-dom';
import { LockKeyhole, ShieldAlert } from 'lucide-react';
import { useOptionalAuth } from '@/auth/authContext';
import { hasCertificationRole, type CertificationRole } from '@/lib/certificationDecision';
import { safeReturnTarget } from '@/auth/authUtils';
import { useSEO } from '@/hooks/useSEO';

type WorkspaceKind = 'candidate' | 'assessor' | 'decision-maker';
const workspaceConfig: Record<WorkspaceKind, { title: string; role: CertificationRole; description: string }> = {
  candidate: { title: 'Candidate portal', role: 'certification_candidate', description: 'Candidate registration, eligibility and records are not connected.' },
  assessor: { title: 'Assessor workspace', role: 'certification_assessor', description: 'Assessment assignments and evidence records are not connected.' },
  'decision-maker': { title: 'Certification decision panel', role: 'certification_decision_maker', description: 'No certification decisions can be viewed or recorded in this build.' },
};

export default function CertificationWorkspacePage({ kind }: { kind: WorkspaceKind }) {
  const auth = useOptionalAuth();
  const location = useLocation();
  const config = workspaceConfig[kind];
  const returnTo = safeReturnTarget(`${location.pathname}${location.search}`);
  useSEO({ title: config.title, description: config.description, noindex: true });

  if (!auth || !auth.enabled) {
    return <WorkspaceNotice title={`${config.title} unavailable`} message="Authentication and the certification service are disabled in this build. No records were requested or changed." />;
  }
  if (auth.status === 'loading') {
    return <WorkspaceNotice title="Checking access" message="Please wait while the sign-in state is checked." />;
  }
  if (auth.status === 'error') {
    return <WorkspaceNotice title="Access check unavailable" message={auth.error ?? 'Your sign-in could not be checked. No records were requested.'} />;
  }
  if (!auth.session) {
    return <section className="mx-auto max-w-3xl px-6 py-20" aria-labelledby="workspace-title">
      <h1 id="workspace-title" className="font-heading text-3xl font-bold text-navy-900">Sign-in required</h1>
      <p className="mt-4 leading-relaxed text-navy-600">{config.title} requires a verified account and a separately assigned, server-managed certification role.</p>
      <Link to={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="mt-6 inline-flex min-h-11 items-center rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700">Continue to sign in</Link>
    </section>;
  }
  if (!auth.emailVerified || !auth.session.user.email_confirmed_at) {
    return <WorkspaceNotice title="Verified email required" message="Confirm the account email before requesting access. No certification records were queried." />;
  }
  if (!hasCertificationRole(auth.session.user, config.role)) {
    return <WorkspaceNotice title="Role access not assigned" message="This account does not have the required trusted Clinova certification role. Public sign-up cannot grant certification permissions." />;
  }

  return <section className="mx-auto max-w-4xl px-6 py-14 lg:py-20" aria-labelledby="workspace-title">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Restricted workspace · local shell only</p>
    <h1 id="workspace-title" className="mt-3 font-heading text-3xl font-bold text-navy-900">{config.title}</h1>
    <div className="mt-6 border border-amber-300 bg-amber-50 p-6" role="status">
      <p className="font-semibold text-navy-900">Certification services are not connected</p>
      <p className="mt-2 text-sm leading-relaxed text-navy-700">{config.description} The workspace makes no database request, stores no candidate information and provides no assessment or certification action.</p>
    </div>
    {kind === 'decision-maker' && <div className="mt-6 rounded-xl border border-navy-100 bg-white p-6">
      <h2 className="font-heading text-xl font-bold text-navy-900">Independent decision gates</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-navy-700">
        <li>An approved scheme and versioned decision policy must exist.</li>
        <li>Eligibility and assessment evidence must be independently recorded.</li>
        <li>The decision-maker must differ from the candidate and assessor.</li>
        <li>Conflicts of interest must be disclosed and reviewed by a separate impartiality role.</li>
        <li>A certification decision does not automatically issue a certificate.</li>
      </ul>
    </div>}
    <Link to="/certification/policies" className="mt-7 inline-flex items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4">View draft policy areas</Link>
  </section>;
}

function WorkspaceNotice({ title, message }: { title: string; message: string }) {
  return <section className="mx-auto max-w-3xl px-6 py-20" aria-labelledby="workspace-title">
    <div className="flex items-start gap-4 rounded-xl border border-navy-200 bg-surface-50 p-6">
      <LockKeyhole className="mt-1 h-6 w-6 shrink-0 text-clinical-700" aria-hidden="true" />
      <div>
        <h1 id="workspace-title" className="font-heading text-2xl font-bold text-navy-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-navy-700">{message}</p>
        <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-navy-500"><ShieldAlert className="h-4 w-4" aria-hidden="true" />No private records were queried.</p>
      </div>
    </div>
    <Link to="/certification" className="mt-6 inline-flex font-semibold text-clinical-700 underline underline-offset-4">Return to certification information</Link>
  </section>;
}
