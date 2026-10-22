import { Target, Eye, Compass, Users, Monitor, ShieldCheck } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import FAQAccordion from '@/components/FAQAccordion';
import CTASection from '@/components/CTASection';
import { generalFAQs } from '@/data/content';

const sections = [
  {
    icon: Target,
    title: 'Our Mission',
    content:
      'Proposed principle for owner review: make careful healthcare learning easier to explore through clear subject maps, original educational drafts and practical reflection tools. This is a content direction, not a statement of established services.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    content:
      'Proposed principle for owner review: build a transparent learning resource that distinguishes educational discussion from clinical guidance and clearly identifies what has, and has not, been confirmed.',
  },
  {
    icon: Compass,
    title: 'Our Approach',
    content:
      'The proposed approach is to use plain language, evidence-aware reading, explicit limitations and reflection prompts. Any course design, teaching model, review process or delivery arrangement remains subject to academy confirmation.',
  },
  {
    icon: Users,
    title: 'Who We Serve',
    content:
      'The draft content is intended for healthcare professionals, learners and organisations exploring topics such as physiotherapy, nursing, medicine, pharmacy, psychology, nutrition, occupational therapy, sports and healthcare management. Readers should work within their training and scope of practice.',
  },
  {
    icon: Monitor,
    title: 'How We Teach',
    content:
      'The current site provides draft reading and proposed study themes. Live teaching, video lessons, interactive assessment, progress tracking, pacing and learner support are not claimed here; ask the academy to confirm any future offering.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality & Learning Standards',
    content:
      'Educational integrity principles proposed for owner review include transparent draft status, careful sourcing, clear scope limits, clinical/editorial review before publication and no implication of competency, employment, accreditation or professional recognition. No certificate or formal accreditation is promised.',
  },
];

export default function AboutPage() {
  useSEO({
    title: 'About Clinova International Academy',
    description:
      'Learn about Clinova International Academy — our mission, vision, approach and commitment to accessible online healthcare professional education.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        eyebrow="About Us"
        title="About Clinova International Academy"
        description="Explore the proposed approach to healthcare education at Clinova. Academy location, delivery arrangements and institutional details await confirmation."
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
                  Professional healthcare education, delivered online
                </h2>
                <p className="mt-6 text-base md:text-lg text-navy-600/80 leading-[1.65]">
                  This website presents a proposed content direction for Clinova International Academy: structured healthcare reading, subject-area maps and possible programme outlines. Academy history, institutional status, faculty, accreditation, fees and delivery arrangements have not been supplied and are not asserted here.
                </p>
                <p className="mt-4 text-base md:text-lg text-navy-600/80 leading-[1.65]">
                  Readers may use the drafts to identify questions, reflect on practice and request accurate information from the owner. No programme, assessment, certificate, employment outcome or professional recognition should be inferred from this catalogue.
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
        title="Explore the proposed learning direction"
        description="Read the draft library and compare proposed subject areas. Confirm availability, terms and intended use with the academy before making a decision."
        primaryCTA={{ label: 'Explore Programmes', to: '/programmes' }}
        secondaryCTA={{ label: 'Contact Academy', to: '/contact' }}
      />
    </>
  );
}
