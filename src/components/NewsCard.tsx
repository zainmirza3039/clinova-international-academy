import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import type { NewsItem } from '@/data/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { formatResourceDate, isValidIsoDate } from '@/lib/resourceDate';

export default function NewsCard({ item, index = 0 }: { item: NewsItem; index?: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Link
      to={`/resources/${item.slug}`}
      ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
      className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} group flex flex-col`}
      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-navy-100">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="flex flex-col flex-1 pt-5">
        <div className="flex items-center gap-3 text-xs mb-2">
          <span className="font-medium text-clinical-500">{item.category}</span>
          <span className="text-navy-400">/</span>
          {isValidIsoDate(item.date) ? (
            <time dateTime={item.date} className="flex items-center gap-1 text-navy-500">
              <Calendar className="w-3.5 h-3.5" /> {formatResourceDate(item.date)}
            </time>
          ) : (
            <span className="flex items-center gap-1 text-navy-500">
              <Calendar className="w-3.5 h-3.5" /> {formatResourceDate(item.date)}
            </span>
          )}
        </div>
        <h3 className="font-heading font-bold text-navy-800 text-base leading-snug group-hover:text-clinical-600 transition-colors line-clamp-2">
          {item.title}
        </h3>
        <p className="mt-2 text-sm text-navy-600/70 line-clamp-3 leading-relaxed flex-1">{item.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-navy-700 group-hover:text-clinical-600 transition-colors">
          Read More
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
