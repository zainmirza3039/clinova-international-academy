import { useState } from 'react';
import { ShieldCheck, Search, Award, User, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { certificateDatabase } from '@/data/testimonials';

export default function CertificateVerificationPage() {
  useSEO({
    title: 'Certificate Verification',
    description: 'Verify a Clinova International Academy certificate. Enter your certificate ID to confirm its authenticity.',
  });

  const [certId, setCertId] = useState('');
  const [result, setResult] = useState<'idle' | 'verified' | 'not-found'>('idle');
  const [searched, setSearched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const found = certificateDatabase.find((c) => c.certificateId.toLowerCase() === certId.toLowerCase());
    setResult(found ? 'verified' : 'not-found');
  };

  const foundCert = certificateDatabase.find((c) => c.certificateId.toLowerCase() === certId.toLowerCase());
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Certificate Verification' }]}
        eyebrow="Verification"
        title="Verify a Clinova Certificate"
        description="Enter a certificate ID to verify its authenticity. This is a demonstration system — use CIA-2026-000001 or CIA-2026-000002 to see a verified result."
        image="https://images.pexels.com/photos/8177922/pexels-photo-8177922.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="bg-navy-50 rounded-xl p-6 md:p-8 border border-navy-100 mb-8">
            <label htmlFor="certId" className="block text-sm font-medium text-navy-700 mb-2">
              Certificate ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
                <input
                  id="certId"
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="e.g. CIA-2026-000001"
                  required
                  className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:border-transparent text-navy-800 placeholder:text-navy-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-clinical-600 text-white text-sm font-semibold rounded-lg hover:bg-clinical-700 transition-colors shadow-sm whitespace-nowrap"
              >
                Verify Certificate
              </button>
            </div>
            <p className="text-xs text-navy-400 mt-3">
              Try: CIA-2026-000001 or CIA-2026-000002 for a demonstration.
            </p>
          </form>

          {/* Results */}
          {searched && result === 'verified' && foundCert && (
            <div className="bg-white rounded-xl border-2 border-teal-500 overflow-hidden animate-scale-in">
              <div className="bg-teal-600 px-6 py-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-white" />
                <h2 className="font-heading font-bold text-white text-lg">Certificate Verified</h2>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-teal-600 shrink-0" />
                    <div>
                      <div className="text-xs text-navy-400">Holder</div>
                      <div className="text-sm font-semibold text-navy-900">{foundCert.holder}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-teal-600 shrink-0" />
                    <div>
                      <div className="text-xs text-navy-400">Course</div>
                      <div className="text-sm font-semibold text-navy-900">{foundCert.course}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-teal-600 shrink-0" />
                    <div>
                      <div className="text-xs text-navy-400">Issue Date</div>
                      <div className="text-sm font-semibold text-navy-900">{formatDate(foundCert.issueDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal-600 shrink-0" />
                    <div>
                      <div className="text-xs text-navy-400">CPD Hours</div>
                      <div className="text-sm font-semibold text-navy-900">{foundCert.cpdHours} hours</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-navy-100 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <div className="text-xs text-navy-400">Certificate ID</div>
                    <div className="text-sm font-mono font-semibold text-navy-900">{foundCert.certificateId}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {searched && result === 'not-found' && (
            <div className="bg-white rounded-xl border-2 border-red-300 overflow-hidden animate-scale-in">
              <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-white" />
                <h2 className="font-heading font-bold text-white text-lg">Certificate Not Found</h2>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-sm text-navy-600 leading-relaxed">
                  We could not find a certificate with the ID "{certId}". Please check the ID and try again.
                  If you believe this is an error, please contact us at info@clinovaacademy.co.uk.
                </p>
              </div>
            </div>
          )}

          {/* Demo notice */}
          <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-navy-600 leading-relaxed">
                This is a frontend demonstration of the certificate verification system. Certificate data shown here is
                sample data for illustration purposes. A real backend verification system will be connected before publication.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
