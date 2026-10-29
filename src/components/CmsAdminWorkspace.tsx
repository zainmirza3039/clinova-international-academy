import { useEffect, useState } from 'react';
import {
  cmsFeatureEnabled,
  fetchCmsWorkflowVersions,
  getCmsRoles,
  hasAnyCmsRole,
  invokeCmsAction,
  type CmsAction,
  type CmsContentKind,
  type CmsReviewDecision,
  type CmsReviewType,
  type CmsUser,
  type CmsWorkflowVersion,
} from '@/lib/cms';

const createRoles = ['content_author', 'content_admin'] as const;

function CmsReviewForm({ version, reviewType, onSubmit, disabled }: {
  version: CmsWorkflowVersion;
  reviewType: CmsReviewType;
  onSubmit: (action: CmsAction) => Promise<void>;
  disabled: boolean;
}) {
  const [evidence, setEvidence] = useState('');
  const [rationale, setRationale] = useState('');
  const [decision, setDecision] = useState<CmsReviewDecision>('approved');
  const evidenceRefs = evidence.split('\n').map(item => item.trim()).filter(Boolean);
  const ready = evidenceRefs.length > 0 && evidenceRefs.length <= 50 && rationale.trim().length >= 10 && rationale.trim().length <= 4000;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || disabled) return;
    void onSubmit({
      name: 'record_content_review',
      args: {
        p_version_id: version.id,
        p_review_type: reviewType,
        p_decision: reviewType === 'release' ? 'approved' : decision,
        p_evidence_refs: evidenceRefs,
        p_rationale: rationale.trim(),
      },
    });
  }

  return <form onSubmit={submit} className="mt-4 rounded-lg border border-navy-100 bg-surface-50 p-4">
    <h4 className="font-semibold text-navy-900">{reviewType === 'release' ? 'Release approval' : `${reviewType === 'clinical' ? 'Clinical' : 'Editorial'} review`}</h4>
    <label className="mt-3 block text-sm font-medium text-navy-700">Evidence references (one per line)
      <textarea required rows={2} maxLength={4000} value={evidence} onChange={event => setEvidence(event.target.value)} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm" placeholder="Add the actual evidence or review reference" />
    </label>
    <label className="mt-3 block text-sm font-medium text-navy-700">Rationale
      <textarea required minLength={10} maxLength={4000} rows={3} value={rationale} onChange={event => setRationale(event.target.value)} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm" />
    </label>
    {reviewType !== 'release' && <label className="mt-3 block text-sm font-medium text-navy-700">Decision
      <select value={decision} onChange={event => setDecision(event.target.value as CmsReviewDecision)} className="mt-1 w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm">
        <option value="approved">Approve this exact version</option>
        <option value="changes_requested">Request changes</option>
        <option value="rejected">Reject this version</option>
      </select>
    </label>}
    <button type="submit" disabled={!ready || disabled} className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Record {reviewType} decision</button>
  </form>;
}

function CreateDraftForm({ user, onCreated, disabled }: { user: CmsUser; onCreated: (action: CmsAction) => Promise<void>; disabled: boolean }) {
  const [kind, setKind] = useState<CmsContentKind>('article');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  if (!hasAnyCmsRole(user, createRoles)) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || disabled) return;
    void onCreated({ name: 'create_content_item', args: { p_kind: kind, p_snapshot: { title: title.trim(), slug, description: description.trim() } } });
    setTitle('');
    setSlug('');
    setDescription('');
  }

  return <form onSubmit={submit} className="mt-5 rounded-xl border border-navy-100 bg-white p-5">
    <h3 className="text-lg font-semibold text-navy-900">Create a draft</h3>
    <p className="mt-1 text-sm text-navy-600">This creates a draft only. It does not import repository records or publish content.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-navy-700">Content type
        <select value={kind} onChange={event => setKind(event.target.value as CmsContentKind)} className="mt-1 w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5">
          <option value="article">Educational article</option><option value="programme">Learning guide</option><option value="cpd_course">Self-study course</option>
        </select>
      </label>
      <label className="text-sm font-medium text-navy-700">Title
        <input required maxLength={200} value={title} onChange={event => setTitle(event.target.value)} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5" />
      </label>
      <label className="text-sm font-medium text-navy-700">URL slug
        <input required maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={event => setSlug(event.target.value)} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5" placeholder="example-learning-guide" />
      </label>
      <label className="text-sm font-medium text-navy-700 sm:col-span-2">Short description
        <textarea maxLength={4000} rows={3} value={description} onChange={event => setDescription(event.target.value)} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5" />
      </label>
    </div>
    <button type="submit" disabled={disabled || !title.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)} className="mt-4 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Save draft</button>
  </form>;
}

function VersionCard({ version, user, roles, onTransition, disabled }: {
  version: CmsWorkflowVersion;
  user: CmsUser;
  roles: ReturnType<typeof getCmsRoles>;
  onTransition: (action: CmsAction) => Promise<void>;
  disabled: boolean;
}) {
  const [reason, setReason] = useState('');
  const title = typeof version.snapshot.title === 'string' ? version.snapshot.title : 'Untitled content';
  const canAuthor = hasAnyCmsRole(user, createRoles);
  const maySubmit = version.workflow_status === 'draft' && canAuthor
    && (version.author_id === user.id || roles.includes('content_admin'));
  const canPublish = roles.includes('content_publisher');
  const canArchive = version.workflow_status === 'published' && canPublish;
  const canWithdraw = !['archived', 'withdrawn', 'rejected', 'changes_requested', 'superseded'].includes(version.workflow_status)
    && hasAnyCmsRole(user, ['content_publisher', 'content_admin']);

  return <article className="rounded-xl border border-navy-100 bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{version.kind.replace('_', ' ')} · v{version.version_number}</p><h4 className="mt-1 text-lg font-semibold text-navy-900">{title}</h4><p className="mt-1 text-xs text-navy-500">Version hash: <code>{version.content_sha256.slice(0, 12)}…</code></p></div>
      <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-700">{version.workflow_status.replace('_', ' ')}</span>
    </div>
    {maySubmit && <button type="button" disabled={disabled} onClick={() => void onTransition({ name: 'submit_content_for_review', args: { p_version_id: version.id } })} className="mt-4 rounded-lg border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-800 disabled:opacity-50">Submit draft for review</button>}
    {version.workflow_status === 'in_review' && roles.includes('clinical_reviewer') && <CmsReviewForm version={version} reviewType="clinical" onSubmit={onTransition} disabled={disabled} />}
    {version.workflow_status === 'in_review' && roles.includes('editorial_reviewer') && <CmsReviewForm version={version} reviewType="editorial" onSubmit={onTransition} disabled={disabled} />}
    {version.workflow_status === 'approved' && canPublish && <>
      <CmsReviewForm version={version} reviewType="release" onSubmit={onTransition} disabled={disabled} />
      <button type="button" disabled={disabled} onClick={() => void onTransition({ name: 'publish_content_version', args: { p_version_id: version.id } })} className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Publish after server-side approval checks</button>
    </>}
    {(canArchive || canWithdraw) && <div className="mt-4 border-t border-navy-100 pt-4">
      <label className="block text-sm font-medium text-navy-700">{canArchive ? 'Archive or withdrawal reason' : 'Withdrawal reason'}
        <textarea rows={2} maxLength={2000} minLength={10} value={reason} onChange={event => setReason(event.target.value)} className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm" />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {canArchive && <button type="button" disabled={disabled || reason.trim().length < 10} onClick={() => void onTransition({ name: 'archive_content_version', args: { p_version_id: version.id, p_reason: reason.trim() } })} className="rounded-lg border border-amber-700 px-3 py-2 text-sm font-semibold text-amber-800 disabled:opacity-50">Archive published version</button>}
        {canWithdraw && <button type="button" disabled={disabled || reason.trim().length < 10} onClick={() => void onTransition({ name: 'withdraw_content_version', args: { p_version_id: version.id, p_reason: reason.trim() } })} className="rounded-lg border border-red-700 px-3 py-2 text-sm font-semibold text-red-800 disabled:opacity-50">Withdraw version</button>}
      </div>
    </div>}
  </article>;
}

export default function CmsAdminWorkspace({ user }: { user: CmsUser }) {
  const enabled = cmsFeatureEnabled();
  const roles = getCmsRoles(user);
  const rolesKey = roles.join(',');
  const authorized = hasAnyCmsRole(user);
  const [versions, setVersions] = useState<CmsWorkflowVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !authorized) return;
    let active = true;
    setLoading(true);
    void fetchCmsWorkflowVersions(user).then(records => {
      if (active) setVersions(records);
    }).catch(() => {
      if (active) setError('CMS workflow records are unavailable; no action was taken.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [enabled, authorized, rolesKey, user]);

  async function transition(action: CmsAction) {
    if (!enabled || !authorized || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await invokeCmsAction(user, action);
      const next = await fetchCmsWorkflowVersions(user);
      setVersions(next);
      setNotice('The server accepted the requested CMS transition.');
    } catch {
      setError('The CMS rejected the transition or could not refresh workflow state. Check the trusted role, exact version, evidence and release prerequisites.');
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) return <section aria-labelledby="cms-workspace-title" className="mt-8 rounded-xl border border-navy-200 bg-surface-50 p-5">
    <h3 id="cms-workspace-title" className="text-lg font-semibold text-navy-900">CMS workflow</h3>
    <p className="mt-2 text-sm leading-relaxed text-navy-700" role="status">CMS access is off by default. The published-view frontend and admin RPC integrations are present locally, but remain inactive while <code>VITE_CMS_ENABLED</code> is not explicitly enabled for the approved project.</p>
  </section>;

  if (!authorized) return <section aria-labelledby="cms-workspace-title" className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
    <h3 id="cms-workspace-title" className="text-lg font-semibold text-navy-900">CMS workflow access denied</h3>
    <p className="mt-2 text-sm leading-relaxed text-navy-700" role="status">This account has no recognized server-managed <code>app_metadata.clinova_roles</code> claim. The separate admin role is not translated or treated as a CMS role; no CMS records were requested.</p>
  </section>;

  return <section aria-labelledby="cms-workspace-title" className="mt-8">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 id="cms-workspace-title" className="text-xl font-bold text-navy-900">CMS workflow</h3><p className="mt-1 text-sm text-navy-600">Draft, review and publication actions call the server-checked CMS RPCs. Review evidence is required for each decision.</p></div><button type="button" disabled={loading || busy} onClick={() => {
      setLoading(true);
      void fetchCmsWorkflowVersions(user).then(setVersions).catch(() => setError('CMS workflow records are unavailable.')).finally(() => setLoading(false));
    }} className="rounded-lg border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-800 disabled:opacity-50">Refresh CMS</button></div>
    {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
    {notice && <p className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900" role="status">{notice}</p>}
    {loading && <p className="mt-4 text-sm text-navy-600" role="status">Loading authorized content workflow records…</p>}
    <CreateDraftForm user={user} onCreated={transition} disabled={busy || loading} />
    {!loading && versions.length === 0 && <p className="mt-5 rounded-lg border border-dashed border-navy-200 p-5 text-sm text-navy-600" role="status">No CMS versions are available. The production CMS currently contains no content rows; no source records are imported automatically.</p>}
    <div className="mt-5 space-y-4">{versions.map(version => <VersionCard key={version.id} version={version} user={user} roles={roles} onTransition={transition} disabled={busy || loading} />)}</div>
    <p className="mt-5 text-xs leading-relaxed text-navy-500">The database remains authoritative for role checks, evidence validation, independent review, allowed transitions and publication prerequisites. No certificate operation is exposed here.</p>
  </section>;
}
