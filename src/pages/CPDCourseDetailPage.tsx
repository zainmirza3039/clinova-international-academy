import { Link, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchPublishedCmsContent } from '@/lib/cms';
import { ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';
import { getOwnerListedCPDTopicBySlug } from '@/data/catalogueBrowse';

export default function CPDCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const topic = slug ? getOwnerListedCPDTopicBySlug(slug) : undefined;
  const [publishedCourse, setPublishedCourse] = useState(false);
  useEffect(() => {
    let active = true;
    void fetchPublishedCmsContent().then(records => {
      if (active) setPublishedCourse(records.some(record => record.kind === 'cpd_course' && record.snapshot.slug === slug));
    }).catch(() => { if (active) setPublishedCourse(false); });
    return () => { active = false; };
  }, [slug]);
  if (publishedCourse && slug) return <Navigate to={\`/cms/cpd_course/\${slug}\`} replace />;

  useSEO({
    title: topic ? `${topic.title} | Proposed CPD topic` : 'CPD topic information',
    description: 'Proposed CPD topic information only. No course, enrollment, assessment or certificate is currently available.',
    noindex: true,
  });

  if (!topic) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24" aria-labelledby="cpd-topic-not-found-title">
        <div className="border border-navy-200 bg-surface-50 p-7">
          <h1 id="cpd-topic-not-found-title" className="font-heading text-2xl font-bold text-navy-900">CPD topic not found</h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-700">This address does not match a topic in the current owner-listed CPD topic directory.</p>
        </div>
        <Link to="/cpd-courses" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Browse proposed CPD topics</Link>
      </section>
    );
  }

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'CPD topics', to: '/cpd-courses' }, { label: topic.title }]}
        eyebrow="Proposed CPD topic"
        title={topic.title}
        description="This title is shown for topic discovery only. It is not a current course or enrollment offer."
      />
      <section className="bg-white px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="border border-amber-300 bg-amber-50 p-6" role="status">
            <ShieldAlert className="h-6 w-6 text-amber-700" aria-hidden="true" />
            <h2 className="mt-3 font-heading text-xl font-bold text-navy-900">Topic details are not available as a course offer</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-700">Course content and operational terms are not shown here. No application, payment, enrollment, course access, assessment, CPD completion or credential service is connected.</p>
          </div>
          <dl className="mt-6 grid gap-px border border-navy-200 bg-navy-200 sm:grid-cols-2">
            <div className="bg-white p-5"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Topic status</dt><dd className="mt-2 text-sm font-semibold text-navy-900">Proposed topic only</dd></div>
            <div className="bg-white p-5"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Suggested subject grouping</dt><dd className="mt-2 text-sm font-semibold text-navy-900">{topic.subjectArea} <span className="font-normal text-navy-600">(provisional)</span></dd></div>
            <div className="bg-white p-5"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Delivery, dates and fees</dt><dd className="mt-2 text-sm text-navy-800">Not confirmed for publication</dd></div>
            <div className="bg-white p-5"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Hours, assessment and credentials</dt><dd className="mt-2 text-sm text-navy-800">No approved course terms are published</dd></div>
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-navy-600">A topic title does not represent clinical review, an approved curriculum, formal CPD credit, a qualification or professional competency certification.</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link to="/cpd-courses" className="inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Browse proposed CPD topics</Link>
            <Link to="/departments" className="inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4">Browse subject areas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
