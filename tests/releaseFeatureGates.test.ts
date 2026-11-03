// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const { createClient, from, rpc } = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('@/lib/supabase', () => ({ supabase: { from, rpc } }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.clearAllMocks();
});

const setAllActivationFlags = () => {
  vi.stubEnv('VITE_AUTH_ENABLED', 'true');
  vi.stubEnv('VITE_LEARNER_DATA_ENABLED', 'true');
  vi.stubEnv('VITE_ENQUIRIES_ENABLED', 'true');
  vi.stubEnv('VITE_CMS_ENABLED', 'true');
  vi.stubEnv('VITE_SUPABASE_URL', 'https://ssxpmcbqfdggfsoqbxac.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'local-test-key');
};

describe('release feature activation gates', () => {
  it('keeps authentication disabled even when correct project credentials and auth flags are set', async () => {
    setAllActivationFlags();
    vi.resetModules();
    const { authConfig, createAuthClient } = await import('@/auth/authConfig');
    expect(authConfig.enabled).toBe(false);
    expect(createAuthClient()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('keeps learner data, enquiries, CMS reads and CMS writes disabled under all true environment flags', async () => {
    setAllActivationFlags();
    vi.resetModules();
    const { learnerDataEnabled, enquiriesEnabled } = await import('@/lib/siteConfig');
    const cms = await import('@/lib/cms');
    expect(learnerDataEnabled).toBe(false);
    expect(enquiriesEnabled).toBe(false);
    expect(cms.cmsFeatureEnabled()).toBe(false);

    const client = { from, rpc } as unknown as import('@/lib/cms').CmsClient;
    expect(await cms.fetchPublishedCmsContent(client)).toEqual([]);
    await expect(cms.fetchCmsWorkflowVersions({
      id: 'synthetic-admin',
      app_metadata: { clinova_roles: ['content_admin'] },
    }, client)).rejects.toThrow(/disabled/i);
    await expect(cms.invokeCmsAction({
      id: 'synthetic-admin',
      app_metadata: { clinova_roles: ['content_admin'] },
    }, { name: 'create_content_item', args: { p_kind: 'article', p_snapshot: { title: 'Draft', slug: 'draft' } } }, client)).rejects.toThrow(/disabled/i);
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
});
