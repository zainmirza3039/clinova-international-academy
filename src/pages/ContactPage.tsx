import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, MessageSquare, GraduationCap, Handshake } from 'lucide-react';
import { enquiriesEnabled, enquiryUnavailable } from '@/lib/siteConfig';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { validateFormFields } from '@/lib/formValidation';
import { academyPublicAddress } from '@/data/publicContact';

const enquiryTypes = ['General Enquiry', 'Academic Enquiry', 'Partnership Enquiry', 'Technical Support'];

const contactCards = [
  { icon: MessageSquare, title: 'General Enquiries', email: '', desc: 'Questions about our academy, programmes or services.' },
  { icon: GraduationCap, title: 'Academic Enquiries', email: '', desc: 'Questions about specific programmes or enrolment.' },
  { icon: Handshake, title: 'Partnership Enquiries', email: '', desc: 'Interested in becoming a training partner.' },
];

export default function ContactPage() {
  useSEO({
    title: 'Contact Clinova International Academy',
    description: 'Confirmed public contact information for Clinova International Academy. Online enquiry submission is not currently available.',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!enquiriesEnabled) { setError(enquiryUnavailable); return; }
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
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) throw new Error('Public submissions unavailable.');
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
      setError('We could not send your message. Nothing was confirmed; please try again later.');
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
        description="The confirmed public address is listed below. Email channels and online form submission are not currently available; do not assume a message has been sent through this website."
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
                <p className="text-sm text-navy-600">Email channel awaiting academy confirmation.</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Contact Form */}
            <div className="lg:col-span-7">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800 mb-8 leading-[1.15] text-balance">
                Online enquiry submission is unavailable
              </h2>
              {submitted ? (
                <div role="status" aria-live="polite" className="text-center py-16 bg-teal-50 border border-teal-100">
                  <CheckCircle className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-bold text-navy-800 mb-2">Message Sent</h3>
                  <p className="text-sm text-navy-600">Your enquiry was accepted. Response arrangements are awaiting academy confirmation.</p>
                </div>
              ) : enquiriesEnabled ? (
                <form aria-label="Contact enquiry" onSubmit={handleSubmit} className="space-y-5 bg-surface-50 p-6 md:p-8 border border-navy-100">
                  
                  {error && <p role="alert" aria-live="assertive" className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{error}</p>}
                  <p className="text-sm text-navy-700">Do not include patient information, medical records, passwords or payment details. Read the <Link to="/privacy-policy" className="underline text-clinical-600">draft privacy policy</Link>. No delivery or response time is promised.</p>
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
                    disabled={submitting || !enquiriesEnabled}
                    className="w-full px-6 py-3.5 bg-clinical-500 text-white font-semibold hover:bg-clinical-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              ) : (
                <div role="status" aria-live="polite" className="border border-navy-100 bg-surface-50 p-6 md:p-8">
                  <h3 className="font-heading text-lg font-bold text-navy-900">Enquiry service unavailable</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-700">{enquiryUnavailable} The form is hidden so you cannot enter details that this website cannot submit. No message has been sent.</p>
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-navy-800 p-8 text-white">
                <h2 className="font-heading text-xl font-bold mb-6">Contact Details</h2>
                <div className="space-y-5">
                  <div>
                    <div className="text-xs text-navy-100/80 mb-1">Public academy address</div>
                    <address className="not-italic text-sm leading-relaxed">{academyPublicAddress}</address>
                    <p className="mt-2 text-xs text-navy-100/80">Visiting arrangements and opening hours have not been confirmed.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-navy-100/50 mb-1">Email</div>
                      <p className="text-sm">Awaiting academy confirmation</p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-5">
                    <div className="text-xs text-navy-100/60 mb-1">Response times</div>
                    <div className="text-sm text-navy-100/80">Response arrangements are awaiting academy confirmation.</div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-50 p-6 border border-navy-100">
                <h3 className="font-heading font-semibold text-navy-800 text-sm mb-3">Response Times</h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  <li>General enquiries: to be confirmed</li>
                  <li>Academic enquiries: to be confirmed</li>
                  <li>Partnership enquiries: to be confirmed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
