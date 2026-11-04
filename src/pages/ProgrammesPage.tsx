import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { fetchPublishedCmsContent, type CmsPublishedContent } from '@/lib/cms';
import { useSEO } from '@/hooks/useSEO';

function textValue(snapshot: Record<string, unknown>, key: string): string | null {
  const value=snapshot[key];
  return typeof value==='string'&&value.trim()?value.trim():null;
}

export default function ProgrammesPage() {
  const [records,setRecords]=useState<CmsPublishedContent[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);
  useSEO({
    title:'Academic programmes | Clinova International Academy',
    description:'Explore published academic and professional education programmes from Clinova International Academy.',
  });
  useEffect(()=>{
    let active=true;
    void fetchPublishedCmsContent().then(items=>{
      if(!active)return;
      setRecords(items.filter(item=>item.kind==='programme'));
    }).catch(()=>{if(active)setError(true);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);
  return <>
    <PageHero
      breadcrumbs={[{label:'Home',to:'/'},{label:'Academic programmes'}]}
      eyebrow="Academic programmes"
      title="Professional education with a clear learning pathway."
      description="Explore academic and professional learning programmes published by Clinova International Academy. Each programme page contains the information approved for public release."
    />
    <section className="bg-white px-6 py-14 lg:py-20"><div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-navy-100 pb-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Programme catalogue</p><h2 className="mt-2 font-heading text-2xl font-bold text-navy-900">Published academic programmes</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-600">Only approved programme records are shown here. Draft and review-stage content remains private.</p></div><span className="text-sm text-navy-600" aria-live="polite">{loading?'Loading programmes…':`${records.length} published programme${records.length===1?'':'s'}`}</span></div>
      {loading&&<p className="mt-8 border border-navy-100 bg-surface-50 p-8 text-center text-sm text-navy-600" role="status">Loading the programme catalogue…</p>}
      {error&&<div className="mt-8 border border-amber-200 bg-amber-50 p-6" role="alert"><h3 className="font-semibold text-navy-900">Programme information is temporarily unavailable</h3><p className="mt-2 text-sm text-navy-700">Please try again later or contact the academy.</p></div>}
      {!loading&&!error&&records.length===0&&<div className="mt-8 border border-navy-200 bg-surface-50 p-8 md:p-10"><GraduationCap className="h-7 w-7 text-clinical-700"/><h3 className="mt-4 font-heading text-2xl font-bold text-navy-900">New programmes will appear here after approval.</h3><p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-600">The academy publishes programme details only after the relevant content and release checks are complete. For currently available instructor-led CPD learning, visit the CPD catalogue.</p><div className="mt-6 flex flex-wrap gap-4"><Link to="/cpd-courses" className="inline-flex min-h-11 items-center gap-2 bg-navy-800 px-5 py-3 text-sm font-semibold text-white">Explore CPD programmes <ArrowRight size={16}/></Link><Link to="/contact" className="inline-flex min-h-11 items-center gap-2 border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800">Contact the academy</Link></div></div>}
      {!loading&&!error&&records.length>0&&<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{records.map(record=>{
        const title=textValue(record.snapshot,'title')??'Academic programme';
        const summary=textValue(record.snapshot,'excerpt')??textValue(record.snapshot,'description')??textValue(record.snapshot,'overview');
        const category=textValue(record.snapshot,'category')??textValue(record.snapshot,'department');
        return <article key={record.content_version_id} className="flex flex-col border border-navy-200 bg-white p-6 hover:border-clinical-600"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-clinical-700">{category??'Academic programme'}</p><h3 className="mt-3 font-heading text-xl font-bold text-navy-900">{title}</h3>{summary&&<p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">{summary}</p>}<Link to={`/cms/programme/${String(record.snapshot.slug)}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4">View programme <ArrowRight size={15}/></Link></article>;
      })}</div>}
      <div className="mt-14 border-t border-navy-100 pt-7"><h2 className="font-heading text-xl font-bold text-navy-900">Continuing professional development</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-600">For scheduled, instructor-led short courses and CPD learning, browse the separate CPD programme catalogue.</p><Link to="/cpd-courses" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Browse CPD programmes <ArrowRight size={15}/></Link></div>
    </div></section>
  </>;
}
