import { Link } from 'react-router-dom';
import {
  ArrowRight, Globe,
  ShieldCheck, CheckCircle,
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Reveal from '@/components/Reveal';
import DepartmentCard from '@/components/DepartmentCard';
import CPDCard from '@/components/CPDCard';
import NewsCard from '@/components/NewsCard';
import FAQAccordion from '@/components/FAQAccordion';
import NewsletterForm from '@/components/NewsletterForm';
import { departments } from '@/data/departments';
import { publishedCPDCourses, cpdFilters } from '@/data/cpdCourses';
import { generalFAQs } from '@/data/testimonials';
import { publishedEducationalArticleCards } from '@/data/educationalArticles';
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

  const [cpdFilter, setCpdFilter] = useState('All');
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation<HTMLDivElement>();

  const filteredCPD =
    cpdFilter === 'All'
      ? publishedCPDCourses.slice(0, 4)
      : publishedCPDCourses.filter((c) => c.department.toLowerCase().includes(cpdFilter.toLowerCase())).slice(0, 4);

  return (
    <>
      {/* HERO — editorial hierarchy with a purposeful learning panel */}
      <section className="relative overflow-hidden bg-white">
        <div aria-hidden="true" className="absolute -right-32 -top-24 h-[30rem] w-[30rem] rounded-full bg-teal-50 blur-3xl" />
        <div className="relative max-w-editorial mx-auto px-6 lg:px-10 pt-14 pb-12 lg:pt-24 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div ref={heroRef} className={`lg:col-span-7 max-w-3xl ${heroVisible ? 'animate-fade-up' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                Healthcare education
              </div>
              <h1 className="mt-7 max-w-3xl font-heading text-4xl md:text-5xl lg:text-[3.75rem] font-bold text-navy-900 leading-[1.06] tracking-tight text-balance">
                Better learning for better healthcare practice.
              </h1>
              <p className="mt-6 max-w-2xl text-base md:text-lg text-navy-600 leading-[1.75]">
                Explore healthcare disciplines, practical learning resources and professional development pathways designed to support informed, reflective practice.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/cpd-courses" className="group inline-flex items-center justify-center gap-2 rounded-md bg-navy-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-500">
                  Explore self-study courses <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/cpd-courses" className="inline-flex items-center justify-center gap-2 rounded-md border border-navy-200 bg-white px-6 py-3.5 text-sm font-semibold text-navy-800 transition hover:border-navy-400 hover:bg-surface-50">
                  Browse courses
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-navy-100 pt-5 text-sm text-navy-600">
                {['Clinical subject areas', 'Learning resources', 'Clear programme information'].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-teal-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-navy-100 bg-surface-50 shadow-[0_24px_70px_-36px_rgba(8,43,76,0.35)]">
                <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
                  <img src="https://images.pexels.com/photos/8376296/pexels-photo-8376296.jpeg?auto=compress&cs=tinysrgb&h=900&w=1400" alt="Healthcare professional reviewing learning material" className="h-full w-full object-cover" loading="eager" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Learn with purpose</p>
                    <p className="mt-2 max-w-sm font-heading text-2xl font-bold leading-tight">Build knowledge. Reflect on practice. Keep progressing.</p>
                  </div>
                </div>
                <div className="space-y-0 divide-y divide-navy-100 bg-white px-5 sm:px-6">
                  <Link to="/departments" className="group flex items-center justify-between gap-4 py-4">
                    <div><p className="text-sm font-semibold text-navy-900">Explore subject areas</p><p className="mt-1 text-xs text-navy-500">Browse healthcare disciplines</p></div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy-500 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" />
                  </Link>
                  <Link to="/resources" className="group flex items-center justify-between gap-4 py-4">
                    <div><p className="text-sm font-semibold text-navy-900">Read learning resources</p><p className="mt-1 text-xs text-navy-500">Explore articles and study tools</p></div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy-500 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" />
                  </Link>
                  <Link to="/training-partners" className="group flex items-center justify-between gap-4 py-4">
                    <div><p className="text-sm font-semibold text-navy-900">Discuss collaboration</p><p className="mt-1 text-xs text-navy-500">Enquire about potential partnerships</p></div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy-500 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" />
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-navy-500">Course availability, recognition and delivery are stated only where confirmed.</p>
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
                    { stat: String(publishedEducationalArticleCards.length), label: 'Learning articles' },
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
                Open courses
              </div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
                Featured self-study courses
              </h2>
            </Reveal>
            <Link
              to="/programmes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-clinical-600 transition-colors shrink-0"
            >
              View All Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {publishedCPDCourses.slice(0, 3).map((course, i) => (
              <CPDCard key={course.id} course={course} index={i} />
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
                Professional Development
              </div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-white leading-[1.15] text-balance">
                Continue your professional development
              </h2>
            </Reveal>
            <Link
              to="/cpd-courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors shrink-0"
            >
              View All Professional Development
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
                Explore structured self-study courses and source-linked healthcare learning material from wherever you are. These open courses do not award accredited CPD hours or certificates.
              </p>
              <div className="mt-8 space-y-3">
                {['Explore educational material at your own pace', 'Use reflection prompts alongside local guidance', 'Work through structured course lessons', 'Check requirements before making a learning commitment'].map((point) => (
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
                Browse Courses
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
            {publishedEducationalArticleCards.slice(0, 3).map((item, i) => (
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
                Explore source-linked course lessons and study tools. Course pages describe the learning material; accredited CPD hours, certificates and learner progress are not provided.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/programmes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-navy-800 font-semibold hover:bg-surface-50 transition-colors"
                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/cpd-courses"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent text-white font-semibold border border-white/30 hover:bg-white/10 transition-colors"
                >
                  Browse Professional Development
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
