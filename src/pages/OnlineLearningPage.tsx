import { ArrowRight, BookOpen, Compass, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';

const learningOptions = [
  {
    icon: BookOpen,
    title: 'Read educational articles',
    description: 'Explore structured reading on assessment, rehabilitation, evidence-informed practice and patient safety.',
    to: '/resources',
    action: 'Browse the library',
  },
  {
    icon: Compass,
    title: 'Explore subject areas',
    description: 'Navigate healthcare topics and identify related areas for further independent study.',
    to: '/departments',
    action: 'View subject areas',
  },
  {
    icon: FileText,
    title: 'Use study guides',
    description: 'Work through topic outlines and reflection prompts at your own pace, using fictional examples only.',
    to: '/learning-resources',
    action: 'Open study tools',
  },
];

export default function OnlineLearningPage() {
  useSEO({
    title: 'Online Learning Resources',
    description: 'Explore Clinova International Academy’s online educational articles, healthcare subject guides and independent study tools.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Online Learning' }]}
        eyebrow="Online Learning"
        title="A clear place to continue your healthcare learning"
        description="Explore educational articles, healthcare subject areas and structured study resources designed for independent professional learning."
        image="https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-600 mb-4">Learn independently</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800">Choose a resource that fits your next question</h2>
            <p className="mt-5 text-base text-navy-600 leading-relaxed">
              The online library is organised around reading, subject exploration and reflective study. Use it alongside current evidence, local guidance and the standards that apply to your role.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {learningOptions.map(({ icon: Icon, title, description, to, action }) => (
              <article key={title} className="border-t-2 border-teal-500 pt-6 flex flex-col">
                <Icon className="w-7 h-7 text-clinical-600 mb-5" aria-hidden="true" />
                <h3 className="font-heading text-lg font-bold text-navy-800">{title}</h3>
                <p className="mt-3 text-sm text-navy-600 leading-relaxed flex-1">{description}</p>
                <Link to={to} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700 hover:text-clinical-600">
                  {action}<ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="py-14 bg-navy-800">
        <div className="max-w-editorial mx-auto px-6 lg:px-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-bold text-white">Use learning resources responsibly</h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-100/75">
              Materials are for general education, not individual clinical advice, supervised training, formal assessment or proof of competence. Follow current evidence and local professional requirements.
            </p>
          </div>
          <Link to="/faqs" className="inline-flex shrink-0 items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
            Read FAQs<ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
