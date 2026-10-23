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
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Subject areas' }]}
        eyebrow="Subject areas"
        title="Explore Healthcare Subject Areas"
        description="These categories are for navigation and topic exploration only. They do not represent established departments, active courses or accredited programmes."
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
        description="Subject categories are provided for orientation only. No programme or CPD course is currently approved for enrolment, and student services are not live."
        primaryCTA={{ label: 'Check Programme Availability', to: '/programmes' }}
        secondaryCTA={{ label: 'Check CPD Availability', to: '/cpd-courses' }}
      />
    </>
  );
}
