import {
  Monitor, Clock, BookOpen, ClipboardCheck,
  Compass, Award, ShieldCheck, Play,
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import SectionHeader from '@/components/SectionHeader';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';

const features = [
  { icon: Monitor, title: 'How It Works', desc: 'Enrol in a programme, access materials through our platform and study at your own pace.' },
  { icon: Compass, title: 'Learning Dashboard', desc: 'Track your progress, view upcoming assessments and manage your learning journey.' },
  { icon: Play, title: 'Video Lessons', desc: 'Engaging video content delivered by experienced educators.' },
  { icon: BookOpen, title: 'Learning Resources', desc: 'Curated reading materials, reference guides and downloadable resources.' },
  { icon: ClipboardCheck, title: 'Assessments', desc: 'Test your knowledge through quizzes, assignments and case studies.' },
  { icon: Clock, title: 'Progress Tracking', desc: 'Monitor completion rates and see how far you have come.' },
  { icon: Award, title: 'Certificate arrangements', desc: 'Certificate availability and verification are awaiting academy confirmation.' },
  { icon: ShieldCheck, title: 'Quality Learning', desc: 'Structured, evidence-informed content designed for healthcare professionals.' },
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
            title="Everything You Need to Succeed"
            description="A comprehensive online learning environment built for healthcare professionals."
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
            title="Your Personal Learning Dashboard"
            description="A central hub for your learning journey — track progress, access materials and manage your programmes."
          />
          <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-navy-50 shadow-lg overflow-hidden">
            {/* Dashboard header */}
            <div className="bg-navy-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8  bg-teal-500 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-heading font-semibold text-sm">Clinova Learning Dashboard</span>
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
                  <div className="text-xs text-navy-400 mb-1">Enrolled Programmes</div>
                  <div className="text-2xl font-heading font-bold text-navy-800">3</div>
                </div>
                <div className="bg-surface-50  p-4 border border-navy-50">
                  <div className="text-xs text-navy-400 mb-1">CPD Hours Earned</div>
                  <div className="text-2xl font-heading font-bold text-navy-800">45</div>
                </div>
                <div className="bg-surface-50  p-4 border border-navy-50">
                  <div className="text-xs text-navy-400 mb-1">Certificates Earned</div>
                  <div className="text-2xl font-heading font-bold text-navy-800">2</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Certificate in Musculoskeletal Assessment', progress: 75, status: 'In Progress' },
                  { title: 'Certificate in Clinical Pain Management', progress: 100, status: 'Completed' },
                  { title: 'Clinical Communication Skills', progress: 30, status: 'In Progress' },
                ].map((course) => (
                  <div key={course.title} className="flex items-center gap-4 p-4 bg-surface-50  border border-navy-50">
                    <div className="w-10 h-10  bg-white border border-navy-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-teal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-navy-800 truncate">{course.title}</div>
                      <div className="mt-2 h-2 bg-navy-100  overflow-hidden">
                        <div
                          className={`h-full  ${course.progress === 100 ? 'bg-teal-500' : 'bg-clinical-500'}`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-semibold text-navy-700">{course.progress}%</div>
                      <div className={`text-[10px] ${course.progress === 100 ? 'text-teal-500' : 'text-navy-400'}`}>
                        {course.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-navy-400 mt-4">Sample dashboard — for illustration purposes only.</p>
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
