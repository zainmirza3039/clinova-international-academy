import { ArrowRight, Award, BadgeCheck, BookOpenCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

const recognitionTypes = [
  {
    icon: BookOpenCheck,
    title: 'Certificate of completion',
    description: 'A completion certificate records that a learner met the published requirements for a specific activity. Reading a public guide alone does not create an award or prove competence.',
  },
  {
    icon: Award,
    title: 'CPD hours under an approved scheme',
    description: 'CPD hours may be stated only for a named activity when the applicable scheme, approval, credit amount, learning requirements and completion rules have been verified.',
  },
  {
    icon: BadgeCheck,
    title: 'Formal accreditation',
    description: 'Accreditation is a separate status. It must be supported by explicit, current authorization for the specific provider and activity; a course title or certificate is not evidence of accreditation.',
  },
];

export default function CertificationAndCpdPolicyPage() {
  useSEO({
    title: 'Certification and CPD Policy',
    description: 'Understand the distinction between completion certificates, approved CPD hours and formal accreditation, and check current Clinova service availability.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Certification and CPD policy' }]}
        eyebrow="Recognition and learning records"
        title="Certification and CPD policy"
        description="Clear rules for describing course completion, CPD hours and accreditation—without implying that a recognition service is available when it has not been verified."
      />

      <section className="bg-white px-6 py-14 lg:py-20" aria-labelledby="current-recognition-status-heading">
        <div className="mx-auto max-w-4xl">
          <div className="border border-amber-300 bg-amber-50 p-6 md:p-9" role="status">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">Current public status</p>
            <h2 id="current-recognition-status-heading" className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">
              Certificates, CPD awards and live verification are not available through the current self-study pages
            </h2>
            <p className="mt-4 leading-relaxed text-navy-700">
              The public catalogue provides independent learning resources. It does not provide learner accounts, enrolment, graded assessments, certificate issuance or live certificate verification. A published guide does not by itself award CPD hours, a certificate, a qualification or an accredited status.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-navy-900 md:text-3xl">Three different kinds of recognition</h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-navy-600">
              These terms are not interchangeable. Any future award must identify its basis and the organization responsible for confirming it.
            </p>
            <div className="mt-7 grid gap-6 md:grid-cols-3">
              {recognitionTypes.map(({ icon: Icon, title, description }) => (
                <article key={title} className="border-t-2 border-teal-600 bg-surface-50 p-5 md:p-6">
                  <Icon className="h-7 w-7 text-clinical-700" aria-hidden="true" />
                  <h3 className="mt-4 font-heading text-lg font-bold text-navy-900">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-700">{description}</p>
                </article>
              ))}
            </div>
          </div>

          <section className="mt-12 border-t border-navy-200 pt-8" aria-labelledby="clinical-training-recognition-heading">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-clinical-700" aria-hidden="true" />
              <div>
                <h2 id="clinical-training-recognition-heading" className="font-heading text-xl font-bold text-navy-900 md:text-2xl">Clinical internship recognition is separate</h2>
                <p className="mt-3 leading-relaxed text-navy-600">
                  Practical training would be delivered and supervised by the partner institution under an agreed written scope. Any future completion record would depend on verified placement dates, attendance, assessment and authorized sign-off, and would identify each organization’s role. No verified placement or partner-backed certificate is currently available.
                </p>
                <Link to="/clinical-internships" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clinical-600">
                  Check clinical internship availability <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-4 border border-navy-200 bg-surface-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-navy-700">For current certificate information, see the award-status page. It explains why no public certificate record or eligibility decision can be confirmed.</p>
            <Link to="/certification" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-navy-300 bg-white px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
              Certificate availability <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
