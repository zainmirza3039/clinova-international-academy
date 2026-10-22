import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, MessageSquare, ShieldCheck } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { academyPublicAddress } from '@/data/publicContact';

export default function ContactPage() {
  useSEO({
    title: 'Contact Clinova International Academy',
    description: 'Contact information and guidance for written enquiries to Clinova International Academy.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        eyebrow="Contact"
        title="Contact Clinova International Academy"
        description="For general correspondence or questions about the learning library, use the public postal address below."
        image="https://images.pexels.com/photos/4269271/pexels-photo-4269271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600 mb-4">Written correspondence</p>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800">Send a clear, focused enquiry</h2>
              <p className="mt-5 text-base text-navy-600 leading-relaxed">
                Include the topic or page you are asking about and explain the information you need. Ask for written terms before making a payment or relying on any course, accreditation, CPD or certificate claim.
              </p>
              <div className="mt-8 flex items-start gap-4 border-t border-navy-200 pt-6">
                <ShieldCheck className="w-5 h-5 shrink-0 text-teal-600 mt-0.5" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-navy-600">
                  Do not send patient information, medical records, identity documents, passwords or payment card details in general correspondence.
                </p>
              </div>
              <Link to="/faqs" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 hover:text-clinical-600">
                Read frequently asked questions<ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <aside className="lg:col-span-5">
              <div className="bg-navy-800 p-8 text-white">
                <MapPin className="w-6 h-6 text-teal-300 mb-5" aria-hidden="true" />
                <h2 className="font-heading text-xl font-bold mb-4">Postal address</h2>
                <address className="not-italic text-sm leading-relaxed text-navy-100/85">{academyPublicAddress}</address>
                <p className="mt-5 border-t border-white/15 pt-5 text-sm leading-relaxed text-navy-100/70">
                  This address is provided for written correspondence. Visiting arrangements and opening hours are not published.
                </p>
              </div>
              <div className="mt-6 border border-navy-200 p-6">
                <MessageSquare className="w-5 h-5 text-clinical-600 mb-3" aria-hidden="true" />
                <h3 className="font-heading font-semibold text-navy-800">Online submissions</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  Online contact and partnership submissions are not currently available. This page does not send or store a message.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
