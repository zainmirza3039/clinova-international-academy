import { ArrowRight, CheckCircle2, ClipboardList, Compass, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

const steps = [
  { icon: Compass, title: 'Explore your options', text: 'Review our programmes and departments to find a learning route that fits your goals.' },
  { icon: ClipboardList, title: 'Prepare your details', text: 'Have your preferred programme, experience and contact details ready before you begin.' },
  { icon: Users, title: 'Speak with our team', text: 'Our admissions team can clarify suitability and next steps through the contact channel.' },
];

export default function AdmissionsPage() {
  useSEO({ title: 'Admissions', description: 'Explore admissions guidance and next steps for studying with Clinova International Academy.' });
  return <>
    <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Admissions' }]} eyebrow="Admissions" title="A clear next step for your learning journey" description="Find the right route into Clinova, understand what to prepare and contact our team when you are ready to discuss your options." />
    <main>
      <section className="py-16 lg:py-24 bg-white"><div className="max-w-editorial mx-auto px-6 lg:px-10">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-600 mb-4">Start with confidence</p><h2 className="font-heading text-3xl font-bold text-navy-800">Admissions guidance, without the guesswork</h2><p className="mt-5 text-navy-600 leading-relaxed">Admission requirements can vary by programme. Browse the course information first, then use our enquiry channel for advice about your circumstances. We do not publish a universal admissions rule because suitability is programme-specific.</p></div>
        <div className="grid md:grid-cols-3 gap-8 mt-12">{steps.map(({ icon: Icon, title, text }, index) => <article key={title} className="border-t-2 border-teal-500 pt-6"><span className="text-xs font-semibold text-teal-600">0{index + 1}</span><Icon className="w-6 h-6 text-clinical-600 mt-5 mb-4" aria-hidden="true" /><h3 className="font-heading text-lg font-bold text-navy-800">{title}</h3><p className="mt-3 text-sm leading-relaxed text-navy-600">{text}</p></article>)}</div>
      </div></section>
      <section className="py-16 bg-surface-50"><div className="max-w-editorial mx-auto px-6 lg:px-10 flex flex-col md:flex-row md:items-center justify-between gap-8"><div><h2 className="font-heading text-2xl font-bold text-navy-800">Ready to share your interest?</h2><p className="mt-2 text-sm text-navy-600">The application workspace is currently a local preview and does not submit personal data.</p></div><Link to="/application" className="inline-flex items-center justify-center gap-2 bg-clinical-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-clinical-600">Open application preview <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link></div></section>
      <section className="py-14 bg-navy-800"><div className="max-w-editorial mx-auto px-6 lg:px-10 flex gap-4 items-start"><CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" aria-hidden="true" /><div><h2 className="font-heading text-xl font-bold text-white">Need advice first?</h2><p className="mt-2 text-sm text-navy-100/70">Check the contact page for current channel availability. Please do not send sensitive documents until our team requests them.</p><Link to="/contact" className="inline-block mt-4 text-sm font-semibold text-teal-300 hover:text-white">Contact Clinova <span aria-hidden="true">→</span></Link></div></div></section>
    </main>
  </>;
}
