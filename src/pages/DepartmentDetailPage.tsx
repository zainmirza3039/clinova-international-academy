import { useParams, Link } from 'react-router-dom';
import { BookOpen, Award, Monitor, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';
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
import { newsItems } from '@/data/resourceDrafts';
import { getEducationalArticle } from '@/data/educationalArticles';

const publishedRelatedArticles = newsItems.filter(article => getEducationalArticle(article.slug)?.status === 'published');

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
  const articleSlugs = ['physiotherapy-assessment-structured-approach', 'musculoskeletal-pain-and-function', 'evidence-based-practice-physiotherapy', 'patient-safety-red-flags-referral'];
  const relatedArticles = articleSlugs.map((articleSlug) => publishedRelatedArticles.find((article) => article.slug === articleSlug)).filter(Boolean);
  const relatedCPD = publishedCPDCourses.filter((c) => c.department === department.name).slice(0, 4);

  const deptFAQs: FAQ[] = [
    { id: 'df1', question: `What is this ${department.shortName} page?`, answer: `It is a proposed subject-area organisation for educational reading and study planning. It is not evidence of an established academic department or a live service.` },
    { id: 'df2', question: 'Who might use these materials?', answer: 'Healthcare professionals, learners and organisations may use the drafts to frame questions. Readers should consider their training, role, local guidance and scope of practice.' },
    { id: 'df3', question: 'Are the listed programmes available?', answer: 'No programme or CPD course is currently approved for public listing. This page is a proposed subject-area overview only; no enrolment is offered here.' },
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
        eyebrow="Proposed subject area"
        title={department.name}
        description={department.description}
        image={department.image}
      />

      {/* Overview */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-900 mb-4">Subject-area overview</h2>
          <p className="text-base text-navy-600 leading-relaxed">{department.overview}</p>
          <p className="mt-4 text-sm text-navy-500 leading-relaxed">This page is a subject-area overview only. It is not a course offering or an established academic department.</p>
        </div>
      </section>

      {/* Learning Areas */}
      <section className="py-12 lg:py-16 bg-navy-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-navy-900 mb-3 text-center">Topic areas</h2>
          <p className="text-center text-sm text-navy-600 mb-8">Topic categories only. No related programme or CPD course is currently approved for public listing.</p>
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
            <SectionHeader eyebrow="Proposed outlines" title="Related programme records" description={`Draft catalogue records related to ${department.name}; availability and terms require academy confirmation.`} />
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
          <SectionHeader eyebrow="Learning library" title="Read, reflect and go further" description="Curated article drafts related to assessment, evidence-informed practice and patient safety. Each opens in the educational article library." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedArticles.map((article) => article && <Link key={article.slug} to={`/resources/${article.slug}`} className="group p-4 border border-navy-100 hover:border-clinical-300 transition-colors">
              <h3 className="font-heading font-semibold text-navy-800 text-sm leading-snug group-hover:text-clinical-600">{article.title}</h3>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-clinical-600">Read draft <ExternalLink className="w-3 h-3" /></span>
            </Link>)}
          </div>
          <Link to="/learning-resources" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clinical-600">Open study tools <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>

      <section className="py-8 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-sm text-navy-700 leading-relaxed"><strong>Educational disclaimer.</strong> These drafts are for professional discussion, not patient-specific medical advice, a clinical protocol or evidence of competency. Follow local guidance and scope of practice; seek qualified review before clinical use.</div>
      </section>

      {programmes.length === 0 && relatedCPD.length === 0 && (
        <section className="py-16 bg-navy-50">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-navy-500 mb-4">No related programme records are currently shown for this proposed subject area. Explore the draft library or ask the academy what, if anything, is confirmed.</p>
            <Link to="/programmes" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors">
              View Proposed Outlines <ArrowRight className="w-4 h-4" />
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
        description="Read the draft library, use study tools and contact the owner to verify any programme details. No outcome or recognition is guaranteed."
        primaryCTA={{ label: 'View Proposed Outlines', to: '/programmes' }}
        secondaryCTA={{ label: 'Contact Academy', to: '/contact' }}
      />
    </>
  );
}
