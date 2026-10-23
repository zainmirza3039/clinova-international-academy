import { ArrowRight, CheckCircle2, ClipboardList, Compass, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

const steps = [
  { icon: Compass, title: 'Check current availability', text: 'No programme or CPD course is currently approved for public listing.' },
  { icon: ClipboardList, title: 'Avoid sending sensitive documents', text: 'The application planner is local-only and does not submit or save an application.' },
  { icon: Users, title: 'Wait for a confirmed process', text: 'A live admissions enquiry route will be announced only after the secure workflow is available.' },
];

export default function AdmissionsPage() {
  useSEO({ title: 'Admissions', description: 'Current admissions status for Clinova International Academy. Applications and course availability are not yet live.' });
  return <>
    <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Admissions' }]} eyebrow="Admissions" title="Admissions are not yet open" description="No programme is currently approved for enrolment, and a live admissions enquiry service is not available." />
    <section>
      <section className="py-16 lg:py-24 bg-white"><div className="max-w-editorial mx-auto px-6 lg:px-10">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-600 mb-4">Start with confidence</p><h2 className="font-heading text-3xl font-bold text-navy-800">Admissions guidance, without the guesswork</h2><p className="mt-5 text-navy-600 leading-relaxed">No programme is currently approved for enrolment, and admission requirements have not been confirmed. This page does not accept an application or provide individual admissions advice.</p></div>
        <div className="grid md:grid-cols-3 gap-8 mt-12">{steps.map(({ icon: Icon, title, text }, index) => <article key={title} className="border-t-2 border-teal-500 pt-6"><span className="text-xs font-semibold text-teal-600">0{index + 1}</span><Icon className="w-6 h-6 text-clinical-600 mt-5 mb-4" aria-hidden="true" /><h3 className="font-heading text-lg font-bold text-navy-800">{title}</h3><p className="mt-3 text-sm leading-relaxed text-navy-600">{text}</p></article>)}</div>
      </div></section>
      <section className="py-16 bg-surface-50"><div className="max-w-editorial mx-auto px-6 lg:px-10 flex flex-col md:flex-row md:items-center justify-between gap-8"><div><h2 className="font-heading text-2xl font-bold text-navy-800">Plan your next steps</h2><p className="mt-2 text-sm text-navy-600">The application planner is a local-only planning aid. It does not submit or save an application.</p></div><Link to="/application" className="inline-flex items-center justify-center gap-2 bg-clinical-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-clinical-600">Open application planner <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link></div></section>
      <section className="py-14 bg-navy-800"><div className="max-w-editorial mx-auto px-6 lg:px-10 flex gap-4 items-start"><CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" aria-hidden="true" /><div><h2 className="font-heading text-xl font-bold text-white">Need advice first?</h2><p className="mt-2 text-sm text-navy-100/70">The contact page displays the current public address, but online enquiry submission is disabled. Do not send sensitive documents through this website.</p><Link to="/contact" className="inline-block mt-4 text-sm font-semibold text-teal-300 hover:text-white">Contact Clinova <span aria-hidden="true">→</span></Link></div></div></section>
    </section>
  </>;
}
