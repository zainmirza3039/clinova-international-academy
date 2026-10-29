import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';

const certificateCodePattern = /^[A-Za-z0-9-]{1,64}$/;

export default function CertificateVerificationPage() {
  const [certificateCode, setCertificateCode] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useSEO({
    title: 'Certificate Verification',
    description: 'Check certificate verification availability at Clinova International Academy.',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = certificateCode.trim();
    setCertificateCode(normalizedCode);
    setStatus('');

    if (!normalizedCode) {
      setError('Enter a certificate code.');
      return;
    }

    if (!certificateCodePattern.test(normalizedCode)) {
      setError('Use 1–64 letters, numbers, or hyphens.');
      return;
    }

    setError('');
    setStatus('The online verification service is unavailable, so this code was not checked. Nothing was sent or stored, and no certificate status can be shown.');
  };

  const clearForm = () => {
    setCertificateCode('');
    setError('');
    setStatus('');
  };

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Certificate verification' }]}
        eyebrow="Verification"
        title="Certificate verification"
        description="Check whether the online verification service is available before relying on a certificate claim."
      />
      <section className="px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-2xl border border-navy-200 bg-surface-50 p-6 md:p-10">
          <div className="flex items-start gap-4">
            <ShieldAlert className="mt-1 h-8 w-8 shrink-0 text-teal-700" aria-hidden="true" />
            <div>
              <h2 id="certificate-verification-heading" className="font-heading text-2xl font-bold text-navy-800">Live verification is not available yet</h2>
              <p className="mt-3 leading-relaxed text-navy-600">
                This page can check only a proposed code format. It does not connect to certificate records and cannot confirm, reject, revoke, or expire a certificate. Your code is not sent to a server or stored.
              </p>
            </div>
          </div>

          <form aria-labelledby="certificate-verification-heading" className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="certificate-code" className="mb-2 block text-sm font-semibold text-navy-800">
                Certificate verification code
              </label>
              <p id="certificate-code-help" className="mb-2 text-sm text-navy-600">
                Enter 1–64 letters, numbers, or hyphens. This format is provisional and does not prove that a code was issued.
              </p>
              <input
                id="certificate-code"
                name="certificateCode"
                type="text"
                value={certificateCode}
                onChange={(event) => {
                  setCertificateCode(event.target.value);
                  setError('');
                  setStatus('');
                }}
                maxLength={64}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'certificate-code-help certificate-code-error' : 'certificate-code-help'}
                className="w-full rounded-md border border-navy-300 bg-white px-4 py-3 text-base text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
              />
              {error && <p id="certificate-code-error" className="mt-2 text-sm font-medium text-red-800" role="alert">{error}</p>}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="min-h-11 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
                Check code format only
              </button>
              <button type="button" onClick={clearForm} className="min-h-11 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
                Clear
              </button>
            </div>
            {status && <p className="border-l-4 border-amber-600 bg-white p-4 text-sm leading-relaxed text-navy-800" role="status" aria-live="polite">{status}</p>}
          </form>

          <p className="mt-8 border-t border-navy-200 pt-5 text-sm leading-relaxed text-navy-600">
            See the <Link to="/certification" className="font-semibold text-clinical-700 underline">certificate information page</Link> for current programme and award-status details.
          </p>
        </div>
      </section>
    </>
  );
}
