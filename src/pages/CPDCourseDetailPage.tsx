import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

export default function CPDCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  useSEO({
    title: 'CPD course information',
    description: 'Course details are not published as a current offer while Clinova reviews the CPD education system.',
    noindex: true,
  });
  return (
    <section className="mx-auto max-w-3xl px-6 py-24" aria-labelledby="cpd-detail-title">
      <div className="border border-amber-300 bg-amber-50 p-7">
        <ShieldAlert className="h-7 w-7 text-amber-700" aria-hidden="true" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">Course information unavailable</p>
        <h1 id="cpd-detail-title" className="mt-2 font-heading text-2xl font-bold text-navy-900">This course is not currently offered</h1>
        <p className="mt-3 text-sm leading-relaxed text-navy-700">Course material and legacy catalogue records are under review and do not represent an open enrollment offer. This page provides no course syllabus, CPD hours, instructor, schedule, fee, assessment or completion rule, and collects no learner information.</p>
        <p className="mt-3 text-xs text-navy-500">Reference path: {slug ? 'course detail' : 'course information'}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link to="/cpd-courses" className="inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4"><ArrowLeft className="h-4 w-4" aria-hidden="true" />CPD system status</Link>
        <Link to="/contact" className="inline-flex min-h-11 items-center font-semibold text-clinical-700 underline underline-offset-4">Contact information</Link>
      </div>
    </section>
  );
}
