import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BookOpenCheck, MapPin, ShieldAlert } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import Reveal from '@/components/Reveal';
import DepartmentCard from '@/components/DepartmentCard';
import NewsCard from '@/components/NewsCard';
import { departments } from '@/data/departments';
import { publishedEducationalArticleCards } from '@/data/educationalArticles';
import { academyLegalIdentity } from '@/data/publicContact';

const pillars = [
  { icon: BookOpenCheck, title: 'CPD education', text: 'A structured CPD learning and learner-access system is being developed. No course is currently open for enrollment.', to: '/cpd-courses', action: 'CPD system status' },
  { icon: BadgeCheck, title: 'Professional certification', text: 'A separate competence-based pathway is being designed. No scheme is currently accepting applications.', to: '/certification', action: 'Certification status' },
  { icon: ShieldAlert, title: 'Assessment and governance', text: 'Course assessments and professional certification decisions require separate approved rules, impartiality controls and evidence.', to: '/assessment', action: 'Assessment development' },
];

export default function HomePage() {
  useSEO({
    title: 'Clinova International Academy | Healthcare Education and Professional Certification',
    description: 'Clinova International Academy public information for healthcare education, CPD system development and separate professional certification proposals.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Clinova International Academy',
      description: 'Healthcare education and professional certification system development.',
    },
  });

  return (
    <>
      <section id="home-hero" className="relative overflow-hidden bg-white" aria-labelledby="home-hero-heading">
        <div className="mx-auto grid max-w-editorial grid-cols-1 items-center gap-10 px-6 pb-14 pt-14 lg:grid-cols-12 lg:gap-14 lg:px-10 lg:pb-20 lg:pt-24">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />Clinova International Academy</p>
            <h1 id="home-hero-heading" className="mt-7 max-w-3xl font-heading text-4xl font-bold leading-[1.06] tracking-tight text-navy-900 text-balance md:text-5xl lg:text-[3.75rem]">Healthcare education and professional certification, clearly separated</h1>
            <p className="mt-6 max-w-2xl text-base leading-[1.75] text-navy-600 md:text-lg">Advancing Healthcare Through Professional Education. Clinova is developing a structured CPD learning system alongside a separate, independently governed professional certification pathway.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/cpd-courses" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-navy-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">CPD course status <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
              <Link to="/certification" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-navy-300 bg-white px-6 py-3.5 text-sm font-semibold text-navy-800 transition hover:bg-surface-50">Professional certification</Link>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-navy-600">No CPD course enrollment, certification application, examination, credential issuance or live verification is currently available through this website.</p>
          </div>
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-navy-100 bg-surface-50 shadow-[0_24px_70px_-36px_rgba(8,43,76,0.35)]">
              <div className="relative h-64 overflow-hidden sm:h-72 lg:h-80">
                <img src="https://images.pexels.com/photos/8376296/pexels-photo-8376296.jpeg?auto=compress&cs=tinysrgb&h=900&w=1400" alt="Healthcare professional reviewing learning material" className="h-full w-full object-cover" loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" aria-hidden="true" />
                <div className="absolute bottom-5 left-5 right-5 text-white"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Three distinct functions</p><p className="mt-2 max-w-sm font-heading text-2xl font-bold leading-tight">Learn. Assess. Decide independently.</p></div>
              </div>
              <div className="divide-y divide-navy-100 bg-white px-5 sm:px-6">
                <Link to="/assessment" className="group flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-semibold text-navy-900">Assessment development</p><p className="mt-1 text-xs text-navy-500">No examination or OSCE is open</p></div><ArrowRight className="h-4 w-4 text-navy-500 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
                <Link to="/verify" className="group flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-semibold text-navy-900">Credential verification</p><p className="mt-1 text-xs text-navy-500">CPD and professional credentials are separate</p></div><ArrowRight className="h-4 w-4 text-navy-500 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-50 px-6 py-16 lg:py-24" aria-labelledby="platform-pillars-heading">
        <div className="mx-auto max-w-editorial lg:px-10">
          <Reveal className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-600">Platform structure</p><h2 id="platform-pillars-heading" className="mt-3 font-heading text-2xl font-bold leading-tight text-navy-900 md:text-3xl lg:text-4xl">Three functions, with clear boundaries</h2><p className="mt-4 leading-relaxed text-navy-600">Course participation is not a professional competence decision. Each service needs its own approval, records, rules and access controls.</p></Reveal>
          <div className="mt-9 grid gap-5 md:grid-cols-3">{pillars.map(({ icon: Icon, title, text, to, action }) => <article key={title} className="flex flex-col rounded-xl border border-navy-100 bg-white p-6"><Icon className="h-6 w-6 text-clinical-700" aria-hidden="true" /><h3 className="mt-4 font-heading text-xl font-bold text-navy-900">{title}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">{text}</p><Link to={to} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">{action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>)}</div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24" aria-labelledby="home-subject-areas-heading">
        <div className="mx-auto max-w-editorial px-6 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"><Reveal className="max-w-2xl"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500">Subject areas</p><h2 id="home-subject-areas-heading" className="font-heading text-2xl font-bold leading-[1.15] text-navy-900 text-balance md:text-3xl lg:text-[2.5rem]">Healthcare disciplines and learning interests</h2></Reveal><Link to="/departments" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy-700 transition-colors hover:text-clinical-600">View subject areas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">{departments.slice(0, 5).map((department, index) => <DepartmentCard key={department.id} department={department} index={index} />)}</div>
          <p className="mt-7 text-xs leading-relaxed text-navy-500">Subject-area information does not represent a course offer, clinical approval, professional qualification or certificate eligibility.</p>
        </div>
      </section>

      <section className="bg-surface-50 py-16 lg:py-24" aria-labelledby="home-institutions-heading">
        <div className="mx-auto grid max-w-editorial gap-8 px-6 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-10">
          <Reveal className="lg:col-span-7"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-clinical-600">For institutions</p><h2 id="home-institutions-heading" className="font-heading text-2xl font-bold leading-tight text-navy-900 md:text-3xl">Institutional learning and collaboration</h2><p className="mt-4 max-w-2xl leading-relaxed text-navy-600">Clinova can provide public information about potential institutional CPD and training collaboration. No partner, placement, agreement or hosted enrollment service is represented as confirmed here.</p></Reveal>
          <div className="lg:col-span-5"><Link to="/training-partners" className="group flex items-center justify-between gap-5 border border-navy-200 bg-white p-6"><div><p className="font-heading text-lg font-bold text-navy-900">Institutional information</p><p className="mt-2 text-sm text-navy-600">Review collaboration status and contact details</p></div><ArrowRight className="h-5 w-5 shrink-0 text-clinical-700 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24" aria-labelledby="home-resources-heading">
        <div className="mx-auto max-w-editorial px-6 lg:px-10"><div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"><Reveal className="max-w-2xl"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500">Resources</p><h2 id="home-resources-heading" className="font-heading text-2xl font-bold leading-[1.15] text-navy-900 text-balance md:text-3xl lg:text-[2.5rem]">Source-linked healthcare education resources</h2><p className="mt-4 leading-relaxed text-navy-600">Explore published articles and educational information. Publication alone does not establish clinical approval.</p></Reveal><Link to="/resources" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy-700 hover:text-clinical-600">View resources <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div><div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{publishedEducationalArticleCards.slice(0, 3).map((item, index) => <NewsCard key={item.id} item={item} index={index} />)}</div></div>
      </section>

      <section id="home-contact" className="bg-surface-50 py-16 lg:py-24" aria-labelledby="home-contact-heading">
        <div className="mx-auto grid max-w-editorial grid-cols-1 gap-8 px-6 lg:grid-cols-12 lg:gap-16 lg:px-10">
          <Reveal className="max-w-2xl lg:col-span-7"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-clinical-600">Legal identity and contact</p><h2 id="home-contact-heading" className="font-heading text-2xl font-bold leading-[1.15] text-navy-900 text-balance md:text-3xl lg:text-[2.5rem]">{academyLegalIdentity.legalName}</h2><p className="mt-5 leading-relaxed text-navy-600">The registered office is a virtual address, not a campus, visiting location or public-facing venue. No verified public email address or online enquiry submission is available.</p><dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Acronym</dt><dd className="mt-1 text-sm font-semibold text-navy-800">{academyLegalIdentity.acronym}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Company number</dt><dd className="mt-1 text-sm font-semibold text-navy-800">{academyLegalIdentity.companyNumber}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Date of incorporation</dt><dd className="mt-1 text-sm font-semibold text-navy-800"><time dateTime={academyLegalIdentity.incorporationDate}>14 October 2025</time></dd></div></dl><Link to="/contact" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">View contact information <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Reveal>
          <address className="not-italic border-t-2 border-navy-800 bg-white p-6 md:p-8 lg:col-span-5"><MapPin className="h-5 w-5 text-clinical-700" aria-hidden="true" /><p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">{academyLegalIdentity.registeredOfficeLabel}</p><p className="mt-2 font-heading text-xl font-semibold text-navy-900">Registered office</p><p className="mt-3 text-sm leading-relaxed text-navy-700">{academyLegalIdentity.registeredOfficeAddress}</p><p className="mt-4 text-xs leading-relaxed text-navy-600">{academyLegalIdentity.registeredOfficeNotice}</p><p className="mt-5 border-t border-navy-200 pt-4 text-xs leading-relaxed text-navy-600">Do not include patient information, medical records, identity documents, passwords or payment card details in general correspondence.</p></address>
        </div>
      </section>
    </>
  );
}
