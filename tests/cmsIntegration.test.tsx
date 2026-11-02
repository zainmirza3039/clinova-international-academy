import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResourcesPage } from '@/pages/ResourcesPage';
import CmsAdminWorkspace from '@/components/CmsAdminWorkspace';
import { educationalArticles } from '@/data/educationalArticles';
import {
  cmsFeatureEnabled,
  fetchCmsWorkflowVersions,
  fetchPublishedCmsContent,
  getCmsRoles,
  hasAnyCmsRole,
  invokeCmsAction,
  type CmsClient,
} from '@/lib/cms';

const doubles = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from: doubles.from, rpc: doubles.rpc } }));
vi.mock('@/hooks/useScrollAnimation', () => ({ useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }) }));

const expectedProject = 'https://ssxpmcbqfdggfsoqbxac.supabase.co';
const client: CmsClient = {
  from: doubles.from as unknown as CmsClient['from'],
  rpc: doubles.rpc as unknown as CmsClient['rpc'],
};

function requestCmsActivation() {
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

describe('Clinova CMS release gates', () => {
  it('keeps repository-backed public content available without querying CMS', async () => {
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

  it('ignores true deployment flags and performs no public query or private workflow action', async () => {
    requestCmsActivation();
    const user = { id: 'synthetic-admin', app_metadata: { clinova_roles: ['content_admin'] } };

    expect(cmsFeatureEnabled()).toBe(false);
    expect(await fetchPublishedCmsContent(client)).toEqual([]);
    await expect(fetchCmsWorkflowVersions(user, client)).rejects.toThrow(/disabled/i);
    await expect(invokeCmsAction(user, {
      name: 'create_content_item',
      args: { p_kind: 'article', p_snapshot: { title: 'Synthetic draft', slug: 'synthetic-draft' } },
    }, client)).rejects.toThrow(/disabled/i);
    expect(doubles.from).not.toHaveBeenCalled();
    expect(doubles.rpc).not.toHaveBeenCalled();
  });

  it('shows the CMS panel as inactive even to a trusted CMS role', () => {
    requestCmsActivation();
    const user = { id: 'synthetic-reviewer', app_metadata: { clinova_roles: ['clinical_reviewer'] } };
    render(<CmsAdminWorkspace user={user} />);

    expect(screen.getByRole('heading', { name: 'CMS workflow' })).toBeTruthy();
    expect(screen.getByText(/queries and workflow actions are disabled in source/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /refresh cms|save draft|publish|withdraw/i })).toBeNull();
    expect(doubles.from).not.toHaveBeenCalled();
    expect(doubles.rpc).not.toHaveBeenCalled();
  });

  it('accepts only trusted server-managed CMS role claims as data, without enabling workflow access', () => {
    expect(getCmsRoles({ id: 'legacy', app_metadata: { role: 'admin' } })).toEqual([]);
    expect(getCmsRoles({ id: 'user-claim', user_metadata: { clinova_roles: ['content_admin'] } })).toEqual([]);
    expect(getCmsRoles({ id: 'trusted', app_metadata: { clinova_roles: ['content_author'] } })).toEqual(['content_author']);
    expect(hasAnyCmsRole({ id: 'trusted', app_metadata: { clinova_roles: ['content_author'] } }, ['content_author'])).toBe(true);
  });
});
