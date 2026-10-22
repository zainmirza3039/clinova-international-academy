import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Programme } from '@/data/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function ProgrammeCard({ programme, index = 0 }: { programme: Programme; index?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <Link to={`/programmes/${programme.slug}`} ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} group flex flex-col`} style={{ transitionDelay: `${(index % 3) * 80}ms` }}>
      <div className="relative aspect-[16/9] overflow-hidden bg-navy-100">
        <img src={programme.image} alt={programme.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute top-0 left-0 bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 inline-flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Proposed draft</div>
      </div>
      <div className="flex flex-col flex-1 pt-5">
        <div className="flex items-center gap-3 text-xs mb-2"><span className="font-medium text-clinical-500">{programme.category}</span><span className="text-navy-400">/</span><span className="text-navy-500">{programme.department}</span></div>
        <h3 className="font-heading font-bold text-navy-800 text-lg leading-snug group-hover:text-clinical-600 transition-colors">{programme.title}</h3>
        <p className="mt-2 text-sm text-navy-600/70 line-clamp-2 leading-relaxed flex-1">{programme.description}</p>
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">Draft outline only · delivery, dates, fees, CPD hours and certificates await confirmation.</div>
        <div className="mt-4 pt-4 border-t border-navy-100 flex items-center justify-between"><span className="text-xs text-navy-400">{programme.level}</span><span className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 group-hover:text-clinical-600 transition-colors">View draft <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span></div>
      </div>
    </Link>
  );
}
