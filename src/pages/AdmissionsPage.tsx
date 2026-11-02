import { ArrowRight, BookOpen, Compass, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

const learningRoutes = [
  {
    icon: Compass,
    title: 'Browse subject areas',
    text: 'Explore the healthcare disciplines and topic areas currently represented in the directory.',
    linkLabel: 'View subject areas',
    to: '/departments',
  },
  {
    icon: BookOpen,
    title: 'Read self-study guides',
    text: 'Search the published course catalogue and review each independent study outline.',
    linkLabel: 'Browse self-study courses',
    to: '/cpd-courses',
  },
  {
    icon: Newspaper,
    title: 'Explore educational reading',
    text: 'Find source-linked articles and reading-based study tools for professional reflection.',
    linkLabel: 'Open articles and resources',
    to: '/resources',
  },
];

export default function AdmissionsPage() {
  useSEO({
    title: 'Learner and Admissions Information',
    description: 'Explore Clinova’s published healthcare learning resources and check current admissions and learner-service availability.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Learner information' }]}
        eyebrow="Learner information"
        title="Explore your learning options"
        description="Start with Clinova’s published subject areas, independent study guides and educational reading. Online applications, enrolment and payment processing are not available through this website."
      />

      <section className="bg-white px-6 py-12 lg:py-16" aria-labelledby="admissions-status-heading">
        <div className="mx-auto max-w-4xl border border-amber-300 bg-amber-50 p-6 md:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">Current service status</p>
          <h2 id="admissions-status-heading" className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">
            Student access and online applications are unavailable
          </h2>
          <p className="mt-4 leading-relaxed text-navy-700">
            This page provides information only; it does not accept applications, enrol learners or process payments. Course and programme pages are educational listings, not an offer of admission. Check each published page for its current scope and status.
          </p>
          <Link to="/application" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clinical-600">
            Read application information <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="bg-surface-50 px-6 py-16 lg:py-20" aria-labelledby="learning-routes-heading">
        <div className="mx-auto max-w-editorial lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">Explore the current learning material</p>
            <h2 id="learning-routes-heading" className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">Choose a place to begin</h2>
            <p className="mt-4 leading-relaxed text-navy-600">Browse what is currently published; no live admissions or learner-support service is implied by these links.</p>
          </div>
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            {learningRoutes.map(({ icon: Icon, title, text, linkLabel, to }) => (
              <article key={title} className="flex h-full flex-col border border-navy-200 bg-white p-6">
                <Icon className="h-6 w-6 text-clinical-700" aria-hidden="true" />
                <h3 className="mt-4 font-heading text-lg font-bold text-navy-900">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">{text}</p>
                <Link to={to} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clinical-600">
                  {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-800 px-6 py-14" aria-labelledby="admissions-contact-heading">
        <div className="mx-auto flex max-w-editorial flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <h2 id="admissions-contact-heading" className="font-heading text-xl font-bold text-white">Need clarification about a published resource?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-100/75">Online enquiry submissions are unavailable. The Contact page lists the confirmed postal address and the optional secondary phone contact with its stated role.</p>
          </div>
          <Link to="/contact" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-navy-900 hover:bg-surface-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            View contact details <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
