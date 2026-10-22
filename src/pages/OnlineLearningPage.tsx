import { Monitor, Clock, BookOpen, ClipboardCheck, Compass, Award, ShieldCheck, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import SectionHeader from '@/components/SectionHeader';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';

const features = [
  { icon: Monitor, title: 'Flexible access', desc: 'Study online around your professional commitments when the learning platform is available for your enrolment.' },
  { icon: Compass, title: 'Structured pathways', desc: 'Follow programme modules and learning objectives in a clear, progressive order.' },
  { icon: BookOpen, title: 'Learning resources', desc: 'Access course reading and other materials supplied for your enrolled programme.' },
  { icon: ClipboardCheck, title: 'Assessments', desc: 'Complete the assessments specified by your programme when they have been published.' },
  { icon: Clock, title: 'Progress tracking', desc: 'Authenticated learners will see progress calculated from their own completed lessons.' },
  { icon: Award, title: 'Certificates', desc: 'Eligible completions can receive a Certificate of Completion through the academy workflow.' },
  { icon: ShieldCheck, title: 'Protected access', desc: 'Learner records and course progress are intended to be available only to the authenticated learner.' },
  { icon: LogIn, title: 'Support when needed', desc: 'Contact the academy if you need help understanding access or an enrolment.' },
];

export default function OnlineLearningPage() {
  useSEO({ title: 'Online Learning', description: 'Learn about Clinova International Academy online learning, course access and learner support.' });
  return (
    <>
      <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Online Learning' }]} eyebrow="Online Learning" title="Learn Around Your Professional Life" description="Our online learning experience is designed for structured, flexible professional development. Access and progress are shown only after the relevant learner account and enrolment are configured." image="https://images.pexels.com/photos/5934556/pexels-photo-5934556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <SectionHeader eyebrow="The Learning Experience" title="A clear route into professional learning" description="Explore the catalogue first. When learner access is enabled for your enrolment, your private progress and course materials will appear in the authenticated platform." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((item, i) => <Reveal key={item.title} delay={(i % 4) * 60} className="p-6 bg-surface-50 border border-navy-50"><div className="w-11 h-11 bg-white border border-navy-50 flex items-center justify-center mb-4 shadow-sm"><item.icon className="w-5 h-5 text-teal-500" strokeWidth={1.5} /></div><h3 className="font-heading font-semibold text-navy-800 text-sm mb-2">{item.title}</h3><p className="text-xs text-navy-500 leading-relaxed">{item.desc}</p></Reveal>)}
          </div>
        </div>
      </section>
      <section className="py-16 lg:py-24 bg-surface-50">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="bg-white border border-navy-100 p-8 md:p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-5"><LogIn className="w-6 h-6 text-teal-600" /></div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600 mb-3">Learner access</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800 mb-4">Your private dashboard starts with a confirmed enrolment</h2>
            <p className="text-sm text-navy-600 leading-relaxed max-w-xl mx-auto mb-7">Sign-in, registration, progress tracking and course completion will be connected to the academy’s authenticated learning workflow. We do not show sample accounts or fictional progress here.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3"><Link to="/programmes" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-800 text-white text-sm font-semibold hover:bg-navy-900 transition-colors">Explore programmes</Link><Link to="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-navy-200 text-navy-800 text-sm font-semibold hover:border-clinical-500 hover:text-clinical-600 transition-colors">Ask about access</Link></div>
          </div>
        </div>
      </section>
      <CTASection title="Find the right starting point" description="Browse structured programmes and CPD courses, then contact the academy if you need guidance about availability or access." primaryCTA={{ label: 'Explore Programmes', to: '/programmes' }} secondaryCTA={{ label: 'Browse CPD Courses', to: '/cpd-courses' }} variant="teal" />
    </>
  );
}
