import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { credentialTypes, type CredentialTypeId } from '@/data/credentialTypes';

const certificateCodePattern = /^[A-Za-z0-9-]{1,64}$/;

export default function CertificateVerificationPage() {
  const [credentialType, setCredentialType] = useState<CredentialTypeId>('cpd-completion');
  const [certificateCode, setCertificateCode] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const selectedCredential = credentialTypes.find((credential) => credential.id === credentialType)!;

  useSEO({
    title: 'Credential verification status',
    description: 'Separate CPD and professional credential verification status. No online lookup is currently available.',
    noindex: true,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = certificateCode.trim();
    setCertificateCode(normalizedCode);
    setStatus('');
    if (!normalizedCode) {
      setError('Enter a credential code to check its format.');
      return;
    }
    if (!certificateCodePattern.test(normalizedCode)) {
      setError('Use 1–64 letters, numbers, or hyphens.');
      return;
    }
    setError('');
    setStatus(`The ${selectedCredential.title.toLowerCase()} verification service is unavailable, so this code was not checked. Nothing was sent or stored, and no credential status can be shown.`);
  };

  const clearForm = () => {
    setCertificateCode('');
    setError('');
    setStatus('');
  };

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Credential verification' }]}
        eyebrow="Verification status"
        title="Check a credential type"
        description="CPD completion certificates and professional competency credentials are separate record types with separate issuance rules. Neither can be verified online in this build."
      />
      <section className="px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-2xl border border-navy-200 bg-surface-50 p-6 md:p-10">
          <div className="flex items-start gap-4">
            <ShieldAlert className="mt-1 h-8 w-8 shrink-0 text-teal-700" aria-hidden="true" />
            <div>
              <h2 id="credential-verification-heading" className="font-heading text-2xl font-bold text-navy-800">Live verification is not available</h2>
              <p className="mt-3 leading-relaxed text-navy-600">This page checks only a proposed code format. It does not connect to credential records and cannot confirm, reject, revoke or expire a credential. The code stays in this browser form and is not sent to a server or stored.</p>
            </div>
          </div>

          <form aria-labelledby="credential-verification-heading" className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="credential-type" className="mb-2 block text-sm font-semibold text-navy-800">Credential type</label>
              <select id="credential-type" value={credentialType} onChange={(event) => { setCredentialType(event.target.value as CredentialTypeId); setError(''); setStatus(''); }} className="w-full rounded-md border border-navy-300 bg-white px-4 py-3 text-base text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
                {credentialTypes.map((credential) => <option key={credential.id} value={credential.id}>{credential.title}</option>)}
              </select>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{selectedCredential.purpose}</p>
            </div>
            <div>
              <label htmlFor="credential-code" className="mb-2 block text-sm font-semibold text-navy-800">Credential code</label>
              <p id="credential-code-help" className="mb-2 text-sm text-navy-600">Enter 1–64 letters, numbers or hyphens. This format is provisional and does not prove that a credential was issued.</p>
              <input id="credential-code" name="credentialCode" type="text" value={certificateCode} onChange={(event) => { setCertificateCode(event.target.value); setError(''); setStatus(''); }} maxLength={64} autoComplete="off" spellCheck={false} aria-invalid={Boolean(error)} aria-describedby={error ? 'credential-code-help credential-code-error' : 'credential-code-help'} className="w-full rounded-md border border-navy-300 bg-white px-4 py-3 text-base text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600" />
              {error && <p id="credential-code-error" className="mt-2 text-sm font-medium text-red-800" role="alert">{error}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="min-h-11 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">Check code format only</button>
              <button type="button" onClick={clearForm} className="min-h-11 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">Clear</button>
            </div>
            {status && <p className="border-l-4 border-amber-600 bg-white p-4 text-sm leading-relaxed text-navy-800" role="status" aria-live="polite">{status}</p>}
          </form>
          <div className="mt-8 space-y-2 border-t border-navy-200 pt-5 text-sm leading-relaxed text-navy-600">
            <p><Link to="/cpd-courses" className="font-semibold text-clinical-700 underline">CPD course availability</Link> · No course credential is issued through this page.</p>
            <p><Link to="/certification" className="font-semibold text-clinical-700 underline">Professional certification status</Link> · No scheme or credential is currently open.</p>
          </div>
        </div>
      </section>
    </>
  );
}
