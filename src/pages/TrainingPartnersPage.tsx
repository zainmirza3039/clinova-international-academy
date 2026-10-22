import { ArrowRight, BookOpen, Handshake, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';

const discussionAreas = [
  {
    icon: BookOpen,
    title: 'Educational content',
    description: 'Identify subject areas, audiences and learning questions that could benefit from clear educational resources.',
  },
  {
    icon: Users,
    title: 'Learner needs',
    description: 'Describe accessibility, language, professional context and the learning support your organisation expects.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality and scope',
    description: 'Clarify content ownership, review responsibilities, professional limits and how any learning outcomes would be described.',
  },
];

export default function TrainingPartnersPage() {
  useSEO({
    title: 'Training Partnerships',
    description: 'Information for organisations interested in discussing educational collaboration with Clinova International Academy.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Training Partnerships' }]}
        eyebrow="Training Partnerships"
        title="Start a considered conversation about learning"
        description="Clinova welcomes written expressions of interest from organisations exploring healthcare education and professional learning resources."
        image="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600 mb-4">Areas for discussion</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy-800">Build the conversation around clear expectations</h2>
            <p className="mt-5 text-base text-navy-600 leading-relaxed">
              An expression of interest is not a partnership agreement. Before any collaboration begins, both parties should agree in writing on scope, responsibilities, content review, delivery, data handling, fees and any claims about accreditation or certificates.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {discussionAreas.map(({ icon: Icon, title, description }) => (
              <article key={title} className="border-t-2 border-teal-500 pt-6">
                <Icon className="w-7 h-7 text-clinical-600 mb-5" aria-hidden="true" />
                <h3 className="font-heading text-lg font-bold text-navy-800">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="py-14 bg-navy-800">
        <div className="max-w-editorial mx-auto px-6 lg:px-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <Handshake className="w-6 h-6 text-teal-300" aria-hidden="true" />
              <h2 className="font-heading text-2xl font-bold text-white">Discuss an idea in writing</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-navy-100/75">
              Online partnership submissions are not available. Use the postal address on the Contact page to send a written expression of interest. No partnership, delivery capacity or commercial terms are implied by this page.
            </p>
          </div>
          <Link to="/contact" className="inline-flex shrink-0 items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-navy-800 hover:bg-navy-50">
            Contact information<ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
