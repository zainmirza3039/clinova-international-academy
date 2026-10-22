import { Link } from 'react-router-dom';
import {
  ArrowRight, Globe,
  ShieldCheck, CheckCircle,
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Reveal from '@/components/Reveal';
import DepartmentCard from '@/components/DepartmentCard';
import ProgrammeCard from '@/components/ProgrammeCard';
import CPDCard from '@/components/CPDCard';
import NewsCard from '@/components/NewsCard';
import FAQAccordion from '@/components/FAQAccordion';
import NewsletterForm from '@/components/NewsletterForm';
import { departments } from '@/data/departments';
import { getFeaturedProgrammes } from '@/data/programmes';
import { cpdCourses, cpdFilters } from '@/data/cpdCourses';
import { newsItems, generalFAQs } from '@/data/testimonials';
import { useState } from 'react';

const learningSteps = [
  { number: '01', title: 'Explore a topic', desc: 'Start with an educational article or subject-area guide and identify what you want to learn.' },
  { number: '02', title: 'Reflect on practice', desc: 'Connect learning with your role, professional scope and current local guidance.' },
  { number: '03', title: 'Confirm programme details', desc: 'Check current availability, delivery, dates and assessment arrangements before enrolling.' },
  { number: '04', title: 'Choose your next step', desc: 'Review the confirmed requirements and terms for the specific learning opportunity.' },
];

const pathwaySteps = [
  { label: 'Subject areas', desc: 'Explore healthcare disciplines' },
  { label: 'Learning library', desc: 'Read articles and use reflection tools' },
  { label: 'Programme information', desc: 'Review published programme details' },
  { label: 'Next steps', desc: 'Confirm current availability and requirements' },
];

export default function HomePage() {
  useSEO({
    title: 'Clinova International Academy | Advancing Healthcare Through Professional Education',
    description:
      'Healthcare learning resources, professional subject areas and study tools. Course availability, delivery, assessment and recognition are stated only when confirmed.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Clinova International Academy',
      description: 'Healthcare learning resources and subject-area information for professional development.',
    },
  });

  const featuredProgrammes = getFeaturedProgrammes();
  const [cpdFilter, setCpdFilter] = useState('All');
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation<HTMLDivElement>();

  const filteredCPD =
    cpdFilter === 'All'
      ? cpdCourses.slice(0, 4)
      : cpdCourses.filter((c) => c.department.toLowerCase().includes(cpdFilter.toLowerCase())).slice(0, 4);

  return (
    <>
      {/* HERO — asymmetric split, editorial scale */}
      <section className="relative bg-navy-800 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/8376296/pexels-photo-8376296.jpeg?auto=compress&cs=tinysrgb&h=900&w=1400"
            alt="Healthcare professional studying online"
            className="w-full h-full object-cover opacity-25"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-800 via-navy-800/90 to-navy-800/40" />
        </div>
        <div className="relative max-w-editorial mx-auto px-6 lg:px-10 pt-20 pb-0 lg:pt-32 lg:pb-0">
          <div
            ref={heroRef}
            className={`max-w-2xl pb-16 lg:pb-28 ${heroVisible ? 'animate-fade-up' : 'opacity-0'}`}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400">
                Online Healthcare Education
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.08] text-balance">
              Explore a thoughtful approach to healthcare learning
            </h1>
            <p className="mt-7 text-lg text-navy-100/65 leading-[1.6] max-w-xl">
              Explore healthcare subject areas, educational reading and study tools. Check published programme information for current availability and requirements.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                to="/programmes"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-clinical-500 text-white font-semibold hover:bg-clinical-600 transition-colors"
              >
                Explore Programmes
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cpd-courses"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent text-white font-semibold border border-white/25 hover:bg-white/10 transition-colors"
              >
                Explore Learning Resources
              </Link>
            </div>
          </div>
        </div>

        {/* Trust indicators — thin bar at bottom of hero */}
        <div className="relative border-t border-white/10 bg-navy-900/50">
          <div className="max-w-editorial mx-auto px-6 lg:px-10 py-4">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
              {[
                { label: 'Flexible Study' },
                { label: 'CPD-focused learning' },
                { label: 'Clear programme information' },
                { label: 'Global Access' },
                { label: 'Self-Paced' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-navy-100/60">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-xs font-medium tracking-wide">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION — asymmetric, editorial prose with side meta */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">
                  About Clinova
                </div>
                <div className="hidden lg:block text-sm text-navy-400 mt-12">
                  <div className="border-t border-navy-100 pt-4">
                    <div className="flex items-center gap-2 text-navy-600">
                      <Globe className="w-4 h-4 text-teal-500" />
                      <span>Learning resources</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <Reveal delay={100}>
                <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
                  Professional education for the modern healthcare workforce
                </h2>
                <p className="mt-6 text-base md:text-lg text-navy-600/80 leading-[1.65]">
                  Clinova brings together healthcare subject areas, educational reading and study tools to support professional learning and reflection. Programme availability, delivery, admissions and outcomes depend on the published details for each offering.
                </p>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10 border-t border-navy-100 pt-10">
                  {[
                    { stat: 'Explore', label: 'Healthcare study areas' },
                    { stat: String(newsItems.length), label: 'Learning articles' },
                    { stat: 'Compare', label: 'Programme information' },
                    { stat: 'Plan', label: 'Your next learning step' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="font-heading text-3xl font-bold text-navy-800 tabular-nums">{item.stat}</div>
                      <div className="mt-1 text-sm text-navy-500 leading-snug">{item.label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS — editorial grid with mixed sizes, no cards/borders */}
      <section className="py-20 lg:py-32 bg-surface-50">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
            <Reveal className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">
                Departments
              </div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
                Healthcare learning subject areas
              </h2>
            </Reveal>
            <Link
              to="/departments"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-clinical-600 transition-colors shrink-0"
            >
              View All Departments
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {departments.map((dept, i) => (
              <DepartmentCard key={dept.id} department={dept} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROGRAMMES — split header, 3-col grid */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
            <Reveal className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">
                Programmes
              </div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
                Featured learning pathways
              </h2>
            </Reveal>
            <Link
              to="/programmes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-clinical-600 transition-colors shrink-0"
            >
              View All Programmes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {featuredProgrammes.map((prog, i) => (
              <ProgrammeCard key={prog.id} programme={prog} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CPD SECTION — dark band, left-aligned, filter tabs inline */}
      <section className="py-20 lg:py-32 bg-navy-800">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <Reveal className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400 mb-4">
                CPD Courses
              </div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-white leading-[1.15] text-balance">
                Continue your professional development
              </h2>
            </Reveal>
            <Link
              to="/cpd-courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors shrink-0"
            >
              View All CPD Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-1 mb-12">
            {cpdFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setCpdFilter(filter)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  cpdFilter === filter
                    ? 'bg-white text-navy-800'
                    : 'text-navy-100/60 hover:text-white border border-white/15'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredCPD.map((course, i) => (
              <CPDCard key={course.id} course={course} index={i} />
            ))}
          </div>
          {filteredCPD.length === 0 && (
            <div className="text-center py-12 text-navy-100/50">
              <p className="text-sm">No CPD courses found for this filter. Try another category.</p>
            </div>
          )}
        </div>
      </section>

      {/* LEARNING JOURNEY — numbered editorial layout on white */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <Reveal className="max-w-2xl mb-12 lg:mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">
              How It Works
            </div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
              Your learning journey
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {learningSteps.map((step, i) => (
              <Reveal key={step.number} delay={i * 80} className="border-t border-navy-200 pt-6">
                <div className="font-heading text-sm font-bold text-clinical-500 mb-3 tabular-nums">{step.number}</div>
                <h3 className="font-heading font-bold text-navy-800 text-lg mb-2 leading-snug">{step.title}</h3>
                <p className="text-sm text-navy-600/70 leading-relaxed">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL LEARNING — full-width image left, text right, asymmetric */}
      <section className="bg-surface-50">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 relative min-h-[400px] lg:min-h-[560px]">
            <img
              src="https://images.pexels.com/photos/6129657/pexels-photo-6129657.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200"
              alt="Medical professionals collaborating"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-5 flex items-center">
            <Reveal className="px-6 lg:px-12 py-16 lg:py-24 max-w-lg">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500 mb-4">
                Global Learning
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800 leading-[1.15] text-balance">
                Healthcare education without borders
              </h2>
              <p className="mt-5 text-base text-navy-600/80 leading-[1.65]">
                Explore healthcare reading and subject themes from wherever you are. Published programme pages describe the specific services and arrangements available.
              </p>
              <div className="mt-8 space-y-3">
                {['Explore educational material at your own pace', 'Use reflection prompts alongside local guidance', 'Review published programme information', 'Check requirements before making a learning commitment'].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-navy-700 leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/programmes"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-navy-800 text-white font-semibold hover:bg-navy-700 transition-colors"
              >
                Explore Learning Guides
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL PATHWAYS — horizontal stepping on white */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <Reveal className="max-w-2xl mb-12 lg:mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">
              Learning Pathways
            </div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
              Professional pathways
            </h2>
            <p className="mt-5 text-base md:text-lg text-navy-600/80 leading-[1.65]">
              A structured way to explore subject areas, learning resources and published programme information.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
            {pathwaySteps.map((step, i) => (
              <Reveal key={step.label} delay={i * 100} className="border-t-2 border-navy-800 pt-5">
                {i === 0 && (
                  <div className="text-xs font-semibold uppercase tracking-wider text-teal-500 mb-2">Start Here</div>
                )}
                {i === pathwaySteps.length - 1 && (
                  <div className="text-xs font-semibold uppercase tracking-wider text-clinical-500 mb-2">Advanced</div>
                )}
                <h3 className="font-heading font-bold text-navy-800 text-base mb-1">{step.label}</h3>
                <p className="text-xs text-navy-600/70 leading-relaxed">{step.desc}</p>
                {i < pathwaySteps.length - 1 && (
                  <div className="hidden md:block mt-4 text-navy-200">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINING PARTNERS — reversed asymmetric */}
      <section className="bg-surface-50">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 flex items-center order-1 lg:order-1">
            <Reveal className="px-6 lg:px-12 py-16 lg:py-24 max-w-lg">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500 mb-4">
                Training Partners
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800 leading-[1.15] text-balance">
                Explore a possible training partnership
              </h2>
              <p className="mt-5 text-base text-navy-600/80 leading-[1.65]">
                Organisations can use this page to describe their learning needs and enquire about potential collaboration. Any partnership is subject to written agreement and confirmation of scope, resources and delivery.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  'Share your organisation’s learning context',
                  'Describe the topics you want to explore',
                  'Ask about possible delivery models',
                  'Request confirmation of available resources',
                  'Discuss terms only after owner review',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-navy-700 leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/training-partners"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-clinical-500 text-white font-semibold hover:bg-clinical-600 transition-colors"
              >
                Send an Enquiry
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
          <div className="lg:col-span-7 relative min-h-[400px] lg:min-h-[560px] order-2 lg:order-2">
            <img
              src="https://images.pexels.com/photos/5452247/pexels-photo-5452247.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200"
              alt="Healthcare team collaboration"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — editorial pull quotes on dark navy */}


      {/* NEWS & RESOURCES — 3-col, left-aligned header */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
            <Reveal className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">
                News &amp; Resources
              </div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
                Learning library
              </h2>
            </Reveal>
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-clinical-600 transition-colors shrink-0"
            >
              View All Resources
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {newsItems.slice(0, 3).map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — centered, clean */}
      <section className="py-20 lg:py-32 bg-surface-50">
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

      {/* NEWSLETTER */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <NewsletterForm />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 bg-surface-50">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <Reveal className="bg-navy-800 px-8 py-14 md:px-16 md:py-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400">Get Started</span>
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white leading-[1.2] text-balance">
                Ready to explore a learning question?
              </h2>
              <p className="mt-4 text-base text-white/70 leading-[1.65] max-w-lg">
                Explore educational reading and study tools. Review each programme's published details for availability, assessment, recognition and outcomes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/programmes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-navy-800 font-semibold hover:bg-surface-50 transition-colors"
                >
                  Explore Programmes
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/cpd-courses"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent text-white font-semibold border border-white/30 hover:bg-white/10 transition-colors"
                >
                  Browse CPD Courses
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
