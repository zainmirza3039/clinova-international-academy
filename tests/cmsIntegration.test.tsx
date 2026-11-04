import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
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
afterEach(()=>{cleanup();vi.clearAllMocks();vi.unstubAllEnvs();document.head.innerHTML='';});

describe('Clinova CMS release gate',()=>{
  it('keeps CMS disabled in source even when valid project credentials and environment flags are supplied',async()=>{
    configureCms();
    expect(cmsFeatureEnabled()).toBe(false);
    expect(await fetchPublishedCmsContent(client)).toEqual([]);
    expect(doubles.from).not.toHaveBeenCalled();
    expect(doubles.rpc).not.toHaveBeenCalled();
  });

  it('rejects workflow reads and writes before any database request while CMS is disabled',async()=>{
    configureCms();
    const author={id:'author-1',app_metadata:{clinova_roles:['content_author']}};
    await expect(fetchCmsWorkflowVersions(author,client)).rejects.toThrow(/disabled/i);
    await expect(invokeCmsAction(author,{name:'create_content_item',args:{p_kind:'article',p_snapshot:{title:'A reviewed article',slug:'reviewed-article'}}},client)).rejects.toThrow(/disabled/i);
    expect(doubles.from).not.toHaveBeenCalled();
    expect(doubles.rpc).not.toHaveBeenCalled();
  });

  it('recognizes server-managed roles without trusting user metadata',()=>{
    expect(getCmsRoles({id:'legacy-admin',app_metadata:{role:'admin'}})).toContain('content_admin');
    expect(getCmsRoles({id:'user-claim',user_metadata:{clinova_roles:['content_admin']}})).toEqual([]);
    expect(getCmsRoles({id:'trusted',app_metadata:{clinova_roles:['content_author']}})).toEqual(['content_author']);
    expect(hasAnyCmsRole({id:'trusted',app_metadata:{clinova_roles:['content_author']}},['content_author'])).toBe(true);
  });

  it('shows the disabled CMS notice to administrators and denies untrusted accounts without querying',()=>{
    configureCms();
    render(<MemoryRouter><CmsAdminWorkspace user={{id:'cms-admin',app_metadata:{clinova_roles:['content_admin']}}}/></MemoryRouter>);
    expect(screen.getByRole('heading',{name:'CMS workflow'})).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/CMS queries and workflow actions are disabled in source/i);
    expect(doubles.from).not.toHaveBeenCalled();
    expect(doubles.rpc).not.toHaveBeenCalled();
    cleanup();
    render(<MemoryRouter><CmsAdminWorkspace user={{id:'ordinary',app_metadata:{}}}/></MemoryRouter>);
    expect(screen.getByRole('heading',{name:'CMS workflow'})).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/CMS queries and workflow actions are disabled in source/i);
    expect(doubles.from).not.toHaveBeenCalled();
    expect(doubles.rpc).not.toHaveBeenCalled();
  });
});
