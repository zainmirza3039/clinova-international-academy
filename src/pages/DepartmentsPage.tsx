import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import DepartmentCard from '@/components/DepartmentCard';
import CTASection from '@/components/CTASection';
import { departments } from '@/data/departments';

export default function DepartmentsPage() {
  useSEO({
    title: 'Proposed Subject Areas',
    description:
      'Explore proposed healthcare subject areas for reading and study planning. These labels are an educational organisation of topics, not evidence of established departments or services.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Departments' }]}
        eyebrow="Departments"
        title="Explore Our Proposed Subject Areas"
        description="A draft organisation of healthcare topics for reading and study planning. Course availability, delivery, assessment and recognition require academy confirmation."
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
        title="Plan your next learning question"
        description="Read the draft library, use study tools and review proposed outlines. No employment, outcome, certificate or recognition is guaranteed."
        primaryCTA={{ label: 'View Proposed Outlines', to: '/programmes' }}
        secondaryCTA={{ label: 'Browse Draft Reading', to: '/cpd-courses' }}
      />
    </>
  );
}
