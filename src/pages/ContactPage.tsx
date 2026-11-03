import { Link } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { ArrowRight, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { academyLegalIdentity, academyPakistanAgentPhone } from '@/data/publicContact';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [website, setWebsite] = useState('');
  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (website.trim()) { setFormSuccess(true); return; }
    setSubmitting(true); setFormError(''); setFormSuccess(false);
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: String(form.get('name') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim() || null,
        enquiry_type: String(form.get('enquiry_type') ?? 'General enquiry'),
        subject: String(form.get('subject') ?? '').trim(),
        message: String(form.get('message') ?? '').trim(),
      });
      if (error) throw error;
      setFormSuccess(true); formElement.reset();
    } catch { setFormError('Your message could not be submitted. Please try again later or use the contact number shown on this page.'); }
    finally { setSubmitting(false); }
  }
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
                The registered office is a virtual address, not a campus, visiting location, or public-facing venue. Use the enquiry form for programme, teaching and institutional questions.
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
              <form onSubmit={submitEnquiry} className="mt-10 border border-navy-200 bg-surface-50 p-6 sm:p-8" aria-labelledby="contact-enquiry-heading">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Send an enquiry</p>
                <h3 id="contact-enquiry-heading" className="mt-2 font-heading text-xl font-bold text-navy-900">How can the academy help?</h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-navy-800">Full name<input name="name" required maxLength={160} autoComplete="name" className="min-h-11 border border-navy-200 bg-white px-3 py-2 font-normal" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-navy-800">Email address<input name="email" required type="email" maxLength={320} autoComplete="email" className="min-h-11 border border-navy-200 bg-white px-3 py-2 font-normal" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-navy-800">Phone (optional)<input name="phone" type="tel" maxLength={80} autoComplete="tel" className="min-h-11 border border-navy-200 bg-white px-3 py-2 font-normal" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-navy-800">Enquiry type<select name="enquiry_type" required className="min-h-11 border border-navy-200 bg-white px-3 py-2 font-normal"><option>General enquiry</option><option>CPD programme</option><option>Institutional partnership</option><option>Instructor enquiry</option><option>Technical support</option></select></label>
                  <label className="grid gap-2 text-sm font-semibold text-navy-800 sm:col-span-2">Subject<input name="subject" required maxLength={200} className="min-h-11 border border-navy-200 bg-white px-3 py-2 font-normal" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-navy-800 sm:col-span-2">Message<textarea name="message" required rows={5} maxLength={5000} className="border border-navy-200 bg-white px-3 py-2 font-normal" /></label>
                  <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></label>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-navy-500">Do not include patient information, medical records, identity documents, passwords or payment details. Your message will be stored securely so the academy can respond.</p>
                {formError && <p role="alert" className="mt-4 text-sm text-red-800">{formError}</p>}
                {formSuccess && <p role="status" className="mt-4 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Your enquiry has been received. Thank you for contacting Clinova.</p>}
                <button type="submit" disabled={submitting} className="mt-5 inline-flex min-h-11 items-center gap-2 bg-navy-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Sending…' : 'Send enquiry'} <ArrowRight className="h-4 w-4" /></button>
              </form>
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
