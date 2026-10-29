import Breadcrumbs, { type BreadcrumbItem } from './Breadcrumbs';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  image?: string;
}

export default function PageHero({ eyebrow, title, description, breadcrumbs, image }: PageHeroProps) {
  return (
    <section className="page-hero relative bg-navy-800 overflow-hidden">
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" className="w-full h-full object-cover opacity-20" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-800 via-navy-800/95 to-navy-800/70" />
        </div>
      )}
      <div className="page-hero__inner relative max-w-editorial mx-auto px-6 lg:px-10 py-12 md:py-20 lg:py-28">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        {eyebrow && (
          <div className="page-hero__eyebrow text-xs font-semibold uppercase tracking-[0.18em] text-teal-400 mb-4">{eyebrow}</div>
        )}
        <h1 className="page-hero__title font-heading text-[1.75rem] md:text-3xl lg:text-[2.75rem] font-bold text-white leading-[1.15] max-w-3xl text-balance">
          {title}
        </h1>
        <p className="mt-5 text-base md:text-lg text-navy-100/70 leading-[1.65] max-w-xl">{description}</p>
      </div>
    </section>
  );
}
