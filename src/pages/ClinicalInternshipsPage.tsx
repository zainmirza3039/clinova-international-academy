import { ArrowRight, Building2, ClipboardCheck, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

const publicationRequirements = [
  {
    icon: Building2,
    title: 'Verified institution and written agreement',
    description: 'Confirm the organisation, authorised contact, delivery responsibilities, data handling and the exact scope of any partnership before publishing an opportunity.',
  },
  {
    icon: ClipboardCheck,
    title: 'Clear placement terms',
    description: 'A future listing should state its eligibility, location, dates, duration, available places, fees, working hours and application deadline.',
  },
  {
    icon: Users,
    title: 'Named supervision and assessment',
    description: 'The delivering institution would define supervision, attendance, practical competencies, assessment, safeguarding and escalation arrangements.',
  },
  {
    icon: ShieldCheck,
    title: 'Accurate completion and certificate claims',
    description: 'Any completion record would depend on verified partner records and agreed sign-off. It must identify each organisation’s role and must not imply unverified accreditation.',
  },
];

const internshipFaqs = [
  {
    question: 'Are clinical placements available now?',
    answer: 'No verified clinical placements are currently listed. This page does not confirm a partner, supervisor, placement dates, seats, fees or an application route.',
  },
  {
    question: 'Who would deliver and supervise a placement?',
    answer: 'For any future collaboration, practical training would be delivered and supervised by the partner institution under a written, agreed scope. Clinova would not independently deliver the partner’s clinical training.',
  },
  {
    question: 'Can I apply for an internship through this website?',
    answer: 'No. Internship applications and placement decisions are not available through this website. The organisation-focused partnership draft checker is not a student application and does not submit or save information.',
  },
  {
    question: 'Does this page confirm CPD hours or a certificate?',
    answer: 'No. This page establishes no CPD approval, certificate eligibility or issued certificate. Any future recognition would depend on verified requirements and approved arrangements.',
  },
];

export default function ClinicalInternshipsPage() {
  useSEO({
    title: 'Clinical Internships and Practical Training',
    description: 'Understand Clinova’s intended partner-delivered clinical placement model and check whether verified opportunities are currently available.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Clinical Internships' }]}
        eyebrow="Institutional collaboration"
        title="Clinical internships & partner-delivered practical training"
        description="Clinical placements are separate from CPD education and professional certification. Practical training would be delivered and supervised by an approved partner institution under an agreed scope; Clinova would not independently deliver a partner’s clinical training."
      />

      <section className="bg-white px-6 py-14 lg:py-20" aria-labelledby="placement-status-heading">
        <div className="mx-auto max-w-4xl rounded-xl border border-amber-300 bg-amber-50 p-6 md:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">Current availability</p>
          <h2 id="placement-status-heading" className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">
            No verified clinical placements are currently listed
          </h2>
          <p className="mt-4 leading-relaxed text-navy-700">
            This page does not confirm any partner institution, supervisor, placement dates, seats, fees, accreditation or certificate arrangement. Internship applications and placement decisions are not available through this website.
          </p>
          <p className="mt-3 leading-relaxed text-navy-700">
            In a future collaboration, the partner institution would provide and supervise the practical training. Clinova’s role would be limited to the digital infrastructure and coordination agreed in writing with that partner.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/training-partners" className="inline-flex items-center justify-center gap-2 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
              Partnership information <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/cpd-courses" className="inline-flex items-center justify-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
              Review CPD education status <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface-50 px-6 py-16 lg:py-20" aria-labelledby="placement-requirements-heading">
        <div className="mx-auto max-w-editorial lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">Before an opportunity could be published</p>
            <h2 id="placement-requirements-heading" className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">
              What a responsible placement offer would need to make clear
            </h2>
            <p className="mt-4 leading-relaxed text-navy-600">
              The items below describe requirements to confirm for any future offer. They are not evidence that a placement, partner or application service is currently available.
            </p>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {publicationRequirements.map(({ icon: Icon, title, description }) => (
              <article key={title} className="border-t-2 border-teal-600 pt-5">
                <Icon className="h-7 w-7 text-clinical-700" aria-hidden="true" />
                <h3 className="mt-4 font-heading text-lg font-bold text-navy-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 lg:py-20" aria-labelledby="internship-faq-heading">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">Clear information</p>
          <h2 id="internship-faq-heading" className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">Common questions</h2>
          <div className="mt-7 divide-y divide-navy-200 border-y border-navy-200">
            {internshipFaqs.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 font-semibold text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clinical-600 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {question}
                    <span className="text-xl text-clinical-700 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl pr-8 text-sm leading-relaxed text-navy-700">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
