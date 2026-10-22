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
      'To make high-quality healthcare professional education more accessible through flexible digital learning. We aim to support healthcare professionals in maintaining and developing their knowledge, skills and professional practice throughout their careers.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    content:
      'To be a trusted online healthcare education provider, recognised for delivering clinically relevant, structured learning that supports the professional development of healthcare practitioners worldwide.',
  },
  {
    icon: Compass,
    title: 'Our Approach',
    content:
      'We design programmes around the realities of professional practice. Our courses combine evidence-informed content with practical clinical relevance, delivered through an accessible online platform that accommodates the demands of working healthcare professionals.',
  },
  {
    icon: Users,
    title: 'Who We Serve',
    content:
      'Clinova serves qualified healthcare professionals and those in training across a range of disciplines, including physiotherapy, nursing, medicine, pharmacy, psychology, nutrition, occupational therapy, sports medicine and healthcare management.',
  },
  {
    icon: Monitor,
    title: 'How We Teach',
    content:
      'Our online learning model integrates video lessons, reading resources, interactive assessments and progress tracking. Programmes are self-paced where applicable, allowing learners to study at times that suit their professional and personal commitments.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality & Learning Standards',
    content:
      'We are committed to maintaining educational quality through structured programme design, evidence-informed content and clear learning outcomes. Our programmes are CPD-focused and provide Certificates of Completion. We do not currently claim formal accreditation from any regulatory body.',
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
        description="A UK-based virtual healthcare education institute providing flexible online learning, CPD-focused professional development and structured educational programmes for healthcare professionals."
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
                  Clinova International Academy is a virtual healthcare education institute offering structured online
                  learning for healthcare professionals. We provide certificate courses, diploma programmes and
                  CPD-focused professional development across a range of healthcare disciplines.
                </p>
                <p className="mt-4 text-base md:text-lg text-navy-600/80 leading-[1.65]">
                  Our programmes are designed for qualified healthcare professionals who want to expand their knowledge,
                  maintain their professional development and develop clinically relevant skills — all through a flexible
                  online platform that fits around their working lives.
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
        title="Start Your Professional Development Journey"
        description="Explore our healthcare education programmes and take the next step in your career."
        primaryCTA={{ label: 'Explore Programmes', to: '/programmes' }}
        secondaryCTA={{ label: 'Contact Academy', to: '/contact' }}
      />
    </>
  );
}
