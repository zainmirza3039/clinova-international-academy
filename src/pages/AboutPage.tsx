import { Target, Eye, Compass, Users, Monitor, ShieldCheck } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import FAQAccordion from '@/components/FAQAccordion';
import CTASection from '@/components/CTASection';
import { generalFAQs } from '@/data/testimonials';

const sections = [
  {
    icon: Target,
    title: 'Proposed mission',
    content:
      'Make healthcare learning easier to explore through clear subject guides, educational reading and practical reflection tools.',
  },
  {
    icon: Eye,
    title: 'Proposed vision',
    content:
      'Provide a transparent learning resource that distinguishes general education from clinical advice and describes programme arrangements accurately.',
  },
  {
    icon: Compass,
    title: 'Our Approach',
    content:
      'Our approach prioritises plain language, evidence-aware reading, clear scope limits and practical reflection. Programme delivery and assessment details are published only when confirmed.',
  },
  {
    icon: Users,
    title: 'Who We Serve',
    content:
      'Our educational resources cover topics across physiotherapy, nursing, medicine, pharmacy, psychology, nutrition, occupational therapy, sport and healthcare management. Readers should work within their training and scope of practice.',
  },
  {
    icon: Monitor,
    title: 'What the site currently provides',
    content:
      'The site currently provides written educational resources and subject-area information. Live online teaching, enrolment, learner accounts, formal assessment, learner support and certificate services are not operational through this website.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality & Learning Standards',
    content:
      'We aim to distinguish educational information from clinical advice and formal qualifications. No accreditation, certificate, employment outcome or professional recognition should be assumed unless it is explicitly documented for a specific offering.',
  },
];

export default function AboutPage() {
  useSEO({
    title: 'About Clinova International Academy',
    description:
      'Explore Clinova’s healthcare subject areas, independent study resources and educational approach.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        eyebrow="About Us"
        title="About Clinova International Academy"
        description="Explore Clinova's healthcare learning resources and subject areas."
        image="https://images.pexels.com/photos/5452189/pexels-photo-5452189.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">
                  Introduction
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <Reveal delay={100}>
                <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
                  Healthcare learning resources for independent study
                </h2>
                <p className="mt-6 text-base md:text-lg text-navy-600/80 leading-[1.65]">
                  Clinova International Academy brings together healthcare subject areas, educational reading and study resources designed to support professional learning and reflection. At present, this site does not provide live online teaching, enrolment, assessment or learner accounts.
                </p>
                <p className="mt-4 text-base md:text-lg text-navy-600/80 leading-[1.65]">
                  Programme and course-guide pages are informational. Availability, dates, fees, eligibility, delivery, assessment and recognition are unconfirmed unless explicitly stated for a specific offering; no qualification, CPD credit, certificate or professional recognition should be assumed.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-surface-50">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {sections.map((section, i) => (
              <Reveal key={section.title} delay={(i % 3) * 80} className="border-t border-navy-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="w-5 h-5 text-teal-500" strokeWidth={1.5} />
                  <h3 className="font-heading font-bold text-navy-800 text-lg">{section.title}</h3>
                </div>
                <p className="text-sm text-navy-600/80 leading-relaxed">{section.content}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faqs" className="py-20 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-12 lg:mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4 text-center">
              FAQs
            </div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance text-center">
              Frequently asked questions
            </h2>
          </Reveal>
          <FAQAccordion items={generalFAQs} />
        </div>
      </section>

      <CTASection
        title="Explore healthcare learning"
        description="Explore educational reading and subject areas. Review published programme details before making a learning commitment."
        primaryCTA={{ label: 'Explore Programmes', to: '/programmes' }}
        secondaryCTA={{ label: 'Contact Academy', to: '/contact' }}
      />
    </>
  );
}
