import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}

export default function SectionHeader({ eyebrow, title, description, center = false }: SectionHeaderProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} ${center ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'} mb-12 lg:mb-16`}
    >
      {eyebrow && (
        <div className={`text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4 ${center ? '' : ''}`}>
          {eyebrow}
        </div>
      )}
      <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base md:text-[1.0625rem] text-navy-600/80 leading-[1.65]">
          {description}
        </p>
      )}
    </div>
  );
}
