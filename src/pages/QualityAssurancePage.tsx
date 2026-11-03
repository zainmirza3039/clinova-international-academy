import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

const publicPolicyAreas = [
  'Quality assurance and accountability',
  'Assessment and examination',
  'Complaints and appeals',
  'Impartiality and conflicts of interest',
  'Data protection and privacy',
  'Credential renewal, suspension and withdrawal',
];

export default function QualityAssurancePage() {
  useSEO({ title: 'Quality assurance and governance', description: 'Clinova quality assurance and governance policy publication status.', noindex: true });
  return (
    <>
      <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Quality assurance' }]} eyebrow="Quality and governance" title="Policies must be approved before they become rules" description="Clinova is preparing separate public policies and restricted internal quality records for its education and certification services." />
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="border border-amber-300 bg-amber-50 p-5" role="status"><p className="font-semibold text-navy-900">No certification policy is currently approved for use</p><p className="mt-2 text-sm leading-relaxed text-navy-700">This page does not create candidate obligations, assessment rules, complaint deadlines or accreditation claims. Privacy and other legal-policy placeholders remain pending owner review.</p></div>
          <h2 className="mt-9 font-heading text-2xl font-bold text-navy-900">Public policy areas under development</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{publicPolicyAreas.map((policy) => <article key={policy} className="rounded-xl border border-navy-100 bg-surface-50 p-5"><ShieldCheck className="h-5 w-5 text-clinical-700" aria-hidden="true" /><h3 className="mt-3 font-semibold text-navy-900">{policy}</h3><p className="mt-2 text-xs font-semibold text-amber-800">Not published as an operative policy</p></article>)}</div>
          <p className="mt-8 max-w-4xl text-sm leading-relaxed text-navy-600">Internal controlled documents—such as manuals, procedures, internal audit reports, corrective-action records, assessor competence records, management reviews and scheme reviews—are not published here. Any future access must be restricted to the assigned role and audited.</p>
          <Link to="/certification/policies" className="mt-7 inline-flex items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4">View certification policy development <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  );
}
