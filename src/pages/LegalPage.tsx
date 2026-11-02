import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import type { BreadcrumbItem } from '@/components/Breadcrumbs';

interface LegalPageProps {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  publicationStatus: 'approval-required' | 'approved';
  sections: { heading: string; content: string }[];
}

export default function LegalPage({ title, description, breadcrumb, publicationStatus, sections }: LegalPageProps) {
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
          {publicationStatus === 'approval-required' ? (
            <div role="status" aria-label="Policy approval status" className="rounded-xl border border-amber-300 bg-amber-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-900">Approval required</p>
              <h2 className="mt-3 font-heading text-xl font-bold text-navy-900">No approved policy text is available</h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-700">This page is a placeholder, not an operative policy.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 className="font-heading text-xl font-bold text-navy-900 mb-3">{section.heading}</h2>
                  <p className="whitespace-pre-line text-sm text-navy-600 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
