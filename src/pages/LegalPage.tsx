import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import type { BreadcrumbItem } from '@/components/Breadcrumbs';

interface LegalPageProps {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  sections: { heading: string; content: string }[];
}

const publicationNotice =
  'This policy has not yet been published. The academy is confirming its legal identity, operational practices and applicable terms before making this information available. Do not submit personal information or make payments through a service that has not been explicitly enabled.';

export default function LegalPage({ title, breadcrumb }: LegalPageProps) {
  useSEO({ title, description: publicationNotice });

  return (
    <>
      <PageHero
        breadcrumbs={breadcrumb}
        eyebrow="Policy information"
        title={title}
        description={publicationNotice}
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div role="status" aria-live="polite" className="rounded-lg border border-navy-200 bg-surface-50 p-6 md:p-8">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-3">Policy not yet available</h2>
            <p className="text-sm text-navy-600 leading-relaxed">{publicationNotice}</p>
          </div>
        </div>
      </section>
    </>
  );
}
