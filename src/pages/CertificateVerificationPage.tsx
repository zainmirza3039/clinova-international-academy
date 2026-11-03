import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { supabase } from '@/lib/supabase';

type VerificationResult = {
  certificate_number: string;
  learner_name: string;
  course_title: string;
  issued_at: string;
  certificate_status: 'valid' | 'revoked';
};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function CertificateVerificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lastAutoCode = useRef('');
  const [certificateCode, setCertificateCode] = useState(searchParams.get('code') ?? '');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useSEO({ title: 'CPD certificate verification | Clinova International Academy', description: 'Verify a Clinova CPD completion certificate using its unique verification code.', noindex: true });

  useEffect(() => {
    const code = searchParams.get('code');
    if (code && uuidPattern.test(code) && lastAutoCode.current !== code) {
      lastAutoCode.current = code;
      setCertificateCode(code);
      void verify(code);
    }
  // Query-string verification is intentionally performed only when the URL code changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function verify(rawCode: string) {
    const normalizedCode = rawCode.trim();
    setCertificateCode(normalizedCode); setError(''); setStatus(''); setResult(null);
    lastAutoCode.current = normalizedCode;
    if (!uuidPattern.test(normalizedCode)) { setError('Enter the complete verification UUID printed on the CPD certificate.'); return; }
    setLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('verify_cpd_certificate', { p_verification_code: normalizedCode });
      if (rpcError) throw rpcError;
      const row = Array.isArray(data) ? data[0] : null;
      if (!row) { setStatus('No certificate record matches this verification code. Check the code and contact the academy if you believe this is an error.'); return; }
      setResult(row as VerificationResult);
      if (searchParams.get('code') !== normalizedCode) setSearchParams({ code: normalizedCode }, { replace: true });
    } catch {
      setError('The verification service could not complete this request. Try again later.');
    } finally { setLoading(false); }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void verify(certificateCode); };
  const clearForm = () => { setCertificateCode(''); setError(''); setStatus(''); setResult(null); setSearchParams({}, { replace: true }); };

  return <>
    <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Credential verification' }]} eyebrow="Certificate verification" title="Verify a CPD completion certificate" description="Check the validity of a Clinova CPD completion certificate using its unique verification code. Professional competency certification is a separate pathway." />
    <section className="px-6 py-16 lg:py-20"><div className="mx-auto max-w-2xl border border-navy-200 bg-white p-6 md:p-10">
      <div className="flex items-start gap-4"><BadgeCheck className="mt-1 h-8 w-8 shrink-0 text-teal-700" aria-hidden="true" /><div><h2 className="font-heading text-2xl font-bold text-navy-900">Official CPD certificate lookup</h2><p className="mt-3 text-sm leading-relaxed text-navy-600">Enter the verification UUID shown on the certificate. The lookup returns only the certificate number, learner display name, programme title, issue date and current validity status.</p></div></div>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div><p className="mb-2 text-sm font-semibold text-navy-800">Credential type</p><p className="border border-navy-200 bg-surface-50 px-4 py-3 text-sm text-navy-700">CPD completion certificate</p></div>
        <div><label htmlFor="credential-code" className="mb-2 block text-sm font-semibold text-navy-800">Certificate verification UUID</label><input id="credential-code" name="credentialCode" type="text" required value={certificateCode} onChange={event => {setCertificateCode(event.target.value);setError('');setStatus('');setResult(null);}} maxLength={36} autoComplete="off" spellCheck={false} aria-invalid={Boolean(error)} className="w-full rounded-md border border-navy-300 bg-white px-4 py-3 font-mono text-sm text-navy-900" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></div>
        {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="submit" disabled={loading} className="min-h-11 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? 'Checking…' : 'Verify certificate'}</button><button type="button" onClick={clearForm} className="min-h-11 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800">Clear</button></div>
      </form>
      {status && <p role="status" className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-navy-800">{status}</p>}
      {result && <section className="mt-6 border border-navy-200 p-5" aria-live="polite"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-heading text-lg font-bold text-navy-900">Certificate record found</h3><span className={result.certificate_status === 'valid' ? 'portal-status portal-status--valid' : 'portal-status portal-status--revoked'}>{result.certificate_status}</span></div><dl className="portal-profile-list"><div><dt>Certificate number</dt><dd>{result.certificate_number}</dd></div><div><dt>Learner</dt><dd>{result.learner_name}</dd></div><div><dt>Programme</dt><dd>{result.course_title}</dd></div><div><dt>Issue date</dt><dd>{new Date(result.issued_at).toLocaleDateString('en-GB')}</dd></div></dl><p className="portal-muted">This lookup confirms only the record and status held by Clinova. It does not establish statutory registration, licensure or professional competency certification.</p></section>}
      <div className="mt-8 space-y-2 border-t border-navy-200 pt-5 text-sm leading-relaxed text-navy-600"><p><Link to="/cpd-courses" className="font-semibold text-clinical-700 underline">CPD programme information</Link> · CPD completion is distinct from professional certification.</p><p><Link to="/certification" className="font-semibold text-clinical-700 underline">Professional certification status</Link> · Separate standards and decision process.</p></div>
    </div></section>
  </>;
}
