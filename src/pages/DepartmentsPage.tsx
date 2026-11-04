import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import DepartmentCard from '@/components/DepartmentCard';
import { departments } from '@/data/departments';

export default function DepartmentsPage() {
  useSEO({
    title: 'Proposed healthcare subject areas',
    description: 'Browse Clinova proposed subject-area groupings. They are informational categories, not active departments or course offers.',
    noindex: true,
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Subject areas' }]}
        eyebrow="Browse by subject area"
        title="Proposed healthcare subject areas"
        description="Explore Clinova’s proposed subject groupings and learning topics. These categories do not represent active academic departments or training offers."
      />
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-editorial px-6 lg:px-10">
          <div className="mb-8 max-w-3xl border-l-4 border-clinical-600 bg-surface-50 p-5">
            <p className="text-sm leading-relaxed text-navy-700">Subject groupings are for information and navigation only. They do not establish an academic department, clinical approval, qualification, CPD credit, certification scheme or enrollment opportunity.</p>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {departments.map((department, index) => <DepartmentCard key={department.id} department={department} index={index} />)}
          </div>
          <div className="mt-12 flex flex-wrap gap-5 border-t border-navy-100 pt-7">
            <Link to="/cpd-courses" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Browse proposed CPD topics <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/programmes" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Proposed programme catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
