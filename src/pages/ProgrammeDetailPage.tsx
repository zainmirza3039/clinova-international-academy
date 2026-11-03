import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

export default function ProgrammeDetailPage() {
  useSEO({ title: 'Programme details under review', description: 'Programme records are not published as current enrollment offers while Clinova completes content approval.' });
  return <section className="mx-auto max-w-3xl px-6 py-24" aria-labelledby="programme-detail-title">
    <div className="border border-amber-300 bg-amber-50 p-7"><ShieldAlert className="h-7 w-7 text-amber-700" aria-hidden="true" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">Programme information</p><h1 id="programme-detail-title" className="mt-2 font-heading text-2xl font-bold text-navy-900">Programme details are under review</h1><p className="mt-3 text-sm leading-relaxed text-navy-700">This route does not represent an open enrollment offer. No unreviewed syllabus, outcome, fee, assessment rule, CPD value, faculty profile, intake date or credential claim is displayed.</p><p className="mt-3 text-sm leading-relaxed text-navy-700">CPD course completion and professional competency certification are separate credential pathways and require separate approved rules.</p></div>
    <Link to="/programmes" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Programme information</Link>
  </section>;
}
