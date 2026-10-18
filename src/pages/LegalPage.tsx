import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import type { BreadcrumbItem } from '@/components/Breadcrumbs';

interface LegalPageProps {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  sections: { heading: string; content: string }[];
}

export default function LegalPage({ title, description, breadcrumb, sections }: LegalPageProps) {
  useSEO({ title, description });

  return (
    <>
      <PageHero
        breadcrumbs={breadcrumb}
        eyebrow="Legal"
        title={title}
        description={description}
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="font-heading text-xl font-bold text-navy-900 mb-3">{section.heading}</h2>
                <p className="text-sm text-navy-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-navy-600 leading-relaxed">
              This is placeholder legal content prepared for demonstration purposes. It must be reviewed and approved by
              a qualified legal professional before publication. Clinova International Academy does not guarantee the
              accuracy or completeness of this content.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
