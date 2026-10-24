import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { CPDCourse } from '@/data/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function CPDCard({ course, index = 0 }: { course: CPDCourse; index?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <Link
      to={`/cpd-courses/${course.slug}`}
      ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_45px_-28px_rgba(8,43,76,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 animate-on-scroll ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${(index % 4) * 60}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-50">
        <img
          src={course.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-navy-800 shadow-sm">
          <BookOpen className="h-3.5 w-3.5 text-teal-700" />
          Learning guide
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-800">{course.department}</div>
        <h3 className="mt-2 font-heading text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-teal-800">{course.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600 line-clamp-3">{course.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-navy-100 pt-4">
          <span className="rounded-full bg-surface-50 px-3 py-1.5 text-xs font-medium text-navy-600">{course.level}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 transition-colors group-hover:text-teal-800">
            View guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-navy-500">Accreditation, CPD hours and course availability are confirmed separately.</p>
      </div>
    </Link>
  );
}
