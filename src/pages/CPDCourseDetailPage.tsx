import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Info } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import CurriculumDraftContent from '@/components/CurriculumDraftContent';
import { publishedCPDCourses } from '@/data/cpdCourses';
import { getCPDCurriculum } from '@/data/cpdCurricula';

export default function CPDCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const course = publishedCPDCourses.find(item => item.slug === slug);
  const draft = slug ? getCPDCurriculum(slug) : undefined;
  useSEO({ title: course?.title ?? 'Learning Topic Not Found', description: course?.description ?? 'The requested learning topic could not be found.', ogImage: course?.image });

  if (!course) return <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 py-24 text-center"><div><h1 className="font-heading text-3xl font-bold text-navy-900">Learning topic not found</h1><p className="mt-3 text-sm text-navy-600">This address does not match a topic in the current catalogue.</p><Link to="/cpd-courses" className="mt-6 inline-flex items-center gap-2 font-semibold text-clinical-700"><ArrowLeft className="h-4 w-4" /> Browse self-study courses</Link></div></section>;

  const related = publishedCPDCourses.filter(item => item.slug !== course.slug && item.department === course.department).slice(0, 3);

  return <>
    <header className="relative overflow-hidden bg-navy-900">
      <div className="absolute inset-0"><img src={course.image} alt="" className="h-full w-full object-cover opacity-20" /><div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/95 to-navy-900/60" /></div>
      <div className="relative mx-auto max-w-editorial px-6 pb-14 pt-28 lg:px-10 lg:pb-16 lg:pt-36">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Professional Development', to: '/cpd-courses' }, { label: course.title }]} />
        <div className="mt-8 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-300">Self-study course · {course.department}</p><h1 className="mt-4 max-w-4xl font-heading text-3xl font-bold leading-tight text-white md:text-5xl">{course.title}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-navy-100/80 md:text-lg">{course.description}</p><div className="mt-6 flex flex-wrap gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white"><BookOpen className="h-4 w-4 text-teal-300" /> Self-paced lessons</span><span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">{course.level} level</span></div></div>
          <img src={course.image} alt="" className="hidden aspect-[5/4] w-full rounded-xl border border-white/15 object-cover shadow-xl lg:col-span-4 lg:block" />
        </div>
      </div>
    </header>

    <aside className="border-b border-amber-200 bg-amber-50"><div className="mx-auto flex max-w-editorial items-start gap-3 px-6 py-5 lg:px-10"><Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" /><p className="text-sm leading-6 text-amber-950"><strong>Course status:</strong> {course.publicationStatus === 'published' ? 'This is an open self-study course with learning modules and source links. It is not an accredited CPD award and does not provide a certificate, graded assessment, or recorded learner progress.' : 'This is an educational topic in development. It does not confirm course availability, enrolment, dates, fees, accredited status, awarded CPD hours or certification.'}</p></div></aside>

    <section className="bg-white py-12 lg:py-16"><div className="mx-auto grid max-w-editorial grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-12 lg:px-10">
      <article className="min-w-0 space-y-10 lg:col-span-8"><section><p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinical-700">About this course</p><h2 className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">Overview</h2><p className="mt-4 text-base leading-7 text-navy-700">This material is designed for structured independent study. Work through the lessons, complete the reflective activities and consult the linked primary guidance. It is not a substitute for supervised practical training or professional judgement.</p><p className="mt-4 text-sm leading-6 text-navy-600">Completing self-study does not establish clinical competence, eligibility to practise, completion of a graded assessment or entitlement to CPD credit.</p></section>{draft ? <section><h2 className="mb-5 font-heading text-2xl font-bold text-navy-900">Course lessons</h2><CurriculumDraftContent draft={draft} /></section> : <section className="rounded-xl border border-navy-100 bg-surface-50 p-6"><h2 className="font-heading text-xl font-bold text-navy-900">Study material</h2><p className="mt-2 text-sm leading-6 text-navy-600">Detailed learning content is not currently available for this topic.</p></section>}</article>
      <aside className="lg:col-span-4"><div className="rounded-xl border border-navy-100 p-6 shadow-sm lg:sticky lg:top-24"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinical-700">At a glance</p><h2 className="mt-3 font-heading text-xl font-bold text-navy-900">Course information</h2><dl className="mt-5 divide-y divide-navy-100"><div className="py-3"><dt className="text-xs text-navy-500">Subject area</dt><dd className="mt-1 text-sm font-semibold text-navy-800">{course.department}</dd></div><div className="py-3"><dt className="text-xs text-navy-500">Study level</dt><dd className="mt-1 text-sm font-semibold text-navy-800">{course.level}</dd></div><div className="py-3"><dt className="text-xs text-navy-500">Format</dt><dd className="mt-1 text-sm font-semibold text-navy-800">Self-paced independent study</dd></div><div className="py-3"><dt className="text-xs text-navy-500">CPD hours / certificate</dt><dd className="mt-1 text-sm font-semibold text-navy-800">Not awarded by this course</dd></div></dl><div className="mt-5 border-t border-navy-100 pt-5"><p className="text-sm leading-6 text-navy-600">The self-study materials are available here; enrolment tracking and accredited awards are not provided.</p><Link to="/contact" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800">Contact the Academy <ArrowRight className="h-4 w-4" /></Link><Link to="/cpd-courses" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-navy-200 px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50"><ArrowLeft className="h-4 w-4" /> Browse other courses</Link></div></div></aside>
    </div></section>

    {related.length > 0 && <section className="bg-surface-50 py-12"><div className="mx-auto max-w-editorial px-6 lg:px-10"><h2 className="font-heading text-2xl font-bold text-navy-900">Related learning topics</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{related.map(item => <li key={item.slug}><Link className="flex h-full items-center justify-between gap-3 rounded-lg border border-navy-100 bg-white p-4 text-sm font-semibold text-navy-800 hover:border-clinical-300 hover:text-clinical-700" to={`/cpd-courses/${item.slug}`}>{item.title}<ArrowRight className="h-4 w-4 shrink-0" /></Link></li>)}</ul></div></section>}
  </>;
}
