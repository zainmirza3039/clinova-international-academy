import { Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';

export default function OnlineLearningPage() {
  useSEO({
    title: 'Student Learning Access',
    description: 'Student sign-in and learning services are not currently available. Access will be enabled after backend security and academy policies are verified.',
    noindex: true,
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Student Access' }]}
        eyebrow="Student Access"
        title="Student learning access is not yet available"
        description="Clinova is preparing its learner service. This page does not represent an active learning platform, enrolment service or student account."
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="border border-navy-100 bg-surface-50 p-8 md:p-10">
            <div className="flex items-center gap-3">
              <LockKeyhole className="w-6 h-6 text-clinical-600" aria-hidden="true" />
              <h2 className="font-heading text-2xl font-bold text-navy-900">Learner services are unavailable</h2>
            </div>
            <p className="mt-5 leading-relaxed text-navy-700">
              Student registration, sign-in, enrolment, learning records, progress tracking, assessments and certificates
              will remain unavailable until the academy confirms the backend configuration, access controls, email delivery
              and applicable policies.
            </p>
            <div className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-navy-600">
              <ShieldCheck className="w-5 h-5 shrink-0 text-clinical-600" aria-hidden="true" />
              <p>No sample learner records, fictional progress totals or example certificates are shown as real data.</p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/sign-in" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-navy-900 text-white font-semibold">
                Student sign-in status <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/programmes" className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-navy-200 text-navy-800 font-semibold">
                View programme availability <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
