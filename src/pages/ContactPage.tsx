import { useRef, useState } from 'react';
import { Mail, CheckCircle, MessageSquare, GraduationCap, Handshake } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { validateFormFields } from '@/lib/formValidation';

const enquiryTypes = ['General Enquiry', 'Academic Enquiry', 'Partnership Enquiry', 'Technical Support'];

const contactCards = [
  { icon: MessageSquare, title: 'General Enquiries', email: 'info@clinovaacademy.co.uk', desc: 'Questions about our academy, programmes or services.' },
  { icon: GraduationCap, title: 'Academic Enquiries', email: 'academic@clinovaacademy.co.uk', desc: 'Questions about specific programmes or enrolment.' },
  { icon: Handshake, title: 'Partnership Enquiries', email: 'partnerships@clinovaacademy.co.uk', desc: 'Interested in becoming a training partner.' },
];

export default function ContactPage() {
  useSEO({
    title: 'Contact Clinova International Academy',
    description: 'Get in touch with Clinova International Academy. General, academic and partnership enquiries welcome.',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    const form = e.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    setError('');

    const { values, error: validationError } = validateFormFields(
      Object.fromEntries(formData.entries()),
      {
        name: { required: true, maxLength: 160 },
        email: { required: true, maxLength: 320, kind: 'email' },
        phone: { maxLength: 80 },
        subject: { required: true, maxLength: 200 },
        enquiryType: { required: true, maxLength: 80 },
        message: { required: true, maxLength: 5000 },
      },
    );
    if (validationError) {
      setError(validationError);
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    try {
      const { error: submissionError } = await supabase.from('contact_submissions').insert({
        name: values.name,
        email: values.email,
        phone: values.phone,
        subject: values.subject,
        enquiry_type: values.enquiryType,
        message: values.message,
      });
      if (submissionError) throw submissionError;
      form.reset();
      setSubmitted(true);
    } catch {
      setError('We could not send your message. Please try again or email us directly.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 text-sm bg-white border border-navy-200 focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:border-transparent text-navy-800 placeholder:text-navy-400';
  const labelClass = 'block text-sm font-medium text-navy-700 mb-1.5';

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        eyebrow="Contact"
        title="Contact Clinova International Academy"
        description="We're here to help. Whether you have a general question, an academic enquiry or are interested in partnering with us, we'd love to hear from you."
        image="https://images.pexels.com/photos/4269271/pexels-photo-4269271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          {/* Contact type cards — editorial, border-top style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10 mb-16">
            {contactCards.map((card) => (
              <div key={card.title} className="border-t border-navy-200 pt-6">
                <card.icon className="w-5 h-5 text-teal-500 mb-4" strokeWidth={1.5} />
                <h3 className="font-heading font-bold text-navy-800 text-base mb-2">{card.title}</h3>
                <p className="text-sm text-navy-600/70 leading-relaxed mb-3">{card.desc}</p>
                <a href={`mailto:${card.email}`} className="text-sm font-semibold text-clinical-600 hover:text-clinical-700 transition-colors">
                  {card.email}
                </a>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Contact Form */}
            <div className="lg:col-span-7">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800 mb-8 leading-[1.15] text-balance">
                Send us a message
              </h2>
              {submitted ? (
                <div role="status" aria-live="polite" className="text-center py-16 bg-teal-50 border border-teal-100">
                  <CheckCircle className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-bold text-navy-800 mb-2">Message Sent</h3>
                  <p className="text-sm text-navy-600">Thank you for contacting Clinova. Our team will respond to your enquiry shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 bg-surface-50 p-6 md:p-8 border border-navy-100">
                  {error && <p role="alert" aria-live="assertive" className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{error}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="name">Name *</label>
                      <input id="name" name="name" type="text" required maxLength={160} className={inputClass} placeholder="Your name" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="email">Email *</label>
                      <input id="email" name="email" type="email" required maxLength={320} className={inputClass} placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="phone">Phone</label>
                      <input id="phone" name="phone" type="tel" maxLength={80} className={inputClass} placeholder="Phone number" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="subject">Subject *</label>
                      <input id="subject" name="subject" type="text" required maxLength={200} className={inputClass} placeholder="Subject" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="enquiryType">Enquiry Type *</label>
                    <select id="enquiryType" name="enquiryType" required className={inputClass} defaultValue="">
                      <option value="" disabled>Select enquiry type</option>
                      {enquiryTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="message">Message *</label>
                    <textarea id="message" name="message" required maxLength={5000} rows={5} className={inputClass} placeholder="Your message..." />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3.5 bg-clinical-500 text-white font-semibold hover:bg-clinical-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-navy-800 p-8 text-white">
                <h2 className="font-heading text-xl font-bold mb-6">Contact Details</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-navy-100/50 mb-1">Email</div>
                      <a href="mailto:info@clinovaacademy.co.uk" className="text-sm font-medium hover:text-teal-400 transition-colors">
                        info@clinovaacademy.co.uk
                      </a>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-5">
                    <div className="text-xs text-navy-100/60 mb-1">Response times</div>
                    <div className="text-sm text-navy-100/80">We aim to respond within two business days.</div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-50 p-6 border border-navy-100">
                <h3 className="font-heading font-semibold text-navy-800 text-sm mb-3">Response Times</h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  <li>General enquiries: within 2 business days</li>
                  <li>Academic enquiries: within 3 business days</li>
                  <li>Partnership enquiries: within 5 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
