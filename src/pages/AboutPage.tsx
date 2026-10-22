import { Target, Eye, Compass, Users, Monitor, ShieldCheck } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';

const sections = [
  {
    icon: Target,
    title: 'Public information',
    content: 'This website identifies Clinova International Academy. Further institutional profile details will be published after they are confirmed by the owner.',
  },
  {
    icon: Eye,
    title: 'Programmes and CPD',
    content: 'No programme or CPD course is currently approved for public listing. Course availability, dates, fees, delivery, assessment and recognition have not been confirmed.',
  },
  {
    icon: Compass,
    title: 'Student access',
    content: 'Student registration, sign-in, enrolment records, assessments, progress tracking and certificate services are not currently available.',
  },
  {
    icon: Users,
    title: 'Faculty and partnerships',
    content: 'Faculty profiles, partner agreements and institutional relationships are not published until the relevant details are confirmed.',
  },
  {
    icon: Monitor,
    title: 'Educational content',
    content: 'Educational articles and study resources remain under review. They are not presented as published academy materials or clinical guidance.',
  },
  {
    icon: ShieldCheck,
    title: 'Publication standards',
    content: 'The website will present course and institutional claims only after verification. No accreditation, formal award, learner outcome or employment result is claimed here.',
  },
];

export default function AboutPage() {
  useSEO({
    title: 'About Clinova International Academy',
    description: 'Current public information about Clinova International Academy, including confirmed availability and services that are not yet live.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        eyebrow="About the academy"
        title="About Clinova International Academy"
        description="This page states what is currently confirmed and what is not yet available. Further institutional information will be published after owner review."
        image="https://images.pexels.com/photos/5452189/pexels-photo-5452189.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-600">Current status</p>
            <h2 className="mt-4 font-heading text-2xl md:text-3xl font-bold text-navy-900">Only verified information should be treated as current</h2>
            <p className="mt-5 text-base leading-relaxed text-navy-700">
              Course listings, educational articles and study tools are being held back until the relevant content is approved.
              Student and administrative services also remain unavailable while backend access controls and operational policies are verified.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-surface-50">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {sections.map((section, i) => (
              <Reveal key={section.title} delay={(i % 3) * 80} className="border-t border-navy-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="w-5 h-5 text-teal-500" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="font-heading font-bold text-navy-800 text-lg">{section.title}</h3>
                </div>
                <p className="text-sm text-navy-600/80 leading-relaxed">{section.content}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Check current availability"
        description="Only academy-approved offerings are listed. Student services, course enrolment and online enquiry submission are not currently available."
        primaryCTA={{ label: 'View programme availability', to: '/programmes' }}
        secondaryCTA={{ label: 'Contact information', to: '/contact' }}
      />
    </>
  );
}
