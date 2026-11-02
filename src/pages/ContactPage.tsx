import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { academyLegalIdentity, academyPakistanAgentPhone } from '@/data/publicContact';

export default function ContactPage() {
  useSEO({
    title: 'Contact Clinova International Academy',
    description: 'Owner-confirmed legal identity details and registered virtual office for Clinova International Academy Ltd.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        eyebrow="Contact details"
        title="Contact Clinova International Academy"
        description="Owner-confirmed legal identity and registered virtual office details. This is not a campus, visiting location, or public-facing venue."
        image="https://images.pexels.com/photos/4269271/pexels-photo-4269271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600 mb-4">Legal identity</p>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800">{academyLegalIdentity.legalName}</h2>
              <p className="mt-5 text-base text-navy-600 leading-relaxed">
                The registered office is a virtual address, not a campus, visiting location, or public-facing venue. No verified public email address or online enquiry submission is available.
              </p>
              <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Acronym</dt><dd className="mt-1 text-sm font-semibold text-navy-800">{academyLegalIdentity.acronym}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Company number</dt><dd className="mt-1 text-sm font-semibold text-navy-800">{academyLegalIdentity.companyNumber}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Date of incorporation</dt><dd className="mt-1 text-sm font-semibold text-navy-800"><time dateTime={academyLegalIdentity.incorporationDate}>14 October 2025</time></dd></div>
              </dl>
              <div className="mt-8 flex items-start gap-4 border-t border-navy-200 pt-6">
                <ShieldCheck className="w-5 h-5 shrink-0 text-teal-600 mt-0.5" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-navy-600">
                  Do not include patient information, medical records, identity documents, passwords or payment card details in general correspondence.
                </p>
              </div>
              <Link to="/faqs" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 hover:text-clinical-600">
                Read frequently asked questions<ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <aside className="lg:col-span-5 space-y-6" aria-label="Contact information">
              <section className="bg-navy-800 p-8 text-white">
                <MapPin className="w-6 h-6 text-teal-300 mb-5" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">{academyLegalIdentity.registeredOfficeLabel}</p>
                <h2 className="font-heading text-xl font-bold mt-2 mb-4">Registered office</h2>
                <address className="not-italic text-sm leading-relaxed text-navy-100/85">{academyLegalIdentity.registeredOfficeAddress}</address>
                <p className="mt-5 border-t border-white/15 pt-5 text-sm leading-relaxed text-navy-100/70">
                  {academyLegalIdentity.registeredOfficeNotice} Visiting arrangements are not provided.
                </p>
              </section>
              <section className="border border-navy-200 p-6" aria-labelledby="secondary-phone-heading">
                <Phone className="w-5 h-5 text-clinical-600 mb-3" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clinical-700">Optional secondary phone · Pakistan local agent</p>
                <h2 id="secondary-phone-heading" className="font-heading font-semibold text-navy-800 mt-2">Phone</h2>
                <a href={`tel:${academyPakistanAgentPhone.replace(/[^+\d]/g, '')}`} className="mt-1 inline-block text-base font-semibold text-navy-800 underline underline-offset-4 hover:text-clinical-700">
                  {academyPakistanAgentPhone}
                </a>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
