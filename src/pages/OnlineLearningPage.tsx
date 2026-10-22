import {
  Monitor, Clock, BookOpen, ClipboardCheck,
  Compass, Award, ShieldCheck,
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import SectionHeader from '@/components/SectionHeader';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';

const features = [
  { icon: Monitor, title: 'How It Could Work', desc: 'Proposed concept only: programme access and self-paced study arrangements await academy confirmation.' },
  { icon: Compass, title: 'Proposed Learning Dashboard', desc: 'Illustrative concept for progress and assessment views; no learner dashboard is live here.' },
  { icon: Monitor, title: 'Proposed Video Lessons', desc: 'Illustrative content concept only; video delivery and educator materials are not live or confirmed.' },
  { icon: BookOpen, title: 'Proposed Learning Resources', desc: 'A suggested area for reading materials and reference guides, awaiting confirmation.' },
  { icon: ClipboardCheck, title: 'Proposed Assessments', desc: 'Illustrative quiz, assignment and case-study options only; no assessment service is live.' },
  { icon: Clock, title: 'Proposed Progress Tracking', desc: 'Illustrative completion views only; learner progress tracking is not currently available.' },
  { icon: Award, title: 'Proposed Certificate Arrangements', desc: 'Certificate availability and verification are awaiting academy confirmation; this is not a promise.' },
  { icon: ShieldCheck, title: 'Proposed Quality Framework', desc: 'A suggested evidence-informed structure for healthcare learning, pending academy confirmation.' },
];

export default function OnlineLearningPage() {
  useSEO({
    title: 'Online Learning',
    description:
      'Explore the proposed online learning experience. Platform features, access, assessments and certificates are awaiting academy confirmation.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Online Learning' }]}
        eyebrow="Online Learning"
        title="Learn Around Your Professional Life"
        description="This page describes a proposed learning experience only. Platform availability, delivery format and suitability for working professionals require academy confirmation."
        image="https://images.pexels.com/photos/5934556/pexels-photo-5934556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      {/* Features Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <SectionHeader
            eyebrow="The Learning Experience"
            title="Proposed learning features"
            description="These are proposed features, not a claim that a learning platform, videos or assessments are currently available."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((item, i) => (
              <Reveal key={item.title} delay={(i % 4) * 60} className="p-6  bg-surface-50 border border-navy-50">
                <div className="w-11 h-11  bg-white border border-navy-50 flex items-center justify-center mb-4 shadow-sm">
                  <item.icon className="w-5 h-5 text-teal-500" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-semibold text-navy-800 text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-navy-500 leading-relaxed">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mock Dashboard */}
      <section className="py-16 lg:py-24 bg-surface-50">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          <SectionHeader
            eyebrow="Learning Dashboard"
            title="An Illustrative Dashboard Concept"
            description="Illustrative layout only, not connected to learner records. Enrolment, CPD totals, certificates and progress tracking are unavailable."
          />
          <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-navy-50 shadow-lg overflow-hidden">
            {/* Dashboard header */}
            <div className="bg-navy-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8  bg-teal-500 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-heading font-semibold text-sm">Proposed Clinova Dashboard</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5  bg-red-400/80" />
                <div className="w-2.5 h-2.5  bg-amber-400/80" />
                <div className="w-2.5 h-2.5  bg-green-400/80" />
              </div>
            </div>
            {/* Dashboard body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-surface-50  p-4 border border-navy-50">
                  <div className="text-xs text-navy-400 mb-1">Example programme count</div>
                  <div className="text-2xl font-heading font-bold text-navy-800">—</div>
                </div>
                <div className="bg-surface-50  p-4 border border-navy-50">
                  <div className="text-xs text-navy-400 mb-1">Example CPD total</div>
                  <div className="text-2xl font-heading font-bold text-navy-800">—</div>
                </div>
                <div className="bg-surface-50  p-4 border border-navy-50">
                  <div className="text-xs text-navy-400 mb-1">Example certificate total</div>
                  <div className="text-2xl font-heading font-bold text-navy-800">—</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Proposed programme example: Musculoskeletal Assessment' },
                  { title: 'Proposed programme example: Clinical Pain Management' },
                  { title: 'Proposed programme example: Clinical Communication' },
                ].map((course) => (
                  <div key={course.title} className="flex items-center gap-4 p-4 bg-surface-50  border border-navy-50">
                    <div className="w-10 h-10  bg-white border border-navy-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-teal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-navy-800 truncate">{course.title}</div>
                      <p className="mt-2 text-xs text-navy-500">Progress unavailable</p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-navy-500">Illustrative only</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-navy-400 mt-4">Illustrative mock-up only — not a live dashboard, enrolment area, assessment tool, progress record or certificate record.</p>
        </div>
      </section>

      <CTASection
        title="Start Your Online Learning Journey"
        description="Programme availability and platform access are awaiting academy confirmation; no checkout or enrolment is available here."
        primaryCTA={{ label: 'Explore Programmes', to: '/programmes' }}
        secondaryCTA={{ label: 'Browse CPD Courses', to: '/cpd-courses' }}
        variant="teal"
      />
    </>
  );
}
