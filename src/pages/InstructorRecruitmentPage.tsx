import { ArrowRight, FileCheck2, LockKeyhole, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

const futureChecks = [
  {
    icon: Stethoscope,
    title: 'Professional scope and experience',
    description: 'A future process would confirm relevant qualifications, registration where applicable, specialty, experience and the limits of the proposed teaching or supervision role.',
  },
  {
    icon: FileCheck2,
    title: 'Independent credential review',
    description: 'Credentials and teaching responsibilities would need an authorised review before anyone could be described as an approved instructor, reviewer or clinical supervisor.',
  },
  {
    icon: LockKeyhole,
    title: 'Secure records and role boundaries',
    description: 'CVs and identity or professional documents should be handled through an approved secure process. Instructor access must not grant institutional administrator privileges.',
  },
];

export default function InstructorRecruitmentPage() {
  useSEO({
    title: 'Become an Instructor',
    description: 'Read about Clinova’s intended healthcare educator roles and current recruitment availability.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Become an Instructor' }]}
        eyebrow="Healthcare faculty"
        title="Teach, author or review with Clinova"
        description="Clinova’s proposed educator roles include course authors, educational reviewers, assessors and eligible clinical supervisors. Each role would require separate scope, qualification and permission checks."
      />

      <section className="bg-white px-6 py-14 lg:py-20" aria-labelledby="recruitment-status-heading">
        <div className="mx-auto max-w-4xl rounded-xl border border-amber-300 bg-amber-50 p-6 md:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">Recruitment status</p>
          <h2 id="recruitment-status-heading" className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">
            Instructor applications are not open through this website
          </h2>
          <p className="mt-4 leading-relaxed text-navy-700">
            This page does not accept applications, CVs, identity documents or professional credentials. It does not create an account, appoint an instructor, assign teaching duties or confirm remuneration. No faculty credential or appointment should be inferred from this information.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/faculty" className="inline-flex items-center justify-center gap-2 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
              View published faculty status <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/training-partners" className="inline-flex items-center justify-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
              Institutional partnership information <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface-50 px-6 py-16 lg:py-20" aria-labelledby="future-review-heading">
        <div className="mx-auto max-w-editorial lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">Planned safeguards</p>
            <h2 id="future-review-heading" className="mt-3 font-heading text-2xl font-bold text-navy-900 md:text-3xl">
              What would be checked before an educator could be appointed
            </h2>
            <p className="mt-4 leading-relaxed text-navy-600">
              These are governance considerations for a future recruitment process, not a currently operating review or approval workflow.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {futureChecks.map(({ icon: Icon, title, description }) => (
              <article key={title} className="border-t-2 border-teal-600 pt-5">
                <Icon className="h-7 w-7 text-clinical-700" aria-hidden="true" />
                <h3 className="mt-4 font-heading text-lg font-bold text-navy-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
