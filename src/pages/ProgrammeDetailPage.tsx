import { useParams, Link } from 'react-router-dom';
import {
  Clock, Award, Monitor, BarChart, CheckCircle,
  Users, ClipboardCheck, GraduationCap,
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQAccordion from '@/components/FAQAccordion';
import ProgrammeCard from '@/components/ProgrammeCard';
import { getProgrammeBySlug } from '@/data/programmes';
import { programmes } from '@/data/programmes';
import type { FAQ } from '@/data/types';

export default function ProgrammeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const programme = slug ? getProgrammeBySlug(slug) : undefined;

  useSEO({
    title: programme ? programme.title : 'Programme Not Found',
    description: programme?.description ?? 'Programme not found.',
    ogImage: programme?.image,
    structuredData: programme ? {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: programme.title,
      description: programme.description,
      provider: {
        '@type': 'Organization',
        name: 'Clinova International Academy',
        url: 'https://clinovainternationalacademy.co.uk',
      },
    } : undefined,
  });

  if (!programme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="text-center px-4">
          <h1 className="font-heading text-2xl font-bold text-navy-900 mb-4">Programme Not Found</h1>
          <p className="text-navy-500 mb-6">The programme you're looking for may have moved or no longer exists.</p>
          <Link to="/programmes" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors">
            View All Programmes
          </Link>
        </div>
      </div>
    );
  }

  const related = programmes
    .filter((p) => p.departmentSlug === programme.departmentSlug && p.id !== programme.id)
    .slice(0, 3);

  const courseFAQs: FAQ[] = [
    { id: 'cf1', question: 'How is this programme delivered?', answer: `The ${programme.title} is delivered entirely online through our learning platform. You can access video lessons, reading materials and assessments at any time that suits your schedule.` },
    { id: 'cf2', question: 'How long does it take to complete?', answer: `The programme duration is ${programme.duration}. As the programme is self-paced, you can study at a speed that works around your professional commitments.` },
    { id: 'cf3', question: 'Will I receive a certificate?', answer: `Yes, upon successful completion you will receive a ${programme.certificate}, which can be verified through our online certificate verification system.` },
    { id: 'cf4', question: 'What are the assessment methods?', answer: programme.assessment },
    { id: 'cf5', question: 'Is this programme accredited?', answer: 'Our programmes are CPD-focused educational courses. We do not currently claim formal accreditation from any regulatory body. This programme offers a Certificate of Completion.' },
  ];

  const sidebarItems = [
    { icon: Clock, label: 'Duration', value: programme.duration },
    { icon: Award, label: 'CPD Hours', value: `${programme.cpdHours} hours` },
    { icon: Monitor, label: 'Format', value: programme.delivery },
    { icon: BarChart, label: 'Level', value: programme.level },
    { icon: ClipboardCheck, label: 'Assessment', value: 'Online assessment' },
    { icon: GraduationCap, label: 'Certificate', value: programme.certificate },
  ];

  return (
    <>
      {/* Hero / Header */}
      <section className="bg-navy-900 pt-20 pb-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Home', to: '/' },
                { label: 'Programmes', to: '/programmes' },
                { label: programme.title },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">
                {programme.category} • {programme.department}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance">
                {programme.title}
              </h1>
              <p className="mt-4 text-base md:text-lg text-navy-200 leading-relaxed max-w-2xl">
                {programme.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-navy-200">
                  <Clock className="w-4 h-4 text-teal-400" /> {programme.duration}
                </span>
                <span className="flex items-center gap-2 text-navy-200">
                  <Award className="w-4 h-4 text-teal-400" /> {programme.cpdHours} CPD Hours
                </span>
                <span className="flex items-center gap-2 text-navy-200">
                  <Monitor className="w-4 h-4 text-teal-400" /> Online
                </span>
                <span className="flex items-center gap-2 text-navy-200">
                  <GraduationCap className="w-4 h-4 text-teal-400" /> {programme.certificate}
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <img src={programme.image} alt={programme.title} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Sidebar */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Course Overview */}
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">Course Overview</h2>
                <p className="text-sm text-navy-600 leading-relaxed">{programme.overview}</p>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">Learning Outcomes</h2>
                <div className="space-y-2.5">
                  {programme.learningOutcomes.map((outcome, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-navy-700 leading-relaxed">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Content */}
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">Course Content</h2>
                <div className="space-y-3">
                  {programme.modules.map((module) => (
                    <div key={module.number} className="bg-navy-50 rounded-xl border border-navy-100 p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center font-heading font-bold text-sm shrink-0">
                          {String(module.number).padStart(2, '0')}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-bold text-navy-900 text-base">{module.title}</h3>
                          <p className="text-sm text-navy-500 mt-1 leading-relaxed">{module.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {module.topics.map((topic) => (
                              <span key={topic} className="inline-block px-2.5 py-1 text-xs bg-white border border-navy-200 rounded-md text-navy-600">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Who Is This Course For */}
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">Who Is This Course For?</h2>
                <div className="space-y-2.5">
                  {programme.whoFor.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-navy-700 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment */}
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">Assessment</h2>
                <p className="text-sm text-navy-600 leading-relaxed">{programme.assessment}</p>
              </div>

              {/* Certification */}
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">Certification</h2>
                <div className="bg-teal-50 rounded-xl border border-teal-100 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-navy-900">{programme.certificate}</h3>
                      <p className="text-sm text-navy-600 mt-1 leading-relaxed">
                        Upon successful completion of this programme, you will receive a digital {programme.certificate}.
                        Certificates can be verified through our online verification system. This programme provides
                        {programme.cpdHours} CPD hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQs */}
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">Frequently Asked Questions</h2>
                <FAQAccordion items={courseFAQs} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Course Info */}
                <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
                  <h3 className="font-heading font-bold text-navy-900 mb-4">Course Information</h3>
                  <div className="space-y-3">
                    {sidebarItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-navy-50 last:border-0">
                        <span className="flex items-center gap-2 text-sm text-navy-500">
                          <item.icon className="w-4 h-4 text-teal-600" />
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold text-navy-800 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enrol CTA */}
                <div className="bg-navy-900 rounded-xl p-6 text-center">
                  <h3 className="font-heading font-bold text-white mb-2">Ready to Enrol?</h3>
                  <p className="text-sm text-navy-300 mb-4">Start your professional development journey today.</p>
                  <Link
                    to="/contact"
                    className="block w-full px-6 py-3 bg-clinical-600 text-white font-semibold rounded-lg hover:bg-clinical-700 transition-colors"
                  >
                    Enrol Now
                  </Link>
                  <Link
                    to="/programmes"
                    className="block mt-3 text-sm text-navy-300 hover:text-white transition-colors"
                  >
                    Browse other programmes
                  </Link>
                </div>


              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Programmes */}
      {related.length > 0 && (
        <section className="py-12 lg:py-16 bg-navy-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">Related Programmes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((prog, i) => (
                <ProgrammeCard key={prog.id} programme={prog} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-navy-100 p-4 shadow-lg">
        <Link
          to="/contact"
          className="block w-full px-6 py-3.5 bg-clinical-600 text-white font-semibold rounded-lg text-center hover:bg-clinical-700 transition-colors"
        >
          Enrol Now
        </Link>
      </div>
    </>
  );
}
