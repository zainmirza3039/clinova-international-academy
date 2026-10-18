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
import TestimonialCard from '@/components/TestimonialCard';
import NewsCard from '@/components/NewsCard';
import FAQAccordion from '@/components/FAQAccordion';
import NewsletterForm from '@/components/NewsletterForm';
import { departments } from '@/data/departments';
import { getFeaturedProgrammes } from '@/data/programmes';
import { cpdCourses, cpdFilters } from '@/data/cpdCourses';
import { testimonials, newsItems, generalFAQs } from '@/data/testimonials';
import { useState } from 'react';

const learningSteps = [
  { number: '01', title: 'Choose Your Programme', desc: 'Browse our catalogue and select a programme that fits your professional goals.' },
  { number: '02', title: 'Study Online', desc: 'Access video lessons, reading materials and resources through our online platform.' },
  { number: '03', title: 'Complete Assessment', desc: 'Demonstrate your understanding through quizzes, assignments and case studies.' },
  { number: '04', title: 'Receive Your Certificate', desc: 'Get your digital Certificate of Completion upon successful programme completion.' },
];

const pathwaySteps = [
  { label: 'Certificate Courses', desc: 'Start with focused short programmes' },
  { label: 'Professional Development', desc: 'Build specialised professional skills' },
  { label: 'Diploma Programmes', desc: 'Undertake comprehensive study' },
  { label: 'Advanced Learning', desc: 'Continue your educational journey' },
];

export default function HomePage() {
  useSEO({
    title: 'Clinova International Academy | Advancing Healthcare Through Professional Education',
    description:
      'Flexible online healthcare education for professionals. CPD-focused courses, certificate and diploma programmes across physiotherapy, nursing, medicine, psychology and more.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Clinova International Academy',
      description: 'Online healthcare education, CPD and professional development for healthcare professionals.',
      url: 'https://clinovaacademy.co.uk',
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
              Advance your healthcare career through professional education
            </h1>
            <p className="mt-7 text-lg text-navy-100/65 leading-[1.6] max-w-xl">
              Flexible online learning designed for healthcare professionals seeking practical knowledge, professional
              development and CPD-focused education.
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
                { label: 'Digital Certificates' },
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
                      <span>Worldwide online learning</span>
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
                  Clinova provides structured online educational opportunities for healthcare professionals who want to
                  expand knowledge, maintain professional development and develop clinically relevant skills. Our
                  programmes span ten healthcare disciplines and are delivered entirely online, designed to fit around
                  the demands of clinical practice.
                </p>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10 border-t border-navy-100 pt-10">
                  {[
                    { stat: '10', label: 'Healthcare departments' },
                    { stat: '12+', label: 'CPD courses available' },
                    { stat: '100%', label: 'Online delivery' },
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
                Ten healthcare disciplines, one learning platform
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
                Clinova's virtual learning model enables healthcare professionals to access educational content regardless
                of location. Our online platform brings structured healthcare education to professionals across the world.
              </p>
              <div className="mt-8 space-y-3">
                {['Learn from anywhere with an internet connection', 'Study at your own pace and schedule', 'Join a global community of healthcare learners', 'Access the same quality content worldwide'].map((point) => (
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
              Professional pathways
            </h2>
            <p className="mt-5 text-base md:text-lg text-navy-600/80 leading-[1.65]">
              A conceptual learning pathway to guide your professional development — from foundational certificates to advanced study.
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
                Work with Clinova to deliver structured professional education within your organisation or professional network.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  'Structured programmes tailored to your organisation',
                  'Comprehensive learner support',
                  'Digital certification for your team',
                  'Professional educational resources',
                  'Dedicated partnership support',
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

      {/* TESTIMONIALS — editorial pull quotes on dark navy */}
      <section className="py-20 lg:py-32 bg-navy-800">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <Reveal className="max-w-2xl mb-12 lg:mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400 mb-4">
              Testimonials
            </div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-white leading-[1.15] text-balance">
              What learners say about Clinova
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i} />
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
