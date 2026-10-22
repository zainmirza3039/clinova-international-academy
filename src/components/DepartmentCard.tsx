import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Department } from '@/data/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function DepartmentCard({ department, index = 0 }: { department: Department; index?: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Link
      to={`/departments/${department.slug}`}
      ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} group block`}
      style={{ transitionDelay: `${(index % 4) * 70}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-100">
        <img
          src={department.image}
          alt={department.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading font-bold text-navy-800 text-lg leading-snug group-hover:text-clinical-600 transition-colors">
            {department.name}
          </h3>
          <span className="text-xs font-medium text-clinical-500 shrink-0 tabular-nums">
            Study area
          </span>
        </div>
        <p className="mt-2 text-sm text-navy-600/70 line-clamp-2 leading-relaxed">{department.description}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-navy-700 group-hover:text-clinical-600 transition-colors">
          Explore
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
