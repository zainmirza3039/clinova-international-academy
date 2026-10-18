import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import DepartmentCard from '@/components/DepartmentCard';
import CTASection from '@/components/CTASection';
import { departments } from '@/data/departments';

export default function DepartmentsPage() {
  useSEO({
    title: 'Academic Departments',
    description:
      'Explore Clinova International Academy academic departments — physiotherapy, nursing, medicine, dentistry, pharmacy, psychology, nutrition, sports, occupational therapy and healthcare management.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Departments' }]}
        eyebrow="Departments"
        title="Explore Our Academic Departments"
        description="Structured online healthcare education across ten disciplines, each offering certificate courses, diplomas and CPD-focused professional development."
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
        title="Find the Right Programme for You"
        description="Browse our full catalogue of certificate, diploma and CPD courses across all departments."
        primaryCTA={{ label: 'View All Programmes', to: '/programmes' }}
        secondaryCTA={{ label: 'Browse CPD Courses', to: '/cpd-courses' }}
      />
    </>
  );
}
