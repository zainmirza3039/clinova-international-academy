import { Link, useParams } from 'react-router-dom';
import { Award, ArrowRight, Clock, Monitor, Signal } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cpdCourses } from '@/data/cpdCourses';

export default function CPDCourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const course = cpdCourses.find((item) => item.slug === slug);

  useSEO({
    title: course?.title ?? 'CPD Course Not Found',
    description: course?.description ?? 'The requested CPD course could not be found.',
    ogImage: course?.image,
  });

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="text-center px-6">
          <h1 className="font-heading text-2xl font-bold text-navy-900 mb-4">CPD Course Not Found</h1>
          <p className="text-navy-500 mb-6">The course you are looking for may have moved or is no longer available.</p>
          <Link to="/cpd-courses" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold hover:bg-navy-800 transition-colors">
            Browse CPD Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="bg-navy-900 pt-28 pb-14 lg:pt-36 lg:pb-20">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'CPD Courses', to: '/cpd-courses' }, { label: course.title }]} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mt-8 items-end">
            <div className="lg:col-span-7">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300 mb-4">{course.department}</div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight text-balance">{course.title}</h1>
              <p className="mt-5 text-base md:text-lg text-navy-100/80 leading-relaxed max-w-2xl">{course.description}</p>
            </div>
            <div className="lg:col-span-5 aspect-[4/3] overflow-hidden">
              <img src={course.image} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">Course overview</div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-900 mb-5">Focused learning for professional practice</h2>
              <p className="text-base text-navy-600 leading-relaxed">{course.description} This short course is designed to support structured professional development alongside clinical work.</p>
              <div className="mt-10 border-t border-navy-100 pt-8">
                <h2 className="font-heading text-xl font-bold text-navy-900 mb-4">Who this course is for</h2>
                <p className="text-base text-navy-600 leading-relaxed">Healthcare professionals and learners working in or preparing for roles related to {course.department.toLowerCase()}.</p>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="border border-navy-200 p-6 lg:p-8">
                <h2 className="font-heading text-lg font-bold text-navy-900 mb-6">Course information</h2>
                <dl className="space-y-4">
                  <div className="flex items-center justify-between gap-4 border-b border-navy-100 pb-4"><dt className="flex items-center gap-2 text-sm text-navy-500"><Clock className="w-4 h-4 text-teal-600" /> Duration</dt><dd className="text-sm font-semibold text-navy-800">{course.duration}</dd></div>
                  <div className="flex items-center justify-between gap-4 border-b border-navy-100 pb-4"><dt className="flex items-center gap-2 text-sm text-navy-500"><Award className="w-4 h-4 text-teal-600" /> CPD hours</dt><dd className="text-sm font-semibold text-navy-800">{course.cpdHours}</dd></div>
                  <div className="flex items-center justify-between gap-4 border-b border-navy-100 pb-4"><dt className="flex items-center gap-2 text-sm text-navy-500"><Signal className="w-4 h-4 text-teal-600" /> Level</dt><dd className="text-sm font-semibold text-navy-800">{course.level}</dd></div>
                  <div className="flex items-center justify-between gap-4"><dt className="flex items-center gap-2 text-sm text-navy-500"><Monitor className="w-4 h-4 text-teal-600" /> Format</dt><dd className="text-sm font-semibold text-navy-800">Online</dd></div>
                </dl>
                <Link to="/contact" className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-clinical-600 px-5 py-3 text-sm font-semibold text-white hover:bg-clinical-700 transition-colors">Ask about this course <ArrowRight className="w-4 h-4" /></Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
