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
import { publishedCPDCourses } from '@/data/cpdCourses';
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
  const relatedCPD = publishedCPDCourses.filter((c) => c.department === department.name).slice(0, 4);

  const deptFAQs: FAQ[] = [
    { id: 'df1', question: `What is this ${department.shortName} page?`, answer: `It organises educational reading and study topics for this healthcare discipline. It does not itself represent a clinical service or a live programme.` },
    { id: 'df2', question: 'Who might use these materials?', answer: 'Healthcare professionals, learners and organisations may use these published educational resources to frame questions. Readers should consider their training, role, local guidance and scope of practice.' },
    { id: 'df3', question: 'Are the listed programmes available?', answer: 'Catalogue entries are informational. Confirm availability, dates, fees, delivery, assessment and entry requirements for each offering before enrolling.' },
    { id: 'df4', question: 'Do these pages provide a qualification or clinical authority?', answer: 'No. These pages do not promise a certificate, accreditation, competence, employment, professional recognition or permission to practise.' },
  ];

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Departments', to: '/departments' },
          { label: department.shortName },
        ]}
        eyebrow="Healthcare learning"
        title={department.name}
        description={department.description}
        image={department.image}
      />

      {/* Overview */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-900 mb-4">Subject-area overview</h2>
          <p className="text-base text-navy-600 leading-relaxed">{department.overview}</p>
          <p className="mt-4 text-sm text-navy-500 leading-relaxed">Use this subject area to guide further reading and reflection. Browse the published self-study courses for structured lessons and evidence sources.</p>
        </div>
      </section>

      {/* Learning Areas */}
      <section className="py-12 lg:py-16 bg-navy-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-navy-900 mb-3 text-center">Topic coverage</h2>
          <p className="text-center text-sm text-navy-600 mb-8">Subject categories for educational exploration, not an established department curriculum.</p>
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
            <SectionHeader eyebrow="Programme information" title="Related learning pathways" description={`Explore learning topics related to ${department.name}. Availability and terms are stated in each published offering.`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programmes.map((prog, i) => (
                <ProgrammeCard key={prog.id} programme={prog} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related proposed certificate outlines */}
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

      {/* Related proposed diploma outlines */}
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

      {/* Related proposed professional-development outlines */}
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

      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Learning library" title="Explore further reading" description="Browse the shared educational article library and independent study tools. These resources are not a department-specific curriculum." />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/resources" className="inline-flex items-center gap-2 text-sm font-semibold text-clinical-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">Browse educational articles <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
            <Link to="/learning-resources" className="inline-flex items-center gap-2 text-sm font-semibold text-clinical-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">Explore study tools <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="py-8 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-sm text-navy-700 leading-relaxed"><strong>Educational disclaimer.</strong> These published educational resources are for professional discussion, not patient-specific medical advice, a clinical protocol or evidence of competency. Follow local guidance and scope of practice; seek qualified review before clinical use.</div>
      </section>

      {programmes.length === 0 && relatedCPD.length === 0 && (
        <section className="py-16 bg-navy-50">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-navy-500 mb-4">No related programme records are currently listed for this subject area. Explore the learning library for related educational reading.</p>
            <Link to="/cpd-courses" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors">
              Browse Self-Study Courses <ArrowRight className="w-4 h-4" />
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
        title={`Continue exploring ${department.shortName}`}
        description="Explore the learning library and study tools. Confirm programme requirements and recognition before enrolling."
        primaryCTA={{ label: 'Browse Self-Study Courses', to: '/cpd-courses' }}
        secondaryCTA={{ label: 'Contact Academy', to: '/contact' }}
      />
    </>
  );
}
