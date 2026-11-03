import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, ShieldAlert } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import CPDCard from '@/components/CPDCard';
import { getDepartmentBySlug } from '@/data/departments';
import { getOwnerListedCPDTopicsBySubjectArea } from '@/data/catalogueBrowse';

export default function DepartmentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const department = slug ? getDepartmentBySlug(slug) : undefined;
  const relatedTopics = department ? getOwnerListedCPDTopicsBySubjectArea(department.name) : [];

  useSEO({
    title: department ? `${department.name} | Proposed subject area` : 'Subject area not found',
    description: department ? `${department.name} proposed subject-area information and topic titles; no course is open for enrollment.` : 'Subject area not found.',
    noindex: true,
  });

  if (!department) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 py-24 text-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Subject area not found</h1>
          <p className="mt-3 text-navy-600">This address does not match a current subject-area page.</p>
          <Link to="/departments" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline"><ArrowRight className="h-4 w-4" aria-hidden="true" />View subject areas</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Subject areas', to: '/departments' }, { label: department.shortName }]}
        eyebrow="Proposed subject area"
        title={department.name}
        description="This is an informational subject grouping. It does not represent an established academic department, approved curriculum or current training offer."
        image={department.image}
      />
      <section className="bg-white px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="border border-amber-300 bg-amber-50 p-6" role="status">
            <ShieldAlert className="h-6 w-6 text-amber-700" aria-hidden="true" />
            <h2 className="mt-3 font-heading text-xl font-bold text-navy-900">Information only · no enrollment is open</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-700">The topic names on this page are proposed learning areas. Related CPD titles use provisional subject groupings and are not course offers. No syllabus, hours, faculty, schedule, fee, assessment or credential terms are published here.</p>
          </div>

          <section className="mt-10" aria-labelledby="learning-areas-title">
            <div className="flex items-start gap-3">
              <BookOpenCheck className="mt-1 h-6 w-6 shrink-0 text-clinical-700" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clinical-700">Subject-area topics</p>
                <h2 id="learning-areas-title" className="mt-1 font-heading text-2xl font-bold text-navy-900">Proposed learning areas</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-600">These topic labels are provided for discovery only. They are not course curricula, competency standards or professional instructions.</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {department.learningAreas.map((area) => (
                <li key={area} className="border border-navy-200 bg-surface-50 p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-clinical-700">Proposed topic</span>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-navy-900">{area}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 border-t border-navy-100 pt-10" aria-labelledby="related-topic-proposals-title">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clinical-700">CPD topic directory</p>
            <h2 id="related-topic-proposals-title" className="mt-1 font-heading text-2xl font-bold text-navy-900">Related proposed CPD topics</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-600">The subject-area labels below are provisional source groupings for browsing; they do not mean a topic is approved or currently available.</p>
            {relatedTopics.length > 0 ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedTopics.map((topic) => <CPDCard key={topic.id} course={topic} />)}
              </div>
            ) : (
              <p className="mt-5 border border-navy-200 bg-surface-50 p-5 text-sm text-navy-700" role="status">No owner-listed CPD topic is currently grouped under this subject area.</p>
            )}
          </section>

          <div className="mt-10 flex flex-wrap gap-5 border-t border-navy-100 pt-7">
            <Link to="/cpd-courses" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Browse all proposed CPD topics <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/departments" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">All subject areas</Link>
            <Link to="/programmes" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Programme catalogue status</Link>
          </div>
        </div>
      </section>
    </>
  );
}
