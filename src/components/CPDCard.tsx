import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CPDCourse } from '@/data/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function CPDCard({ course, index = 0 }: { course: CPDCourse; index?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <Link to={`/cpd-courses/${course.slug}`} ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} group flex flex-col`} style={{ transitionDelay: `${(index % 4) * 60}ms` }}>
      <div className="relative aspect-[16/9] overflow-hidden bg-navy-100">
        <img src={course.image} alt={course.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs font-semibold px-3 py-1.5">Proposed</div>
      </div>
      <div className="flex flex-col flex-1 pt-5">
        <div className="text-xs text-navy-500 mb-2">{course.department}</div>
        <h3 className="font-heading font-bold text-navy-800 text-base leading-snug group-hover:text-clinical-600 transition-colors">{course.title}</h3>
        <p className="mt-2 text-sm text-navy-600/70 line-clamp-2 leading-relaxed flex-1">{course.description}</p>
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">Details unconfirmed: CPD hours, dates, fees, delivery and certification.</div>
        <div className="mt-4 pt-3 border-t border-navy-100 flex items-center justify-between"><span className="text-xs text-navy-500">{course.level}</span><span className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 group-hover:text-clinical-600 transition-colors">View outline <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span></div>
      </div>
    </Link>
  );
}
