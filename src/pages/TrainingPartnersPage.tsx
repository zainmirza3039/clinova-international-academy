import { useRef, useState } from 'react';
import { CheckCircle, Handshake, Users, FileText, Award, ShieldCheck } from 'lucide-react';
import { enquiriesEnabled, enquiryUnavailable } from '@/lib/siteConfig';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import SectionHeader from '@/components/SectionHeader';
import Reveal from '@/components/Reveal';
import { validateFormFields } from '@/lib/formValidation';

const benefits = [
  { icon: FileText, title: 'Share your context', desc: 'Describe your organisation, audience and learning questions.' },
  { icon: Users, title: 'Discuss learner needs', desc: 'Explain the support and access arrangements you would need.' },
  { icon: Award, title: 'Ask about recognition', desc: 'Request accurate information; certificates and recognition are not promised.' },
  { icon: FileText, title: 'Review draft resources', desc: 'Use the existing reading library to frame a possible conversation.' },
  { icon: ShieldCheck, title: 'Clarify review', desc: 'Ask what has been reviewed, approved or published.' },
  { icon: Handshake, title: 'Consider terms', desc: 'Discuss any partnership only after the owner confirms capability and terms.' },
];

const howItWorks = [
  { step: '01', title: 'Share an enquiry', desc: 'Use the form to describe your organisation and learning context.' },
  { step: '02', title: 'Request confirmation', desc: 'Ask which content, delivery and support arrangements are actually available.' },
  { step: '03', title: 'Review terms', desc: 'Consider any written scope, responsibilities, privacy and commercial terms.' },
  { step: '04', title: 'Decide cautiously', desc: 'Do not assume a partnership, programme, certificate or outcome until confirmed.' },
];

const whoCanApply = [
  'Healthcare organisations and clinics',
  'Professional associations and societies',
  'Educational institutions',
  'Corporate healthcare providers',
  'NGOs and non-profit health organisations',
  'Government health departments',
];

export default function TrainingPartnersPage() {
  useSEO({
    title: 'Training Partners',
    description:
      'Discuss a possible training partnership. Share a possible education enquiry; partnership capabilities and terms are not yet confirmed.',
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
        fullName: { required: true, maxLength: 160 },
        organisation: { required: true, maxLength: 200 },
        role: { required: true, maxLength: 160 },
        email: { required: true, maxLength: 320, kind: 'email' },
        phone: { maxLength: 80 },
        country: { required: true, maxLength: 120 },
        website: { maxLength: 500, kind: 'url' },
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
      if (!supabase) throw new Error('Supabase is not configured');
      const { error: submissionError } = await supabase.from('partnership_inquiries').insert({
        full_name: values.fullName,
        organisation: values.organisation,
        role: values.role,
        email: values.email,
        phone: values.phone,
        country: values.country,
        website: values.website,
        message: values.message,
      });
      if (submissionError) throw submissionError;
      form.reset();
      setSubmitted(true);
    } catch {
      setError('We could not submit your enquiry. Please try again or contact us directly.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:border-transparent text-navy-800 placeholder:text-navy-400';
  const labelClass = 'block text-sm font-medium text-navy-700 mb-1.5';

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Training Partners' }]}
        eyebrow="Training Partners"
        title="Discuss a possible training partnership"
        description="This page is a proposal for organisations to share a learning need. It does not promise contracts, courses, certificates, learner support, delivery or employment outcomes."
        image="https://images.pexels.com/photos/6129499/pexels-photo-6129499.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      {/* Benefits */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Benefits"
            title="What to discuss in an enquiry"
            description="Use an enquiry to ask precise questions about subject matter, audience, review status, delivery, data handling, fees and any recognition. The form is not evidence that a partnership programme exists."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 80} className="flex items-start gap-4 p-6 rounded-xl border border-navy-100">
                <div className="w-11 h-11 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-teal-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-navy-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Apply */}
      <section className="py-16 lg:py-24 bg-navy-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-900 mb-4">Who Can Apply?</h2>
              <p className="text-sm text-navy-500 leading-relaxed mb-6">
                Organisations may use the proposed enquiry route to describe a possible collaboration; acceptance, capability and terms require owner confirmation.
              </p>
              <div className="space-y-3">
                {whoCanApply.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
                    <span className="text-sm text-navy-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-900 mb-4">How It Works</h2>
              <div className="space-y-4">
                {howItWorks.map((step, i) => (
                  <Reveal key={step.step} delay={i * 100} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-navy-100">
                    <div className="w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center font-heading font-bold text-sm shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-navy-900 text-sm">{step.title}</h3>
                      <p className="text-xs text-navy-500 mt-1">{step.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Apply Now"
            title="Proposed partnership enquiry"
            description="The form is retained in its existing disabled state when enquiries are not enabled. If enabled by the owner, use it to request information rather than assume an offer."
          />
          {submitted ? (
            <div role="status" aria-live="polite" className="text-center py-12 bg-teal-50 rounded-xl border border-teal-100">
              <CheckCircle className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">Enquiry Submitted</h3>
              <p className="text-sm text-navy-600">Your message was received by the configured enquiry service. This does not confirm a partnership, course, certificate or support arrangement.</p>
            </div>
          ) : (
            <form aria-label="Partnership enquiry" onSubmit={handleSubmit} className="space-y-5 bg-navy-50 p-6 md:p-8 rounded-xl border border-navy-100">
              {!enquiriesEnabled && <p className="text-sm text-navy-700 border-l-2 border-teal-500 pl-3 mb-4">{enquiryUnavailable}</p>}
                  {error && <p role="alert" aria-live="assertive" className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{error}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="fullName">Full Name *</label>
                  <input id="fullName" name="fullName" type="text" required maxLength={160} className={inputClass} placeholder="Your full name" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="organisation">Organisation *</label>
                  <input id="organisation" name="organisation" type="text" required maxLength={200} className={inputClass} placeholder="Organisation name" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="role">Professional Role *</label>
                  <input id="role" name="role" type="text" required maxLength={160} className={inputClass} placeholder="Your role" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" required maxLength={320} className={inputClass} placeholder="you@organisation.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" type="tel" maxLength={80} className={inputClass} placeholder="Phone number" />
                </div>
                <div>
                  <label className={labelClass} htmlFor="country">Country *</label>
                  <input id="country" name="country" type="text" required maxLength={120} className={inputClass} placeholder="Country" />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="website">Organisation Website</label>
                <input id="website" name="website" type="url" maxLength={500} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className={labelClass} htmlFor="message">Message *</label>
                <textarea id="message" name="message" required maxLength={5000} rows={4} className={inputClass} placeholder="Tell us about your partnership interests..." />
              </div>
              <button
                type="submit"
                disabled={submitting || !enquiriesEnabled}
                className="w-full px-6 py-3.5 bg-clinical-600 text-white font-semibold rounded-lg hover:bg-clinical-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {submitting ? 'Submitting…' : 'Submit Partnership Enquiry'}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
