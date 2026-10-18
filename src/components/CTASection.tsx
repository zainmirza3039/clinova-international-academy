import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface CTASectionProps {
  title: string;
  description: string;
  primaryCTA: { label: string; to: string };
  secondaryCTA?: { label: string; to: string };
  variant?: 'navy' | 'teal' | 'clinical';
}

export default function CTASection({ title, description, primaryCTA, secondaryCTA, variant = 'navy' }: CTASectionProps) {
  const { ref, isVisible } = useScrollAnimation();

  const bgClasses = {
    navy: 'bg-navy-800',
    teal: 'bg-teal-500',
    clinical: 'bg-clinical-500',
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-editorial mx-auto px-6 lg:px-10">
        <div
          ref={ref}
          className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} ${bgClasses[variant]} px-8 py-14 md:px-16 md:py-20`}
        >
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white leading-[1.2] text-balance">
              {title}
            </h2>
            <p className="mt-4 text-base text-white/70 leading-[1.65] max-w-lg">{description}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={primaryCTA.to}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-navy-800 font-semibold hover:bg-surface-50 transition-colors"
              >
                {primaryCTA.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {secondaryCTA && (
                <Link
                  to={secondaryCTA.to}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent text-white font-semibold border border-white/30 hover:bg-white/10 transition-colors"
                >
                  {secondaryCTA.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
