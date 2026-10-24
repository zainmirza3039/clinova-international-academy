import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import type { Programme } from '@/data/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function ProgrammeCard({ programme, index = 0 }: { programme: Programme; index?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <Link
      to={`/programmes/${programme.slug}`}
      ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      className={`animate-on-scroll group flex h-full flex-col overflow-hidden rounded-xl border border-navy-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:ring-offset-4 ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${(index % 3) * 70}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
        <img
          src={programme.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy-800 shadow-sm">
          <BookOpen className="h-3.5 w-3.5 text-clinical-700" aria-hidden="true" />
          {programme.category}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-clinical-700">{programme.department}</p>
        <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-clinical-700">
          {programme.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-navy-600">{programme.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-navy-100 pt-4">
          <span className="rounded-full bg-surface-50 px-3 py-1 text-xs font-medium text-navy-600">{programme.level} level</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-clinical-700">
            Read guide <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 border-l-2 border-amber-400 pl-3 text-xs leading-5 text-navy-600">
          Self-study resource. No enrolment, accredited award or CPD credit is implied.
        </p>
      </div>
    </Link>
  );
}
