import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CmsAdminWorkspace from '@/components/CmsAdminWorkspace';
import {
  cmsFeatureEnabled,
  fetchCmsWorkflowVersions,
  fetchPublishedCmsContent,
  getCmsRoles,
  hasAnyCmsRole,
  invokeCmsAction,
  type CmsClient,
} from '@/lib/cms';

const doubles=vi.hoisted(()=>({from:vi.fn(),rpc:vi.fn()}));
vi.mock('@/lib/supabase',()=>({supabase:{from:doubles.from,rpc:doubles.rpc}}));
vi.mock('@/hooks/useScrollAnimation',()=>({useScrollAnimation:()=>({ref:{current:null},isVisible:true})}));

const expectedProject='https://ssxpmcbqfdggfsoqbxac.supabase.co';
const client:CmsClient={
  from:doubles.from as unknown as CmsClient['from'],
  rpc:doubles.rpc as unknown as CmsClient['rpc'],
};
function configureCms() {
  vi.stubEnv('VITE_CMS_ENABLED','true');
  vi.stubEnv('VITE_SUPABASE_URL',expectedProject);
  vi.stubEnv('VITE_SUPABASE_ANON_KEY','test-publishable-key');
}
type QueryBuilder = { order: () => QueryBuilder; in: () => QueryBuilder; limit: () => Promise<{ data: unknown[]; error: null }> };
function queryBuilder(data:unknown[]=[]): QueryBuilder {
  const query: QueryBuilder = { order: () => query, in: () => query, limit: () => Promise.resolve({data,error:null}) };
  return query;
}
function configureQueries() {
  doubles.from.mockImplementation(()=>({select:vi.fn(()=>queryBuilder())}));
  doubles.rpc.mockResolvedValue({data:[],error:null});
}
afterEach(()=>{cleanup();vi.clearAllMocks();vi.unstubAllEnvs();document.head.innerHTML='';});

describe('Clinova CMS workflow',()=>{
  it('enables CMS only for the configured academy Supabase project',async()=>{
    configureCms();configureQueries();
    expect(cmsFeatureEnabled()).toBe(true);
    expect(await fetchPublishedCmsContent(client)).toEqual([]);
    expect(doubles.from).toHaveBeenCalledWith('published_content');
  });

  it('requires trusted CMS roles before reading workflow records or invoking actions',async()=>{
    configureCms();configureQueries();
    const author={id:'author-1',app_metadata:{clinova_roles:['content_author']}};
    expect(await fetchCmsWorkflowVersions(author,client)).toEqual([]);
    await invokeCmsAction(author,{name:'create_content_item',args:{p_kind:'article',p_snapshot:{title:'A reviewed article',slug:'reviewed-article'}}},client);
    expect(doubles.from).toHaveBeenCalledWith('content_versions');
    expect(doubles.rpc).toHaveBeenCalledWith('create_content_item',expect.objectContaining({p_kind:'article'}));
    await expect(fetchCmsWorkflowVersions({id:'untrusted',user_metadata:{clinova_roles:['content_admin']}},client)).rejects.toThrow(/trusted Clinova CMS role/i);
  });

  it('recognizes server-managed roles and legacy administrator access without trusting user metadata',()=>{
    expect(getCmsRoles({id:'legacy-admin',app_metadata:{role:'admin'}})).toContain('content_admin');
    expect(getCmsRoles({id:'user-claim',user_metadata:{clinova_roles:['content_admin']}})).toEqual([]);
    expect(getCmsRoles({id:'trusted',app_metadata:{clinova_roles:['content_author']}})).toEqual(['content_author']);
    expect(hasAnyCmsRole({id:'trusted',app_metadata:{clinova_roles:['content_author']}},['content_author'])).toBe(true);
  });

  it('loads the admin CMS workspace for a trusted role and keeps it unavailable to untrusted accounts',async()=>{
    configureCms();configureQueries();
    const trusted={id:'cms-admin',app_metadata:{clinova_roles:['content_admin']}};
    render(<MemoryRouter><CmsAdminWorkspace user={trusted}/></MemoryRouter>);
    expect(screen.getByRole('heading',{name:'CMS workflow'})).toBeTruthy();
    await waitFor(()=>expect(doubles.from).toHaveBeenCalledWith('content_versions'));
    expect(screen.getByText(/No CMS versions are available to this account/i)).toBeTruthy();
    cleanup();vi.clearAllMocks();configureQueries();
    render(<MemoryRouter><CmsAdminWorkspace user={{id:'ordinary',app_metadata:{}}}/></MemoryRouter>);
    expect(screen.getByRole('heading',{name:'CMS workflow access denied'})).toBeTruthy();
    expect(doubles.from).not.toHaveBeenCalled();
    expect(doubles.rpc).not.toHaveBeenCalled();
  });
});
