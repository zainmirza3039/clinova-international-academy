import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
export default function CertificateVerificationPage() {
  useSEO({ title: 'Certificate Verification', description: 'Current availability of certificate verification at Clinova International Academy.' });
  return <><PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Certificate verification' }]} eyebrow="Verification" title="Certificate verification" description="Verification requires an academy-authorised certificate service." /><section className="py-20 px-6"><div className="max-w-2xl mx-auto border border-navy-200 bg-surface-50 p-8 md:p-12"><ShieldAlert className="w-9 h-9 text-teal-700 mb-6" aria-hidden="true" /><h2 className="text-2xl font-bold text-navy-800">Verification is not available yet</h2><p role="status" className="mt-4 text-navy-600 leading-relaxed">No academy-authorised certificate database is connected. This page cannot confirm or reject a certificate. No certificate identifier or learner record is requested or stored.</p><Link to="/contact" className="inline-block mt-8 font-semibold text-clinical-700 underline">Check contact availability</Link></div></section></>;
}
