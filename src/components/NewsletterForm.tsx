import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function NewsletterForm() {
  const { ref, isVisible } = useScrollAnimation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: submissionError } = await supabase.from('newsletter_subscriptions').insert({ email: email.trim() });
    setSubmitting(false);
    if (submissionError && submissionError.code !== '23505') {
      setError('We could not complete your subscription. Please try again.');
      return;
    }

    setSubmitted(true);
    setEmail('');
  };

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} bg-navy-50 rounded-2xl p-8 md:p-10 border border-navy-100`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <h3 className="font-heading text-xl font-bold text-navy-900">Stay Connected With Clinova</h3>
      </div>
      <p className="text-sm text-navy-500 leading-relaxed mb-5">
        Receive updates about new programmes, educational resources and academy announcements.
      </p>
      {error && <p role="alert" className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3">{error}</p>}
      {submitted ? (
        <div className="flex items-center gap-2 p-4 bg-teal-50 text-teal-700 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Thank you for subscribing. We'll be in touch with updates soon.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            aria-label="Email address"
            className="flex-1 px-4 py-3 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:border-transparent text-navy-800 placeholder:text-navy-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-clinical-600 text-white text-sm font-semibold rounded-lg hover:bg-clinical-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
          >
            {submitting ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      )}
      <p className="text-xs text-navy-400 mt-3">
        By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.
      </p>
    </div>
  );
}
