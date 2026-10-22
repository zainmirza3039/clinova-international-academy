import { useState } from 'react';
import { ShieldCheck, Search, Award, Calendar, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { supabase } from '@/lib/supabase';
import { verificationEnabled } from '@/lib/siteConfig';
import PageHero from '@/components/PageHero';

type CertificateStatus = 'valid' | 'revoked' | 'expired';
type PublicCertificate = { certificate_id: string; holder_name: string; course_title: string; issue_date: string; cpd_hours: number | null; status: CertificateStatus };

export default function CertificateVerificationPage() {
  useSEO({ title: 'Certificate Verification', description: 'Verify an explicitly published Clinova International Academy certificate by certificate identifier.' });
  const [certId, setCertId] = useState('');
  const [certificate, setCertificate] = useState<PublicCertificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!verificationEnabled) {
    return (
      <>
        <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Certificate Verification' }]} eyebrow="Verification" title="Certificate verification unavailable" description="Public certificate verification is not enabled." image="https://images.pexels.com/photos/8177922/pexels-photo-8177922.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" />
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div role="status" className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 text-sm text-navy-700 leading-relaxed">
              Public certificate verification is currently unavailable. No certificate lookup is performed. Please contact the academy through its confirmed channels if you need assistance.
            </div>
          </div>
        </section>
      </>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedId = certId.trim().toUpperCase();
    setSearched(true);
    setCertificate(null);
    setError('');
    if (!/^[A-Z0-9-]{8,80}$/.test(normalizedId)) return;
    if (!supabase) {
      setError('Verification is temporarily unavailable while the academy connection is being configured.');
      return;
    }
    setLoading(true);
    const { data, error: queryError } = await supabase.from('public_certificates').select('certificate_id, holder_name, course_title, issue_date, cpd_hours, status').eq('certificate_id', normalizedId).maybeSingle();
    setLoading(false);
    if (queryError) {
      setError('Verification is temporarily unavailable. Please try again later or contact the academy.');
      return;
    }
    setCertificate(data as PublicCertificate | null);
  };

  const formatDate = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const statusLabel = certificate?.status === 'revoked' ? 'Certificate Revoked' : certificate?.status === 'expired' ? 'Certificate Expired' : 'Certificate Verified';

  return (
    <>
      <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Certificate Verification' }]} eyebrow="Verification" title="Verify a Clinova Certificate" description="Enter a certificate identifier to check whether it has been explicitly published for public verification. Only public verification fields are displayed." image="https://images.pexels.com/photos/8177922/pexels-photo-8177922.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-navy-50 rounded-xl p-6 md:p-8 border border-navy-100 mb-8">
            <label htmlFor="certId" className="block text-sm font-medium text-navy-700 mb-2">Certificate ID</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" /><input id="certId" name="certificateId" type="text" value={certId} onChange={(event) => setCertId(event.target.value)} placeholder="Enter certificate ID" required pattern="[A-Za-z0-9-]{8,80}" className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinical-500 text-navy-800 placeholder:text-navy-400" /></div>
              <button type="submit" disabled={loading} className="px-6 py-3 bg-clinical-600 text-white text-sm font-semibold rounded-lg hover:bg-clinical-700 disabled:opacity-60 transition-colors whitespace-nowrap">{loading ? <><Loader2 className="inline w-4 h-4 mr-2 animate-spin" />Checking…</> : 'Verify Certificate'}</button>
            </div>
            <p className="text-xs text-navy-400 mt-3">Certificate IDs are case-insensitive. Do not enter private learner information.</p>
          </form>
          {searched && !loading && error && <div role="alert" className="bg-red-50 border border-red-200 p-6 text-sm text-red-800"><AlertCircle className="inline w-5 h-5 mr-2 align-text-bottom" />{error}</div>}
          {searched && !loading && !error && certificate && (
            <div className={`bg-white rounded-xl border-2 overflow-hidden ${certificate.status === 'valid' ? 'border-teal-500' : 'border-amber-400'}`}>
              <div className={`${certificate.status === 'valid' ? 'bg-teal-600' : 'bg-amber-500'} px-6 py-4 flex items-center gap-3`}><CheckCircle className="w-6 h-6 text-white" /><h2 className="font-heading font-bold text-white text-lg">{statusLabel}</h2></div>
              <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" /><div><div className="text-xs text-navy-400">Certificate ID</div><div className="text-sm font-mono font-semibold text-navy-900">{certificate.certificate_id}</div></div></div>
                <div className="flex items-center gap-3"><Award className="w-5 h-5 text-teal-600 shrink-0" /><div><div className="text-xs text-navy-400">Course</div><div className="text-sm font-semibold text-navy-900">{certificate.course_title}</div></div></div>
                <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-teal-600 shrink-0" /><div><div className="text-xs text-navy-400">Issue date</div><div className="text-sm font-semibold text-navy-900">{formatDate(certificate.issue_date)}</div></div></div>
                {certificate.cpd_hours !== null && <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-teal-600 shrink-0" /><div><div className="text-xs text-navy-400">CPD hours</div><div className="text-sm font-semibold text-navy-900">{certificate.cpd_hours} hours</div></div></div>}
                <div className="sm:col-span-2 pt-5 border-t border-navy-100"><div className="text-xs text-navy-400">Certificate holder</div><div className="text-sm font-semibold text-navy-900">{certificate.holder_name}</div></div>
              </div>
            </div>
          )}
          {searched && !loading && !error && !certificate && <div className="bg-white rounded-xl border-2 border-red-300 p-6 md:p-8"><h2 className="font-heading font-bold text-navy-900 text-lg mb-2">Certificate Not Found</h2><p className="text-sm text-navy-600 leading-relaxed">No explicitly published certificate matched that identifier. Please check the ID or contact the academy if you believe this is an error.</p></div>}
        </div>
      </section>
    </>
  );
}
