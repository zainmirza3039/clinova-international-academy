import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

export default function CertificationApplicationPage() {
  useSEO({
    title: 'Professional certification applications',
    description: 'Clinova professional certification applications are not open. No applicant information is collected on this page.',
    noindex: true,
  });
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Professional certification', to: '/certification' }, { label: 'Application status' }]}
        eyebrow="Candidate information"
        title="Certification applications are not open"
        description="Clinova is developing a separate professional certification process. No certification scheme is currently accepting candidates."
      />
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="border border-amber-300 bg-amber-50 p-6 md:p-8" role="status">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy-900">No application form or candidate service is connected</h2>
                <p className="mt-3 leading-relaxed text-navy-700">This page does not accept applications, identity documents, qualifications, professional registration details, clinical records, assessment evidence or payment. Please do not email or upload confidential candidate or patient information.</p>
                <p className="mt-3 leading-relaxed text-navy-700">Eligibility, assessment, decision, certificate and renewal rules must be approved for a specific scheme before applications can open.</p>
              </div>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link to="/certification" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">Review certification status <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">Contact information</Link>
          </div>
        </div>
      </section>
    </>
  );
}
