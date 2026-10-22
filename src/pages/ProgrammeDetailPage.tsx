import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import CurriculumDraftContent from '@/components/CurriculumDraftContent';
import ProgrammeCard from '@/components/ProgrammeCard';
import { getProgrammeBySlug, programmes } from '@/data/programmes';
import { getCourseDraft } from '@/data/courseDrafts';

export default function ProgrammeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const programme = slug ? getProgrammeBySlug(slug) : undefined;
  const draft = slug ? getCourseDraft(slug) : undefined;
  useSEO({ title: programme?.title ?? 'Programme Not Found', description: programme?.description ?? 'Programme not found.', ogImage: programme?.image });
  if (!programme) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="font-heading text-2xl font-bold text-navy-900 mb-4">Programme Not Found</h1><Link to="/programmes" className="text-clinical-600">View all programmes</Link></div></div>;
  const related = programmes.filter(item => item.departmentSlug === programme.departmentSlug && item.id !== programme.id).slice(0, 3);
  return <>
    <section className="bg-navy-900 pt-28 lg:pt-36 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Programmes', to: '/programmes' }, { label: programme.title }]} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">Proposed · {programme.category} · {programme.department}</div>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight">{programme.title}</h1>
            <p className="mt-4 text-lg text-navy-200 leading-relaxed max-w-2xl">{programme.description}</p>
          </div>
          <img src={programme.image} alt="" className="hidden lg:block w-full aspect-[4/3] object-cover rounded-xl" />
        </div>
      </div>
    </section>
    <div className="max-w-4xl mx-auto px-4 mt-6">
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Proposed catalogue entry.</strong> Availability, dates, fees, delivery, duration, CPD hours, instructor, assessment and certificate arrangements are not confirmed. No enrolment or checkout is available. A certificate or diploma in a proposed title does not establish an available or recognised award.</p>
    </div>
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">Overview</h2>
              <p className="text-sm text-navy-600 leading-relaxed">{programme.overview}</p>
              <p className="mt-3 text-sm text-navy-600 leading-relaxed">This is a proposed educational curriculum, not an available course, credential or authority to practise. Suggested outcomes are study aims, not verified learner achievements.</p>
            </div>
            {draft ? <CurriculumDraftContent draft={draft} /> : <p className="text-sm text-navy-700">A detailed curriculum is not available for this outline. Do not treat a catalogue entry as reviewed learning material.</p>}
          </div>
          <aside>
            <div className="lg:sticky lg:top-24 rounded-xl border border-navy-100 p-6 bg-white shadow-sm">
              <h2 className="font-heading font-bold text-navy-900 mb-3">Catalogue status</h2>
              <p className="text-sm text-navy-600 leading-relaxed">Reading only — no learner record is created and no competence is assessed. See the unconfirmed arrangements above before making any plans.</p>
              <Link to="/programmes" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clinical-700">Browse catalogue <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
    {related.length > 0 && <section className="py-12 bg-navy-50"><div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8"><h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">Related programme outlines</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{related.map((item, index) => <ProgrammeCard key={item.id} programme={item} index={index} />)}</div></div></section>}
  </>;
}
