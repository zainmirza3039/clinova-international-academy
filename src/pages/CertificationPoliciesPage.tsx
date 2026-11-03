import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';
import { certificationDevelopmentAreas } from '@/data/certificationDrafts';

export default function CertificationPoliciesPage() {
  useSEO({
    title: 'Certification policy development',
    description: 'Status of Clinova certification policy development. No certification rules are currently active.',
    noindex: true,
  });
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Professional certification', to: '/certification' }, { label: 'Policy development' }]}
        eyebrow="Policy index"
        title="Certification policies are in development"
        description="The headings below are work areas only. They are not approved policies, scheme rules or candidate instructions."
      />
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 border-l-4 border-amber-500 bg-amber-50 p-5 text-sm leading-relaxed text-navy-800" role="status">
            No candidate, examination, assessment, certification, appeal, renewal, suspension, withdrawal or verification policy is currently approved for use. No application or certification decision may be made from this page.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {certificationDevelopmentAreas.map((area) => (
              <article key={area.id} className="rounded-xl border border-navy-100 bg-surface-50 p-5">
                <div className="flex items-start gap-3">
                  <ClipboardList className="mt-1 h-5 w-5 shrink-0 text-clinical-700" aria-hidden="true" />
                  <div>
                    <h2 className="font-heading text-lg font-bold text-navy-900">{area.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-navy-600">{area.detail}</p>
                    <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800">Draft — not approved</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Link to="/certification" className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clinical-600">Return to certification overview <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  );
}
