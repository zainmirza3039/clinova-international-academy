import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, MapPin } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Reveal from '@/components/Reveal';
import DepartmentCard from '@/components/DepartmentCard';
import CPDCard from '@/components/CPDCard';
import NewsCard from '@/components/NewsCard';
import FAQAccordion from '@/components/FAQAccordion';
import { departments } from '@/data/departments';
import { publishedCPDCourses, cpdFilters } from '@/data/cpdCourses';
import { generalFAQs } from '@/data/testimonials';
import { publishedEducationalArticleCards } from '@/data/educationalArticles';
import { academyLegalIdentity } from '@/data/publicContact';
import { learnerDataEnabled, selfStudyLearningEnabled } from '@/lib/siteConfig';

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
  const learnerServicesAvailable = learnerDataEnabled && selfStudyLearningEnabled;
  const filteredCPD =
    cpdFilter === 'All'
      ? publishedCPDCourses.slice(0, 4)
      : publishedCPDCourses.filter((course) => course.department.toLowerCase().includes(cpdFilter.toLowerCase())).slice(0, 4);

  return (
    <>
      <section id="home-hero" className="home-hero relative overflow-hidden bg-white" aria-labelledby="home-hero-heading">
        <div className="home-hero__inner relative max-w-editorial mx-auto px-6 lg:px-10 pt-14 pb-12 lg:pt-24 lg:pb-20">
          <div className="home-hero__layout grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div ref={heroRef} className={`home-hero__copy lg:col-span-7 max-w-3xl ${heroVisible ? 'animate-fade-up' : 'opacity-0'}`}>
              <div className="home-hero__eyebrow inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />
                Healthcare education
              </div>
              <h1 id="home-hero-heading" className="home-hero__title mt-7 max-w-3xl font-heading text-4xl md:text-5xl lg:text-[3.75rem] font-bold text-navy-900 leading-[1.06] tracking-tight text-balance">
                Advance Your Healthcare Career with Clinova
              </h1>
              <p className="mt-6 max-w-2xl text-base md:text-lg text-navy-600 leading-[1.75]">
                Advancing Healthcare Through Professional Education. Explore published subject areas, independent study materials and source-linked learning resources. Course availability, delivery and recognition are stated only when confirmed.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/cpd-courses" className="group inline-flex items-center justify-center gap-2 rounded-md bg-navy-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-500">
                  Explore self-study guides <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <Link to="/clinical-internships" className="inline-flex items-center justify-center gap-2 rounded-md border border-navy-200 bg-white px-6 py-3.5 text-sm font-semibold text-navy-800 transition hover:border-navy-400 hover:bg-surface-50">
                  View internship status
                </Link>
              </div>
              <Link to="/training-partners" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4 hover:text-clinical-600">
                Read partnership information <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-navy-100 pt-5 text-sm text-navy-600">
                {['Clinical subject areas', 'Learning resources', 'Clear course information'].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="home-hero__visual lg:col-span-5">
              <div className="home-hero__frame relative overflow-hidden rounded-2xl border border-navy-100 bg-surface-50 shadow-[0_24px_70px_-36px_rgba(8,43,76,0.35)]">
                <div className="home-hero__photo relative h-56 sm:h-64 lg:h-72 overflow-hidden">
                  <img src="https://images.pexels.com/photos/8376296/pexels-photo-8376296.jpeg?auto=compress&cs=tinysrgb&h=900&w=1400" alt="Healthcare professional reviewing learning material" className="h-full w-full object-cover" loading="eager" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" aria-hidden="true" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Learn with purpose</p>
                    <p className="mt-2 max-w-sm font-heading text-2xl font-bold leading-tight">Build knowledge. Reflect on practice. Keep progressing.</p>
                  </div>
                </div>
                <nav className="home-hero__links space-y-0 divide-y divide-navy-100 bg-white px-5 sm:px-6" aria-label="Explore Clinova">
                  <Link to="/departments" className="group flex items-center justify-between gap-4 py-4">
                    <div><p className="text-sm font-semibold text-navy-900">Explore subject areas</p><p className="mt-1 text-xs text-navy-500">Browse healthcare disciplines</p></div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy-500 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" aria-hidden="true" />
                  </Link>
                  <Link to="/resources" className="group flex items-center justify-between gap-4 py-4">
                    <div><p className="text-sm font-semibold text-navy-900">Read learning resources</p><p className="mt-1 text-xs text-navy-500">Explore articles and study tools</p></div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy-500 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" aria-hidden="true" />
                  </Link>
                  <Link to="/training-partners" className="group flex items-center justify-between gap-4 py-4">
                    <div><p className="text-sm font-semibold text-navy-900">Partnership information</p><p className="mt-1 text-xs text-navy-500">Read about future collaboration</p></div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy-500 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" aria-hidden="true" />
                  </Link>
                </nav>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-navy-500">No verified clinical placements are currently listed. Learner enrolment is unavailable while learner services are disabled.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="home-browse" className="home-intro py-20 lg:py-28 bg-white" aria-labelledby="home-browse-heading">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500">Browse the learning library</p>
            <h2 id="home-browse-heading" className="mt-3 font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">
              Start with a subject, a study guide or an article
            </h2>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-navy-600/80 leading-[1.65]">
              Explore Clinova’s healthcare subject areas, read independent learning material and review course details before choosing what to study.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <Link to="/departments" className="group border-t-2 border-navy-800 bg-surface-50 p-6 transition-colors hover:bg-[#ebe9e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clinical-500">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Browse</p>
              <h3 className="mt-3 font-heading text-xl font-semibold text-navy-900">Healthcare subject areas</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">Explore the disciplines and learning areas in the published catalogue.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700">View subject areas <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
            <Link to="/cpd-courses" className="group border-t-2 border-navy-800 bg-surface-50 p-6 transition-colors hover:bg-[#ebe9e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clinical-500">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Study</p>
              <h3 className="mt-3 font-heading text-xl font-semibold text-navy-900">Self-study course guides</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">Review published learning outlines and the information available for each guide.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700">Browse study guides <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
            <Link to="/resources" className="group border-t-2 border-navy-800 bg-surface-50 p-6 transition-colors hover:bg-[#ebe9e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clinical-500">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Read</p>
              <h3 className="mt-3 font-heading text-xl font-semibold text-navy-900">Educational articles</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">Find source-linked material for professional learning and reflection.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700">Open the learning library <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
          </div>
        </div>
      </section>

      <section id="home-pathways" className="bg-surface-50 px-6 py-16 lg:py-24" aria-labelledby="service-divisions-heading">
        <div className="mx-auto max-w-editorial lg:px-10">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-600">Two distinct service divisions</p>
            <h2 id="service-divisions-heading" className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl lg:text-4xl">Choose the learning route that fits your purpose</h2>
            <p className="mt-4 leading-relaxed text-navy-600">Independent online study is not a clinical placement. Each route has different delivery, supervision, records and recognition requirements.</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="flex flex-col border border-navy-200 bg-white p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Division A · Online CPD &amp; self-paced learning</p>
              <h3 className="mt-3 font-heading text-xl font-bold text-navy-900">Open self-study resources</h3>
              <p className="mt-4 flex-1 leading-relaxed text-navy-600">
                The current catalogue provides independent study materials. {learnerServicesAvailable ? 'Review each course page for the learner options currently enabled.' : 'Learner enrolment and saved progress are not available in this build.'} Graded assessments, awarded CPD hours and completion certificates are not currently available. No accreditation should be inferred.
              </p>
              <Link to="/cpd-courses" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4 hover:text-clinical-600">Explore online learning <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </article>
            <article className="flex flex-col border border-navy-200 bg-white p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Division B · Institutional collaboration &amp; clinical internships</p>
              <h3 className="mt-3 font-heading text-xl font-bold text-navy-900">Future practical training would require an approved partner</h3>
              <p className="mt-4 flex-1 leading-relaxed text-navy-600">A partner institution—not Clinova acting alone—would deliver and supervise any clinical placement under a written agreement. No verified placement listings, application workflow or partner-backed certificate is currently available.</p>
              <Link to="/clinical-internships" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4 hover:text-clinical-600">View internship status <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </article>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-navy-600">For organisations considering a future collaboration, the partnership page offers a local-only draft checker; it does not submit or save an enquiry.</p>
          <div className="mt-5 flex flex-col gap-3 border border-navy-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-900">Teach, author or review with Clinova</p>
              <p className="mt-1 text-sm leading-relaxed text-navy-600">Instructor applications are not currently open, and this site does not collect credentials or CVs.</p>
            </div>
            <Link to="/become-an-instructor" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4 hover:text-clinical-600">Read instructor status <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-5">
            <Link to="/training-partners" className="inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4 hover:text-clinical-600">Review Partnership Information <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section id="home-subject-areas" className="py-20 lg:py-28 bg-white" aria-labelledby="home-subject-areas-heading">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">Departments</p>
              <h2 id="home-subject-areas-heading" className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">Healthcare learning subject areas</h2>
            </Reveal>
            <Link to="/departments" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-clinical-600 transition-colors shrink-0">
              View all subject areas <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {departments.map((department, index) => <DepartmentCard key={department.id} department={department} index={index} />)}
          </div>
        </div>
      </section>

      <section id="home-self-study" className="home-course-section py-20 lg:py-28 bg-surface-50" aria-labelledby="home-self-study-heading">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-600 mb-4">Self-study course guides</p>
              <h2 id="home-self-study-heading" className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-900 leading-[1.15] text-balance">Explore published learning material</h2>
              <p className="mt-4 text-sm leading-relaxed text-navy-600">These guides are for independent study. No approved CPD-hour value or certificate is listed. {learnerServicesAvailable ? 'Review each course page for the learner options currently enabled.' : 'Learner enrolment and saved progress are not available while learner services are disabled.'}</p>
            </Reveal>
            <Link to="/cpd-courses" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-clinical-600 transition-colors shrink-0">
              View all study guides <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-1 mb-10" role="group" aria-label="Filter self-study courses by subject">
            {cpdFilters.map((filter) => (
              <button key={filter} type="button" aria-pressed={cpdFilter === filter} onClick={() => setCpdFilter(filter)} className={`px-4 py-2 text-sm font-medium transition-colors ${cpdFilter === filter ? 'bg-white text-navy-800' : 'text-navy-700/70 hover:text-navy-900 border border-navy-200'}`}>
                {filter}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredCPD.map((course, index) => <CPDCard key={course.id} course={course} index={index} />)}
          </div>
          {filteredCPD.length === 0 && (
            <div className="py-12 text-center text-navy-600" role="status" aria-live="polite">
              <p className="text-sm">No self-study courses found for this filter. Try another category.</p>
            </div>
          )}
        </div>
      </section>

      <section id="home-resources" className="py-20 lg:py-28 bg-white" aria-labelledby="home-resources-heading">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4">Articles &amp; resources</p>
              <h2 id="home-resources-heading" className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance">Learning library</h2>
              <p className="mt-4 text-base text-navy-600/80 leading-relaxed">Read published educational articles with source links for further reading.</p>
            </Reveal>
            <Link to="/resources" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-clinical-600 transition-colors shrink-0">
              View all resources <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {publishedEducationalArticleCards.slice(0, 3).map((item, index) => <NewsCard key={item.id} item={item} index={index} />)}
          </div>
        </div>
      </section>

      <section id="home-faq" className="py-20 lg:py-24 bg-surface-50" aria-labelledby="home-faq-heading">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-12 lg:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4 text-center">FAQs</p>
            <h2 id="home-faq-heading" className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-800 leading-[1.15] text-balance text-center">Frequently asked questions</h2>
          </Reveal>
          <FAQAccordion items={generalFAQs} />
        </div>
      </section>

      <section id="home-contact" className="py-20 lg:py-24 bg-white" aria-labelledby="home-contact-heading">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-600 mb-4">Legal identity &amp; contact</p>
              <h2 id="home-contact-heading" className="font-heading text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-navy-900 leading-[1.15] text-balance">{academyLegalIdentity.legalName}</h2>
              <p className="mt-5 text-base text-navy-600 leading-relaxed">The registered office is a virtual address, not a campus, visiting location, or public-facing venue. No verified public email address or online enquiry submission is available.</p>
              <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Acronym</dt><dd className="mt-1 text-sm font-semibold text-navy-800">{academyLegalIdentity.acronym}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Company number</dt><dd className="mt-1 text-sm font-semibold text-navy-800">{academyLegalIdentity.companyNumber}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Date of incorporation</dt><dd className="mt-1 text-sm font-semibold text-navy-800"><time dateTime={academyLegalIdentity.incorporationDate}>14 October 2025</time></dd></div>
              </dl>
              <Link to="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4 hover:text-clinical-600">View contact information <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </Reveal>
            <address className="not-italic lg:col-span-5 border-t-2 border-navy-800 bg-surface-50 p-6 md:p-8">
              <MapPin className="h-5 w-5 text-clinical-700" aria-hidden="true" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">{academyLegalIdentity.registeredOfficeLabel}</p>
              <p className="mt-2 font-heading text-xl font-semibold text-navy-900">Registered office</p>
              <p className="mt-3 text-sm leading-relaxed text-navy-700">{academyLegalIdentity.registeredOfficeAddress}</p>
              <p className="mt-4 text-xs leading-relaxed text-navy-600">{academyLegalIdentity.registeredOfficeNotice}</p>
              <p className="mt-5 border-t border-navy-200 pt-4 text-xs leading-relaxed text-navy-600">Do not include patient information, medical records, identity documents, passwords or payment card details in general correspondence.</p>
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
