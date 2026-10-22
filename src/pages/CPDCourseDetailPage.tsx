import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import CurriculumDraftContent from '@/components/CurriculumDraftContent';
import { cpdCourses } from '@/data/cpdCourses';
import { getCPDCurriculum } from '@/data/cpdCurricula';

export default function CPDCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const course = cpdCourses.find(item => item.slug === slug);
  const draft = slug ? getCPDCurriculum(slug) : undefined;
  useSEO({ title: course?.title ?? 'CPD Course Not Found', description: course?.description ?? 'The requested CPD course could not be found.', ogImage: course?.image });
  if (!course) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="font-heading text-2xl font-bold text-navy-900 mb-4">CPD Course Not Found</h1><Link to="/cpd-courses" className="text-clinical-600">Browse CPD courses</Link></div></div>;
  const related = cpdCourses.filter(item => item.slug !== course.slug && item.department === course.department).slice(0, 3);
  return <>
    <section className="bg-navy-900 pt-28 pb-14">
      <div className="max-w-editorial mx-auto px-6 lg:px-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'CPD Courses', to: '/cpd-courses' }, { label: course.title }]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300 mb-4">Proposed · {course.department}</div>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight">{course.title}</h1>
            <p className="mt-5 text-lg text-navy-100/80 leading-relaxed">{course.description}</p>
          </div>
          <img src={course.image} alt="" className="lg:col-span-5 aspect-[4/3] object-cover" />
        </div>
      </div>
    </section>
    <p className="max-w-4xl mx-auto px-6 mt-6 p-4 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-950"><strong>Proposed catalogue entry.</strong> Availability, dates, fees, duration, CPD hours, delivery, assessment, instructors and certificates require academy confirmation. No checkout or enrolment is available. CPD is a catalogue category, not a claim of accredited or awarded hours.</p>
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-editorial mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">Overview</h2>
              <p className="text-sm text-navy-600 leading-relaxed">These proposed reading materials support critical reflection and recognition of professional limits. They do not establish clinical competence, eligibility to practise, prescribing authority or a qualification. Qualified review is required before any future course offering.</p>
            </div>
            {draft ? <CurriculumDraftContent draft={draft} /> : <p className="text-sm text-navy-700">A detailed curriculum is not available for this outline. A catalogue entry is not evidence of a reviewed or delivered course.</p>}
          </div>
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 border border-navy-200 p-6">
              <h2 className="font-heading text-lg font-bold text-navy-900 mb-4">Catalogue status</h2>
              <p className="text-sm text-navy-600 leading-relaxed">Reading only — reflection is not submitted, graded, saved or counted as completion. See the unconfirmed arrangements above before making any plans.</p>
              <Link to="/cpd-courses" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700">Browse CPD outlines <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
    {related.length > 0 && <section className="py-10 bg-navy-50"><div className="max-w-editorial mx-auto px-6 lg:px-10"><h2 className="font-heading text-2xl font-bold text-navy-900">Related proposed CPD topics</h2><ul className="mt-5 space-y-3">{related.map(item => <li key={item.slug}><Link className="text-sm font-semibold text-clinical-700 underline underline-offset-4" to={`/cpd-courses/${item.slug}`}>{item.title}</Link></li>)}</ul></div></section>}
  </>;
}
