import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import DepartmentCard from '@/components/DepartmentCard';
import CTASection from '@/components/CTASection';
import { departments } from '@/data/departments';

export default function DepartmentsPage() {
  useSEO({
    title: 'Healthcare Learning Areas',
    description:
      'Explore healthcare subject areas and related educational resources for independent study.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Departments' }]}
        eyebrow="Departments"
        title="Explore Healthcare Subject Areas"
        description="Browse organised healthcare subject areas and follow topics into related educational reading and self-study guides."
        image="https://images.pexels.com/photos/5452233/pexels-photo-5452233.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-6 gap-y-10">
            {departments.map((dept, i) => (
              <DepartmentCard key={dept.id} department={dept} index={i} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Continue your learning"
        description="Explore educational articles and reading-based study tools for independent learning."
        primaryCTA={{ label: 'Browse educational articles', to: '/resources' }}
        secondaryCTA={{ label: 'Explore study tools', to: '/learning-resources' }}
      />
    </>
  );
}
