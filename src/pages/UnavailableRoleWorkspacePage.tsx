import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

type WorkspaceRole = 'Instructor' | 'Institution';

const returnLinks: Record<WorkspaceRole, { to: string; label: string }> = {
  Instructor: { to: '/become-an-instructor', label: 'Instructor information' },
  Institution: { to: '/training-partners', label: 'Partnership information' },
};

export default function UnavailableRoleWorkspacePage({ role }: { role: WorkspaceRole }) {
  useSEO({
    title: `${role} workspace unavailable`,
    description: `${role} workspace access is not available.`,
    noindex: true,
  });

  return (
    <section className="mx-auto max-w-3xl px-6 py-20" role="status" aria-labelledby="workspace-unavailable-title">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Restricted workspace</p>
      <h1 id="workspace-unavailable-title" className="mt-3 font-heading text-3xl font-bold text-navy-900">{role} dashboard unavailable</h1>
      <p className="mt-4 leading-relaxed text-navy-700">
        Secure sign-in, server-side role authorization and hosted permission tests are not verified for this workspace. No private records were requested or changed, and this page provides no dashboard controls.
      </p>
      <p className="mt-3 leading-relaxed text-navy-700">
        Do not use this route to submit student, placement, credential, attendance or assessment information.
      </p>
      <Link to={returnLinks[role].to} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
        {returnLinks[role].label}
      </Link>
    </section>
  );
}
