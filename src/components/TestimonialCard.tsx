import type { Testimonial } from '@/data/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function TestimonialCard({ testimonial, index = 0 }: { testimonial: Testimonial; index?: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} relative flex flex-col h-full`}
      style={{ transitionDelay: `${(index % 4) * 80}ms` }}
    >
      <div className="text-5xl font-editorial text-teal-500/40 leading-none mb-2">&ldquo;</div>
      <p className="font-editorial text-lg text-navy-800 leading-[1.55] flex-1">
        {testimonial.quote}
      </p>
      <div className="mt-6 pt-5 border-t border-navy-100">
        <div className="text-sm font-semibold text-navy-800">{testimonial.role}</div>
        <div className="text-xs text-navy-500 mt-0.5">{testimonial.country}</div>
      </div>
      {testimonial.isDemo && (
        <div className="mt-3">
          <span className="inline-block text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 font-medium">
            Sample testimonial
          </span>
        </div>
      )}
    </div>
  );
}
