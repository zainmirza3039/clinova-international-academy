import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { educationalArticles } from '@/data/educationalArticles';
import {
  cmsFeatureEnabled,
  fetchCmsWorkflowVersions,
  fetchPublishedCmsContent,
  invokeCmsAction,
  type CmsClient,
} from '@/lib/cms';

const doubles = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from: doubles.from, rpc: doubles.rpc } }));
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));

const expectedProject = 'https://ssxpmcbqfdggfsoqbxac.supabase.co';
const digest = 'a'.repeat(64);
const publishedRow = {
  content_item_id: 'item-cms-1',
  content_version_id: 'version-cms-1',
  kind: 'article',
  version_number: 1,
  snapshot: { title: 'CMS approved article', slug: 'cms-approved-article', description: 'A server-approved public article.' },
  content_sha256: digest,
  published_at: '2026-10-29T18:00:00.000Z',
};
const client: CmsClient = {
  from: doubles.from as unknown as CmsClient['from'],
  rpc: doubles.rpc as unknown as CmsClient['rpc'],
};

function enableCms() {
  vi.stubEnv('VITE_CMS_ENABLED', 'true');
  vi.stubEnv('VITE_SUPABASE_URL', expectedProject);
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-publishable-key');
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  document.head.innerHTML = '';
});

describe('Clinova CMS integration gates', () => {
  it('keeps CMS off by default and preserves repository-backed public content without querying Supabase', async () => {
    vi.stubEnv('VITE_CMS_ENABLED', 'false');
    vi.stubEnv('VITE_SUPABASE_URL', expectedProject);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-publishable-key');

    expect(cmsFeatureEnabled()).toBe(false);
    expect(await fetchPublishedCmsContent(client)).toEqual([]);
    render(<MemoryRouter><ResourcesPage /></MemoryRouter>);
    expect(await screen.findByText(/Showing 15 educational articles/)).toBeTruthy();
    expect(screen.getByRole('link', { name: new RegExp(educationalArticles[0].title) })).toBeTruthy();
    expect(doubles.from).not.toHaveBeenCalled();
    expect(doubles.rpc).not.toHaveBeenCalled();
  });

  it('renders valid CMS rows returned by published_content without replacing repository articles', async () => {
    enableCms();
    const limit = vi.fn().mockResolvedValue({ data: [publishedRow], error: null });
    const order = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ order }));
    doubles.from.mockImplementation((table: string) => {
      expect(table).toBe('published_content');
      return { select };
    });

    expect(cmsFeatureEnabled()).toBe(true);
    expect(await fetchPublishedCmsContent(client)).toHaveLength(1);
    render(<MemoryRouter><ResourcesPage /></MemoryRouter>);

    const cmsLink = await screen.findByRole('link', { name: /Open published content/ });
    expect(cmsLink.getAttribute('href')).toBe('/cms/article/cms-approved-article');
    expect(screen.getByText('CMS approved article')).toBeTruthy();
    expect(screen.getByText('A server-approved public article.')).toBeTruthy();
    expect(screen.getByText(/Showing 15 educational articles/)).toBeTruthy();
    expect(doubles.from).toHaveBeenCalledWith('published_content');
    expect(select).toHaveBeenCalledWith('content_item_id, content_version_id, kind, version_number, snapshot, content_sha256, published_at');
  });

  it('fails closed when the legacy admin claim is present but clinova_roles is missing or mismatched', async () => {
    enableCms();
    const legacyAdminOnly = { id: 'user-admin', app_metadata: { role: 'admin' } };

    await expect(invokeCmsAction(legacyAdminOnly, {
      name: 'publish_content_version', args: { p_version_id: 'version-cms-1' },
    }, client)).rejects.toThrow(/not authorized/i);
    await expect(fetchCmsWorkflowVersions(legacyAdminOnly, client)).rejects.toThrow(/trusted Clinova CMS role/i);
    expect(doubles.rpc).not.toHaveBeenCalled();
    expect(doubles.from).not.toHaveBeenCalled();
  });

  it('permits the intended draft-to-published transition only for each exact trusted role', async () => {
    enableCms();
    doubles.rpc.mockResolvedValue({ data: null, error: null });
    const versionId = 'version-cms-flow';
    const contentAuthor = { id: 'author-id', app_metadata: { clinova_roles: ['content_author'] } };
    const clinicalReviewer = { id: 'clinical-id', app_metadata: { clinova_roles: ['clinical_reviewer'] } };
    const editorialReviewer = { id: 'editorial-id', app_metadata: { clinova_roles: ['editorial_reviewer'] } };
    const publisher = { id: 'publisher-id', app_metadata: { clinova_roles: ['content_publisher'] } };

    await invokeCmsAction(contentAuthor, {
      name: 'create_content_item', args: { p_kind: 'article', p_snapshot: { title: 'Synthetic draft', slug: 'synthetic-draft', description: 'Mock-only CMS test.' } },
    }, client);
    await invokeCmsAction(contentAuthor, { name: 'submit_content_for_review', args: { p_version_id: versionId } }, client);
    await invokeCmsAction(clinicalReviewer, {
      name: 'record_content_review', args: { p_version_id: versionId, p_review_type: 'clinical', p_decision: 'approved', p_evidence_refs: ['synthetic-clinical-evidence'], p_rationale: 'Synthetic clinical review evidence.' },
    }, client);
    await invokeCmsAction(editorialReviewer, {
      name: 'record_content_review', args: { p_version_id: versionId, p_review_type: 'editorial', p_decision: 'approved', p_evidence_refs: ['synthetic-editorial-evidence'], p_rationale: 'Synthetic editorial review evidence.' },
    }, client);
    await invokeCmsAction(publisher, {
      name: 'record_content_review', args: { p_version_id: versionId, p_review_type: 'release', p_decision: 'approved', p_evidence_refs: ['synthetic-release-evidence'], p_rationale: 'Synthetic release approval evidence.' },
    }, client);
    await invokeCmsAction(publisher, { name: 'publish_content_version', args: { p_version_id: versionId } }, client);

    expect(doubles.rpc.mock.calls.map(([name]) => name)).toEqual([
      'create_content_item',
      'submit_content_for_review',
      'record_content_review',
      'record_content_review',
      'record_content_review',
      'publish_content_version',
    ]);
    expect(doubles.rpc.mock.calls.at(-1)).toEqual(['publish_content_version', { p_version_id: versionId }]);
  });

  it('rejects a role mismatch before any RPC call, even when another CMS role is present', async () => {
    enableCms();
    const author = { id: 'author-id', app_metadata: { clinova_roles: ['content_author'] } };
    await expect(invokeCmsAction(author, {
      name: 'publish_content_version', args: { p_version_id: 'version-cms-1' },
    }, client)).rejects.toThrow(/not authorized/i);
    expect(doubles.rpc).not.toHaveBeenCalled();
  });
});
