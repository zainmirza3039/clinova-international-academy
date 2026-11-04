import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ContentEvent = { id:number; content_item_id:string|null; content_version_id:string|null; actor_id:string|null; event_type:string; from_state:string|null; to_state:string|null; content_sha256:string|null; reason:string|null; occurred_at:string };
type RoleEvent = { id:number; target_user_id:string; actor_user_id:string; role_name:string; action:string; occurred_at:string };

export default function AdminAuditPanel() {
  const [contentEvents,setContentEvents]=useState<ContentEvent[]>([]);
  const [roleEvents,setRoleEvents]=useState<RoleEvent[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const refresh=useCallback(async()=>{
    setLoading(true);setError(null);
    const [content,roles]=await Promise.all([
      supabase.from('content_audit_events').select('id,content_item_id,content_version_id,actor_id,event_type,from_state,to_state,content_sha256,reason,occurred_at').order('occurred_at',{ascending:false}).limit(100),
      supabase.from('admin_role_audit_events').select('id,target_user_id,actor_user_id,role_name,action,occurred_at').order('occurred_at',{ascending:false}).limit(100),
    ]);
    if(content.error||roles.error)setError('Audit history could not be loaded. Confirm administrator access and database policies.');
    setContentEvents((content.data??[]) as ContentEvent[]);
    setRoleEvents((roles.data??[]) as RoleEvent[]);
    setLoading(false);
  },[]);
  useEffect(()=>{void refresh();},[refresh]);
  return <section className="mt-8 space-y-8" aria-labelledby="admin-audit-heading">
    <div className="admin-learning-heading"><div><p className="portal-kicker">GOVERNANCE RECORDS</p><h2 id="admin-audit-heading">Content and access audit history</h2><p>Read-only event history. Records are not editable or deletable through this panel.</p></div><button type="button" className="portal-refresh" onClick={()=>void refresh()} disabled={loading}><RefreshCw size={15}/>Refresh</button></div>
    {error&&<p role="alert" className="portal-alert">{error}</p>}
    {loading?<p className="portal-loading" role="status">Loading audit history…</p>:<>
      <section><h3 className="mb-3 text-base font-semibold text-navy-900">Content workflow events <span className="text-xs font-normal text-navy-500">({contentEvents.length})</span></h3>
        {contentEvents.length===0?<p className="portal-empty">No content workflow events recorded.</p>:<div className="portal-table-wrap portal-card"><table className="portal-table"><thead><tr><th>Event</th><th>Transition</th><th>Actor</th><th>Time</th><th>Reason</th></tr></thead><tbody>{contentEvents.map(item=><tr key={item.id}><td><strong>{item.event_type}</strong><small className="block text-slate-500">{item.content_version_id??item.content_item_id??'No content reference'}</small></td><td>{item.from_state??'—'} → {item.to_state??'—'}</td><td><code>{item.actor_id??'System'}</code></td><td>{new Date(item.occurred_at).toLocaleString()}</td><td>{item.reason??'—'}</td></tr>)}</tbody></table></div>}
      </section>
      <section><h3 className="mb-3 text-base font-semibold text-navy-900">Administrator role changes <span className="text-xs font-normal text-navy-500">({roleEvents.length})</span></h3>
        {roleEvents.length===0?<p className="portal-empty">No administrator role changes recorded.</p>:<div className="portal-table-wrap portal-card"><table className="portal-table"><thead><tr><th>Action</th><th>Role</th><th>Target user</th><th>Performed by</th><th>Time</th></tr></thead><tbody>{roleEvents.map(item=><tr key={item.id}><td><span className={item.action==='granted'?'portal-status portal-status--valid':'portal-status portal-status--revoked'}>{item.action}</span></td><td>{item.role_name}</td><td><code>{item.target_user_id}</code></td><td><code>{item.actor_user_id}</code></td><td>{new Date(item.occurred_at).toLocaleString()}</td></tr>)}</tbody></table></div>}
      </section>
    </>}
  </section>;
}
