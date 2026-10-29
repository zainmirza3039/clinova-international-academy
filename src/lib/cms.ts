export const cmsRoles = [
  'content_author',
  'clinical_reviewer',
  'editorial_reviewer',
  'content_publisher',
  'content_admin',
] as const;

export type CmsRole = typeof cmsRoles[number];
export type CmsContentKind = 'programme' | 'cpd_course' | 'article';
export type CmsWorkflowStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived' | 'withdrawn' | 'changes_requested' | 'rejected' | 'superseded';
export type CmsReviewType = 'clinical' | 'editorial' | 'release';
export type CmsReviewDecision = 'approved' | 'changes_requested' | 'rejected';

export interface CmsUser {
  id?: string;
  app_metadata?: Record<string, unknown>;
}

export interface CmsPublishedContent {
  content_item_id: string;
  content_version_id: string;
  kind: CmsContentKind;
  version_number: number;
  snapshot: Record<string, unknown>;
  content_sha256: string;
  published_at: string;
}

export interface CmsWorkflowVersion {
  id: string;
  content_item_id: string;
  kind: CmsContentKind;
  version_number: number;
  snapshot: Record<string, unknown>;
  content_sha256: string;
  workflow_status: CmsWorkflowStatus;
  author_id: string;
  created_at: string;
}

interface CmsQueryResult {
  data: unknown[] | null;
  error: unknown | null;
}

interface CmsSelectQuery extends PromiseLike<CmsQueryResult> {
  order(column: string, options: { ascending: boolean }): CmsSelectQuery;
  limit(count: number): CmsSelectQuery;
}

export interface CmsClient {
  from(table: string): { select(columns: string): CmsSelectQuery };
  rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown | null }>;
}

export type CmsAction =
  | { name: 'create_content_item'; args: { p_kind: CmsContentKind; p_snapshot: Record<string, unknown> } }
  | { name: 'create_content_version'; args: { p_item_id: string; p_snapshot: Record<string, unknown> } }
  | { name: 'submit_content_for_review'; args: { p_version_id: string } }
  | { name: 'record_content_review'; args: { p_version_id: string; p_review_type: CmsReviewType; p_decision: CmsReviewDecision; p_evidence_refs: unknown[]; p_rationale: string } }
  | { name: 'publish_content_version'; args: { p_version_id: string } }
  | { name: 'archive_content_version'; args: { p_version_id: string; p_reason: string } }
  | { name: 'withdraw_content_version'; args: { p_version_id: string; p_reason: string } };

const contentKinds: CmsContentKind[] = ['programme', 'cpd_course', 'article'];
const workflowStatuses: CmsWorkflowStatus[] = ['draft', 'in_review', 'approved', 'published', 'archived', 'withdrawn', 'changes_requested', 'rejected', 'superseded'];
const cmsRoleSet = new Set<string>(cmsRoles);
const expectedSupabaseUrl = 'https://ssxpmcbqfdggfsoqbxac.supabase.co';

/** CMS access is opt-in and tied to the known Supabase project; unset/invalid flags stay off. */
export function cmsFeatureEnabled(): boolean {
  return import.meta.env.VITE_CMS_ENABLED === 'true'
    && import.meta.env.VITE_SUPABASE_URL === expectedSupabaseUrl
    && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function getCmsRoles(user: CmsUser | null | undefined): CmsRole[] {
  const claim = user?.app_metadata?.clinova_roles;
  if (!Array.isArray(claim)) return [];
  return claim.filter((role): role is CmsRole => typeof role === 'string' && cmsRoleSet.has(role));
}

export function hasAnyCmsRole(user: CmsUser | null | undefined, required: readonly CmsRole[] = cmsRoles): boolean {
  const actual = new Set(getCmsRoles(user));
  return required.some(role => actual.has(role));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isContentKind(value: unknown): value is CmsContentKind {
  return typeof value === 'string' && contentKinds.includes(value as CmsContentKind);
}

function validSnapshot(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  if (typeof value.title !== 'string' || value.title.trim().length < 1 || value.title.trim().length > 200) return false;
  if (typeof value.slug !== 'string' || value.slug.length < 1 || value.slug.length > 160 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) return false;
  return !Object.prototype.hasOwnProperty.call(value, 'status') && !Object.prototype.hasOwnProperty.call(value, 'publicationStatus');
}

function parsePublishedContent(value: unknown): CmsPublishedContent | null {
  if (!isRecord(value) || !isContentKind(value.kind) || !validSnapshot(value.snapshot)) return null;
  if (typeof value.content_item_id !== 'string' || typeof value.content_version_id !== 'string') return null;
  if (!Number.isInteger(value.version_number) || typeof value.version_number !== 'number' || value.version_number < 1) return null;
  if (typeof value.content_sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(value.content_sha256)) return null;
  if (typeof value.published_at !== 'string' || Number.isNaN(Date.parse(value.published_at))) return null;
  return {
    content_item_id: value.content_item_id,
    content_version_id: value.content_version_id,
    kind: value.kind,
    version_number: value.version_number,
    snapshot: value.snapshot,
    content_sha256: value.content_sha256,
    published_at: value.published_at,
  };
}

function parseWorkflowVersion(value: unknown): CmsWorkflowVersion | null {
  if (!isRecord(value) || !isContentKind(value.kind) || !validSnapshot(value.snapshot)) return null;
  if (typeof value.id !== 'string' || typeof value.content_item_id !== 'string' || typeof value.author_id !== 'string') return null;
  if (!Number.isInteger(value.version_number) || typeof value.version_number !== 'number' || value.version_number < 1) return null;
  if (typeof value.content_sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(value.content_sha256)) return null;
  if (typeof value.workflow_status !== 'string' || !workflowStatuses.includes(value.workflow_status as CmsWorkflowStatus)) return null;
  if (typeof value.created_at !== 'string' || Number.isNaN(Date.parse(value.created_at))) return null;
  return {
    id: value.id,
    content_item_id: value.content_item_id,
    kind: value.kind,
    version_number: value.version_number,
    snapshot: value.snapshot,
    content_sha256: value.content_sha256,
    workflow_status: value.workflow_status as CmsWorkflowStatus,
    author_id: value.author_id,
    created_at: value.created_at,
  };
}

async function resolveClient(client?: CmsClient): Promise<CmsClient> {
  if (client) return client;
  const { supabase } = await import('@/lib/supabase');
  return supabase as unknown as CmsClient;
}

/** Reads only public, approved CMS records. Empty/error results leave repository content untouched. */
export async function fetchPublishedCmsContent(client?: CmsClient): Promise<CmsPublishedContent[]> {
  if (!cmsFeatureEnabled()) return [];
  const activeClient = await resolveClient(client);
  const { data, error } = await activeClient
    .from('published_content')
    .select('content_item_id, content_version_id, kind, version_number, snapshot, content_sha256, published_at')
    .order('published_at', { ascending: false })
    .limit(100);
  if (error) throw new Error('Published CMS content is unavailable.');
  return (data ?? []).map(parsePublishedContent).filter((row): row is CmsPublishedContent => row !== null);
}

/** Unpublished workflow records are queried only with the exact server-managed CMS role claim. */
export async function fetchCmsWorkflowVersions(user: CmsUser | null, client?: CmsClient): Promise<CmsWorkflowVersion[]> {
  if (!cmsFeatureEnabled()) throw new Error('Content management is disabled.');
  if (!user || !hasAnyCmsRole(user)) throw new Error('A trusted Clinova CMS role is required.');
  const activeClient = await resolveClient(client);
  const { data, error } = await activeClient
    .from('content_versions')
    .select('id, content_item_id, kind, version_number, snapshot, content_sha256, workflow_status, author_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error('CMS workflow records are unavailable.');
  return (data ?? []).map(parseWorkflowVersion).filter((row): row is CmsWorkflowVersion => row !== null);
}

function rolesForAction(action: CmsAction): CmsRole[] {
  if (action.name === 'create_content_item' || action.name === 'create_content_version' || action.name === 'submit_content_for_review') {
    return ['content_author', 'content_admin'];
  }
  if (action.name === 'record_content_review') {
    if (action.args.p_review_type === 'clinical') return ['clinical_reviewer'];
    if (action.args.p_review_type === 'editorial') return ['editorial_reviewer'];
    return action.args.p_decision === 'approved' ? ['content_publisher'] : [];
  }
  if (action.name === 'publish_content_version' || action.name === 'archive_content_version') return ['content_publisher'];
  return ['content_publisher', 'content_admin'];
}

/** Every CMS RPC is gated by the opt-in flag and the matching app_metadata.clinova_roles claim. */
export async function invokeCmsAction(user: CmsUser | null, action: CmsAction, client?: CmsClient): Promise<unknown> {
  if (!cmsFeatureEnabled()) throw new Error('Content management is disabled.');
  const allowedRoles = rolesForAction(action);
  if (!user || allowedRoles.length === 0 || !hasAnyCmsRole(user, allowedRoles)) {
    throw new Error('This account is not authorized for that CMS action.');
  }
  const activeClient = await resolveClient(client);
  const { data, error } = await activeClient.rpc(action.name, action.args as Record<string, unknown>);
  if (error) throw new Error('The CMS rejected this transition. Check the workflow state, evidence, and role separation.');
  return data;
}
