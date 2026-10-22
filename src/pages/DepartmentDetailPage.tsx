import { useParams, Link } from 'react-router-dom';
import { BookOpen, Award, Monitor, ArrowRight, CheckCircle } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import SectionHeader from '@/components/SectionHeader';
import Reveal from '@/components/Reveal';
import ProgrammeCard from '@/components/ProgrammeCard';
import CPDCard from '@/components/CPDCard';
import FAQAccordion from '@/components/FAQAccordion';
import CTASection from '@/components/CTASection';
import { getDepartmentBySlug } from '@/data/departments';
import { getProgrammesByDepartment } from '@/data/programmes';
import { cpdCourses } from '@/data/cpdCourses';
import type { FAQ } from '@/data/types';

export default function DepartmentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const department = slug ? getDepartmentBySlug(slug) : undefined;

  useSEO({
    title: department ? `${department.name}` : 'Department Not Found',
    description: department?.description ?? 'Department not found.',
  });

  if (!department) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="text-center px-4">
          <h1 className="font-heading text-2xl font-bold text-navy-900 mb-4">Department Not Found</h1>
          <p className="text-navy-500 mb-6">The department you're looking for may have moved or no longer exists.</p>
          <Link to="/departments" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors">
            View All Departments
          </Link>
        </div>
      </div>
    );
  }

  const programmes = getProgrammesByDepartment(department.slug);
  const certificates = programmes.filter((p) => p.category === 'Certificate');
  const diplomas = programmes.filter((p) => p.category === 'Diploma');
  const relatedCPD = cpdCourses.filter((c) => c.department === department.name).slice(0, 4);

  const deptFAQs: FAQ[] = [
    { id: 'df1', question: `What programmes are available in ${department.name}?`, answer: `We offer a range of certificate courses, diploma programmes and CPD-focused courses in ${department.name}. Browse the programmes listed above or view our full catalogue for more details.` },
    { id: 'df2', question: 'How are the programmes delivered?', answer: 'All programmes are delivered entirely online through our learning platform, allowing you to study flexibly around your professional commitments.' },
    { id: 'df3', question: 'Will I receive a certificate?', answer: 'Yes, upon successful completion of a programme, you will receive a digital Certificate of Completion that can be verified through our online system.' },
    { id: 'df4', question: 'Are these programmes accredited?', answer: 'Our programmes are CPD-focused educational courses. We do not currently claim formal accreditation. Certificate arrangements await academy confirmation.' },
  ];

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Departments', to: '/departments' },
          { label: department.shortName },
        ]}
        eyebrow="Department"
        title={department.name}
        description={department.description}
        image={department.image}
      />

      {/* Overview */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-900 mb-4">Department Overview</h2>
          <p className="text-base text-navy-600 leading-relaxed">{department.overview}</p>
        </div>
      </section>

      {/* Learning Areas */}
      <section className="py-12 lg:py-16 bg-navy-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8 text-center">Learning Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {department.learningAreas.map((area, i) => (
              <Reveal key={area} delay={(i % 4) * 60} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-navy-100">
                <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-sm font-medium text-navy-700">{area}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Programmes */}
      {programmes.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Programmes" title="Featured Programmes" description={`Programmes available in ${department.name}.`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programmes.map((prog, i) => (
                <ProgrammeCard key={prog.id} programme={prog} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certificate Courses */}
      {certificates.length > 0 && (
        <section className="py-12 lg:py-16 bg-navy-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" /> Certificate Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((prog, i) => (
                <ProgrammeCard key={prog.id} programme={prog} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Diploma Programmes */}
      {diplomas.length > 0 && (
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600" /> Diploma Programmes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {diplomas.map((prog, i) => (
                <ProgrammeCard key={prog.id} programme={prog} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CPD Courses */}
      {relatedCPD.length > 0 && (
        <section className="py-12 lg:py-16 bg-navy-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-teal-600" /> CPD Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCPD.map((course, i) => (
                <CPDCard key={course.id} course={course} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {programmes.length === 0 && relatedCPD.length === 0 && (
        <section className="py-16 bg-navy-50">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-navy-500 mb-4">Programmes for this department are being developed. Check back soon or explore our full catalogue.</p>
            <Link to="/programmes" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors">
              View All Programmes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="FAQs" title="Frequently Asked Questions" />
          <FAQAccordion items={deptFAQs} />
        </div>
      </section>

      <CTASection
        title={`Ready to Study ${department.shortName}?`}
        description="Explore our full catalogue or contact us to learn more about our programmes."
        primaryCTA={{ label: 'View All Programmes', to: '/programmes' }}
        secondaryCTA={{ label: 'Contact Academy', to: '/contact' }}
      />
    </>
  );
}
