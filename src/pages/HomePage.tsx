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
import { publishedCPDCourses, cpdFilters } from '@/data/cpdCourses';
import { publishedNewsItems as newsItems, generalFAQs } from '@/data/content';
import { useState } from 'react';

const learningSteps = [
  { number: '01', title: 'Confirm the content', desc: 'Verify the course outline, audience and intended learning outcomes.' },
  { number: '02', title: 'Review the material', desc: 'Complete appropriate clinical and editorial review before publication.' },
  { number: '03', title: 'Confirm the terms', desc: 'Verify availability, fees, delivery, assessment and any recognition.' },
  { number: '04', title: 'Publish verified details', desc: 'Make an offering visible only after the academy approves its public information.' }
];

const pathwaySteps = [
  { label: 'Content review', desc: 'Check accuracy and suitability' },
  { label: 'Academy confirmation', desc: 'Verify offering details and terms' },
  { label: 'Publication approval', desc: 'Approve public-facing information' },
  { label: 'Availability notice', desc: 'Publish only confirmed offerings' }
];

export default function HomePage() {
  useSEO({
    title: 'Clinova International Academy | Advancing Healthcare Through Professional Education',
    description:
      'Clinova International Academy is preparing healthcare education information for review. Course availability, recognition, delivery and enrolment are not confirmed.'
  });

  const featuredProgrammes = getFeaturedProgrammes();
  const [cpdFilter, setCpdFilter] = useState('All');
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation<HTMLDivElement>();

  const filteredCPD =
    cpdFilter === 'All'
      ? publishedCPDCourses.slice(0, 4)
      : publishedCPDCourses.filter((c) => c.department.toLowerCase().includes(cpdFilter.toLowerCase())).slice(0, 4);

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
                Healthcare Education
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.08] text-balance">
              Professional learning for healthcare professionals
            </h1>
            <p className="mt-7 text-lg text-navy-100/65 leading-[1.6] max-w-xl">
              Clinova is preparing educational information for healthcare professionals. Course availability, delivery, recognition and enrolment are not yet confirmed.
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
                Browse CPD Courses
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
                { label: 'Proposed learning outlines' },
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
                      <span>Professional education</span>
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
                  Clinova is preparing educational information for healthcare professionals. Programme availability, delivery, fees, recognition and learner services have not yet been confirmed. Only academy-approved offerings should be presented as available.
                </p>
                <div className="mt-10 border-t border-navy-100 pt-8">
                  <p className="text-sm leading-relaxed text-navy-600">Course dates, fees, teaching arrangements, CPD recognition, certificates and learner access will be published only after confirmation.</p>
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
                Subject areas
              </div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
                Healthcare topics under consideration
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
                Featured programmes
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
          {featuredProgrammes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {featuredProgrammes.map((prog, i) => <ProgrammeCard key={prog.id} programme={prog} index={i} />)}
            </div>
          ) : (
            <p className="border border-navy-100 bg-surface-50 p-6 text-sm leading-relaxed text-navy-700">No programmes are currently approved for publication. Confirmed offerings will appear here when the academy has verified their availability and terms.</p>
          )}
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
          {publishedCPDCourses.length > 0 && <div className="flex flex-wrap gap-1 mb-12">
            {cpdFilters.map((filter) => (
              <button type="button" key={filter} onClick={() => setCpdFilter(filter)} className={`px-4 py-2 text-sm font-medium transition-colors ${cpdFilter === filter ? 'bg-white text-navy-800' : 'text-navy-100/60 hover:text-white border border-white/15'}`}>{filter}</button>
            ))}
          </div>}
{publishedCPDCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {filteredCPD.map((course, i) => <CPDCard key={course.id} course={course} index={i} />)}
            </div>
          ) : (
            <p className="border border-white/15 bg-white/5 p-6 text-sm leading-relaxed text-navy-100/80">No CPD courses are currently approved for publication. Verified course details and recognised hours will appear here after academy review.</p>
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
              How information reaches publication
            </h2>
            <p className="mt-4 text-sm text-navy-600/70 leading-relaxed">Course information is published only after availability, terms and any recognition have been confirmed.</p>
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
                Education details will follow review
              </h2>
              <p className="mt-5 text-base text-navy-600/80 leading-[1.65]">
                Clinova is preparing a proposed approach to professional learning. The academy has not confirmed an active online learning platform, enrolment service or learner dashboard.
              </p>
              <div className="mt-8 space-y-3">
                {['Course availability and delivery will be confirmed before enrolment', 'No learner dashboard or progress tracking is currently available', 'Recognition and certificates are not yet confirmed', 'Published content will follow academy review'].map((point) => (
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
                Explore Online Programmes
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
              Publication process
            </h2>
            <p className="mt-5 text-base md:text-lg text-navy-600/80 leading-[1.65]">
              This process describes publication controls, not a course, enrolment pathway or promise of outcomes.
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
                Become a Clinova training partner
              </h2>
              <p className="mt-5 text-base text-navy-600/80 leading-[1.65]">
                Clinova is reviewing potential partnership pathways. No delivery arrangements or partner agreements are currently confirmed.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  'Partnership criteria and arrangements are being prepared',
                  'No partnership agreement is implied by this page',
                  'Delivery and learner support require written confirmation',
                  'Certification arrangements are not confirmed',
                  'Enquiries remain unavailable until the submission service is verified',
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
                Partner With Clinova
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

      {/* LEARNING PRINCIPLES — transparent alternative to unverified testimonials */}
      <section className="py-20 lg:py-32 bg-navy-800">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <Reveal className="max-w-2xl mb-12 lg:mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400 mb-4">
              Our approach
            </div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-white leading-[1.15] text-balance">
              Learning designed for professional practice
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-navy-100/70">
              We do not publish unverified learner testimonials, course claims or outcomes. Availability, recognition and learner-service details are shown only after the relevant facts and workflows are confirmed.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              ['Clear outcomes', 'Approved learning objectives will be displayed after a programme has been reviewed and made available.'],
              ['Evidence-informed content', 'Educational resources will be published after clinical and editorial review.'],
              ['Respect for scope', 'Accreditation, partnerships, learner outcomes and certificates are described only when the relevant facts and workflows are confirmed.'],
            ].map(([title, description]) => (
              <div key={title} className="border-t border-white/15 pt-5">
                <h3 className="font-heading font-bold text-white text-lg">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-100/65">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS & RESOURCES — 3-col, left-aligned header */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
            <Reveal className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">
                News &amp; Resources
              </div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
                Latest from Clinova
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
          {newsItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {newsItems.slice(0, 3).map((item, i) => <NewsCard key={item.id} item={item} index={i} />)}
            </div>
          ) : (
            <p className="border border-navy-100 bg-surface-50 p-6 text-sm leading-relaxed text-navy-700">Articles will appear here after editorial and clinical approval. No review snapshots are presented as published academy news.</p>
          )}
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
                Ready to advance your healthcare career?
              </h2>
              <p className="mt-4 text-base text-white/70 leading-[1.65] max-w-lg">
                Explore our programmes and start your professional development journey today.
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
