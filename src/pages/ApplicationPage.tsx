import { ArrowRight, ClipboardList, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

export default function ApplicationPage() {
  useSEO({
    title: 'Application Information',
    description: 'Information about discussing a learning interest with Clinova International Academy.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Admissions', to: '/admissions' }, { label: 'Application Information' }]}
        eyebrow="Admissions"
        title="Discuss your learning interests"
        description="Review the learning resources first, then contact Clinova in writing if you have a question about a specific subject or future learning opportunity."
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600 mb-4">Before you enquire</p>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800">Prepare a clear, focused enquiry</h2>
              <p className="mt-5 text-base text-navy-600 leading-relaxed">
                Include the subject or learning guide you are asking about, your main question and the best way to reply if you choose to provide it. Do not send patient details, medical records, identity documents, passwords or payment information.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Identify the topic or learning guide you are interested in.',
                  'Ask for written details before making a payment or commitment.',
                  'Check any entry requirements, delivery terms, fees and recognition claims in writing.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-navy-700">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-teal-600 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="mt-9 inline-flex items-center gap-2 bg-clinical-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-clinical-700">
                Contact information<ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <aside className="lg:col-span-5">
              <div className="bg-navy-800 p-7 text-white">
                <ClipboardList className="w-6 h-6 text-teal-300 mb-5" aria-hidden="true" />
                <h2 className="font-heading text-xl font-bold">Application status</h2>
                <p className="mt-3 text-sm leading-relaxed text-navy-100/75">
                  Online applications and payment processing are not available through this website. This page does not collect or submit application information.
                </p>
                <div className="mt-6 border-t border-white/15 pt-5 flex gap-3">
                  <Mail className="w-5 h-5 shrink-0 text-teal-300" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-navy-100/75">For written correspondence, use the public postal address on the Contact page.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
