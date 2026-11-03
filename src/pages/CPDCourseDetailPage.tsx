import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { fetchPublishedCmsContent } from '@/lib/cms';
import { useSEO } from '@/hooks/useSEO';

export default function CPDCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<'loading'|'published'|'missing'|'error'>('loading');
  useSEO({
    title: 'CPD programme information | Clinova International Academy',
    description: 'View published continuing professional development programme information from Clinova International Academy.',
  });

  useEffect(() => {
    let active = true;
    void fetchPublishedCmsContent().then(records => {
      if (!active) return;
      setStatus(records.some(record => record.kind === 'cpd_course' && record.snapshot.slug === slug) ? 'published' : 'missing');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [slug]);

  if (status === 'published' && slug) return <Navigate to={`/cms/cpd_course/${slug}`} replace />;
  if (status === 'loading') return <section className="mx-auto max-w-3xl px-6 py-24 text-center" role="status"><h1 className="text-2xl font-heading font-bold text-navy-900">Checking programme availability…</h1></section>;

  return <>
    <PageHero
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'CPD programmes', to: '/cpd-courses' }, { label: 'Programme information' }]}
      eyebrow="CPD programme catalogue"
      title={status === 'error' ? 'Programme information is temporarily unavailable' : 'This programme is not currently published.'}
      description={status === 'error' ? 'The academy catalogue could not be checked. Please try again later.' : 'Only approved, published programmes have public detail pages. Unpublished drafts and proposed topic labels are not presented as course offers.'}
    />
    <section className="bg-white px-6 py-12"><div className="mx-auto max-w-3xl border border-navy-200 bg-surface-50 p-7"><p className="text-sm leading-relaxed text-navy-700">{status === 'error' ? 'Please return to the catalogue or contact the academy for assistance.' : 'The requested programme may have been withdrawn, renamed or not yet approved for publication.'}</p><Link to="/cpd-courses" className="mt-6 inline-flex items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4"><ArrowLeft size={16}/>Return to published programmes</Link></div></section>
  </>;
}
