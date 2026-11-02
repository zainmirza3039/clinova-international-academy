import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

export default function ProgrammesPage() {
  useSEO({
    title: 'Programme information',
    description: 'Clinova programme information and admissions status. No course or programme is currently open for enrollment.',
  });
  return <>
    <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Programme information' }]} eyebrow="Programme information" title="Course and programme details are under review" description="This page provides status information only. No programme is currently presented as open for enrollment or admission." />
    <section className="bg-white px-6 py-14 lg:py-20"><div className="mx-auto max-w-4xl">
      <div className="border border-amber-300 bg-amber-50 p-6" role="status"><div className="flex items-start gap-4"><ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-amber-700" aria-hidden="true" /><div><h2 className="font-heading text-xl font-bold text-navy-900">No approved enrollment offer is available</h2><p className="mt-2 text-sm leading-relaxed text-navy-700">Legacy programme outlines and course records are not treated as current offerings. Approved scope, eligibility, delivery, assessment, fees and credential terms must be confirmed before a public application or enrollment offer is made.</p></div></div></div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2"><article className="rounded-xl border border-navy-100 bg-surface-50 p-6"><BookOpenCheck className="h-6 w-6 text-clinical-700" aria-hidden="true" /><h2 className="mt-3 font-heading text-lg font-bold text-navy-900">CPD education</h2><p className="mt-2 text-sm leading-relaxed text-navy-600">A structured course catalogue and learning service are in development. No course is open for enrollment.</p><Link to="/cpd-courses" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 underline">CPD system status <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article><article className="rounded-xl border border-navy-100 bg-surface-50 p-6"><ShieldAlert className="h-6 w-6 text-clinical-700" aria-hidden="true" /><h2 className="mt-3 font-heading text-lg font-bold text-navy-900">Professional certification</h2><p className="mt-2 text-sm leading-relaxed text-navy-600">Competency certification is a separate development proposal. No scheme is currently accepting candidates.</p><Link to="/certification" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 underline">Certification status <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article></div>
      <div className="mt-8"><Link to="/application" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700">Application information <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
    </div></section>
  </>;
}
