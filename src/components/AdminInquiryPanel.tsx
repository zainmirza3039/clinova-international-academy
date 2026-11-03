import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ContactRecord = { id:string; name:string; email:string; phone:string|null; subject:string; enquiry_type:string; message:string; created_at:string };
type PartnershipRecord = { id:string; full_name:string; organisation:string; role:string; email:string; phone:string|null; country:string; website:string|null; message:string; created_at:string };
type NewsletterRecord = { id:string; email:string; created_at:string };

export default function AdminInquiryPanel() {
  const [contacts,setContacts]=useState<ContactRecord[]>([]);
  const [partnerships,setPartnerships]=useState<PartnershipRecord[]>([]);
  const [subscribers,setSubscribers]=useState<NewsletterRecord[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const refresh=useCallback(async()=>{
    setLoading(true);setError(null);
    const [contactResult,partnershipResult,newsletterResult]=await Promise.all([
      supabase.from('contact_submissions').select('id,name,email,phone,subject,enquiry_type,message,created_at').order('created_at',{ascending:false}).limit(100),
      supabase.from('partnership_inquiries').select('id,full_name,organisation,role,email,phone,country,website,message,created_at').order('created_at',{ascending:false}).limit(100),
      supabase.from('newsletter_subscriptions').select('id,email,created_at').order('created_at',{ascending:false}).limit(200),
    ]);
    const failed=contactResult.error||partnershipResult.error||newsletterResult.error;
    if(failed)setError('One or more enquiry lists could not be loaded. Check the administrator database policy.');
    setContacts((contactResult.data??[]) as ContactRecord[]);
    setPartnerships((partnershipResult.data??[]) as PartnershipRecord[]);
    setSubscribers((newsletterResult.data??[]) as NewsletterRecord[]);
    setLoading(false);
  },[]);
  useEffect(()=>{void refresh();},[refresh]);
  return <section className="mt-8" aria-labelledby="admin-inquiries-heading">
    <div className="admin-learning-heading"><div><p className="portal-kicker">INBOUND COMMUNICATIONS</p><h2 id="admin-inquiries-heading">Enquiries and institutional requests</h2><p>Private submissions are visible only to authorized academy administrators.</p></div><button type="button" className="portal-refresh" onClick={()=>void refresh()} disabled={loading}><RefreshCw size={15}/>Refresh</button></div>
    {error&&<p className="portal-alert" role="alert">{error}</p>}
    {loading?<p className="portal-loading" role="status">Loading enquiry records…</p>:<>
      <div className="portal-metrics"><article><span>General enquiries</span><strong>{contacts.length}</strong></article><article><span>Partnership requests</span><strong>{partnerships.length}</strong></article><article><span>Newsletter subscribers</span><strong>{subscribers.length}</strong></article><article><span>Latest enquiry</span><strong>{contacts[0]||partnerships[0]?'Recent':'—'}</strong><small>Latest available record</small></article></div>
      <h3 className="mt-8 mb-3 text-base font-semibold text-navy-900">General contact enquiries</h3>
      <div className="portal-admin-records">{contacts.map(item=><article className="portal-admin-record" key={item.id}><div><span className="portal-status">{item.enquiry_type}</span><h3>{item.subject}</h3><p>{item.name} · <a href={`mailto:${item.email}`}>{item.email}</a>{item.phone&&` · ${item.phone}`}</p><small>{new Date(item.created_at).toLocaleString()}</small><details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-teal-800">Read message</summary><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.message}</p></details></div></article>)}</div>
      <h3 className="mt-8 mb-3 text-base font-semibold text-navy-900">Institutional partnership requests</h3>
      <div className="portal-admin-records">{partnerships.map(item=><article className="portal-admin-record" key={item.id}><div><span className="portal-status">Partnership request</span><h3>{item.organisation}</h3><p>{item.full_name} · {item.role} · {item.country}</p><p><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone&&` · ${item.phone}`}</p>{item.website&&<p><a href={item.website} target="_blank" rel="noreferrer">{item.website}</a></p>}<small>{new Date(item.created_at).toLocaleString()}</small><details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-teal-800">Read request</summary><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.message}</p></details></div></article>)}</div>
      <h3 className="mt-8 mb-3 text-base font-semibold text-navy-900">Newsletter subscriptions</h3>
      <div className="portal-table-wrap portal-card"><table className="portal-table"><thead><tr><th>Email</th><th>Subscribed</th></tr></thead><tbody>{subscribers.map(item=><tr key={item.id}><td>{item.email}</td><td>{new Date(item.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>
    </>}
  </section>;
}
