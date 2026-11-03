import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, GraduationCap } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { fetchPublishedCmsContent, type CmsPublishedContent } from '@/lib/cms';
import { useSEO } from '@/hooks/useSEO';

function readText(snapshot: Record<string, unknown>, key: string): string | null {
  const value = snapshot[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export default function CPDCoursesPage() {
  const [records, setRecords] = useState<CmsPublishedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  useSEO({
    title: 'Continuing Professional Development programmes',
    description: 'Explore published, instructor-led continuing professional development programmes from Clinova International Academy.',
  });

  useEffect(() => {
    let active = true;
    void fetchPublishedCmsContent().then(items => {
      if (!active) return;
      setRecords(items.filter(item => item.kind === 'cpd_course'));
      setLoadError(false);
    }).catch(() => {
      if (active) setLoadError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const subjects = useMemo(() => [...new Set(records.map(record => readText(record.snapshot, 'category') ?? readText(record.snapshot, 'department')).filter((value): value is string => Boolean(value)))].sort(), [records]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return records.filter(record => {
      const title = readText(record.snapshot, 'title') ?? '';
      const description = readText(record.snapshot, 'description') ?? readText(record.snapshot, 'excerpt') ?? '';
      const category = readText(record.snapshot, 'category') ?? readText(record.snapshot, 'department') ?? '';
      return (!normalized || `${title} ${description} ${category}`.toLocaleLowerCase().includes(normalized)) && (!subject || category === subject);
    });
  }, [records, query, subject]);

  return <>
    <PageHero
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'CPD programmes' }]}
      eyebrow="Continuing professional development"
      title="Professional learning, led by healthcare educators."
      description="Explore structured CPD programmes for doctors, physiotherapists, nurses and allied healthcare professionals. Each published programme includes its own learning information and application status."
    />
    <section className="bg-white px-6 py-14 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 border-y border-navy-100 py-6 sm:grid-cols-3">
          <div className="flex items-start gap-3"><BookOpen className="mt-1 h-5 w-5 shrink-0 text-clinical-700"/><div><h2 className="text-sm font-semibold text-navy-900">Structured programmes</h2><p className="mt-1 text-sm leading-relaxed text-navy-600">Course content and learning outcomes are shown on each published programme.</p></div></div>
          <div className="flex items-start gap-3"><GraduationCap className="mt-1 h-5 w-5 shrink-0 text-clinical-700"/><div><h2 className="text-sm font-semibold text-navy-900">Instructor-led delivery</h2><p className="mt-1 text-sm leading-relaxed text-navy-600">Teaching is assigned to educators whose profiles have passed academy review.</p></div></div>
          <div className="flex items-start gap-3"><CalendarDays className="mt-1 h-5 w-5 shrink-0 text-clinical-700"/><div><h2 className="text-sm font-semibold text-navy-900">Clear enrolment status</h2><p className="mt-1 text-sm leading-relaxed text-navy-600">Applications are accepted only when a programme is explicitly open.</p></div></div>
        </div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Programme catalogue</p><h2 className="mt-2 font-heading text-2xl font-bold text-navy-900">Published CPD programmes</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-600">Only programmes approved for publication appear in this catalogue. Unpublished drafts and proposed topics are not displayed.</p></div>
          <p className="text-sm text-navy-600" aria-live="polite">{loading ? 'Loading programmes…' : `${visible.length} programme${visible.length === 1 ? '' : 's'}`}</p>
        </div>

        {!loading && records.length > 0 && <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
          <label className="grid gap-2 text-sm font-semibold text-navy-800">Search programmes<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by title, subject or description" className="min-h-11 border border-navy-300 bg-white px-4 font-normal"/></label>
          <label className="grid gap-2 text-sm font-semibold text-navy-800">Subject area<select value={subject} onChange={event => setSubject(event.target.value)} className="min-h-11 border border-navy-300 bg-white px-4 font-normal"><option value="">All subject areas</option>{subjects.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        </div>}

        {loading && <p className="mt-8 border border-navy-100 bg-surface-50 p-8 text-center text-sm text-navy-600" role="status">Loading published CPD programmes…</p>}
        {loadError && <div className="mt-8 border border-amber-200 bg-amber-50 p-6" role="alert"><h3 className="font-semibold text-navy-900">The programme catalogue is temporarily unavailable</h3><p className="mt-2 text-sm text-navy-700">Please try again later or contact the academy for current programme information.</p></div>}
        {!loading && !loadError && records.length === 0 && <div className="mt-8 border border-navy-200 bg-surface-50 p-8 md:p-10"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinical-700">Programme information</p><h3 className="mt-3 font-heading text-2xl font-bold text-navy-900">New programmes will appear here when approved for publication.</h3><p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-600">The academy is preparing its instructor-led programme catalogue. This page displays published programme information only; it does not advertise unconfirmed courses, dates, fees or CPD hours.</p><Link to="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 border border-navy-300 bg-white px-5 py-3 text-sm font-semibold text-navy-800">Ask about upcoming programmes <ArrowRight size={16}/></Link></div>}
        {!loading && !loadError && records.length > 0 && visible.length === 0 && <p className="mt-8 border border-navy-200 bg-surface-50 p-6 text-sm text-navy-700" role="status">No published programmes match those filters.</p>}
        {!loading && !loadError && visible.length > 0 && <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map(record => {
          const snapshot = record.snapshot;
          const title = readText(snapshot, 'title') ?? 'CPD programme';
          const description = readText(snapshot, 'excerpt') ?? readText(snapshot, 'description') ?? readText(snapshot, 'overview');
          const category = readText(snapshot, 'category') ?? readText(snapshot, 'department');
          const duration = typeof snapshot.durationHours === 'number' ? `${snapshot.durationHours} learning hours` : null;
          const delivery = readText(snapshot, 'deliveryMode');
          const open = snapshot.enrollmentOpen === true;
          return <article key={record.content_version_id} className="flex min-h-full flex-col border border-navy-200 bg-white p-6 transition-colors hover:border-clinical-600">
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.13em] text-clinical-700">{category ?? 'CPD programme'}</span><span className={open ? 'portal-status portal-status--valid' : 'portal-status'}>{open ? 'Applications open' : 'Published'}</span></div>
            <h3 className="mt-4 font-heading text-xl font-bold leading-snug text-navy-900">{title}</h3>
            {description && <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">{description}</p>}
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-navy-100 pt-4 text-xs text-navy-600">{duration && <span>{duration}</span>}{delivery && <span>{delivery}</span>}</div>
            <Link to={`/cms/cpd_course/${String(snapshot.slug)}`} className="mt-5 inline-flex min-h-10 items-center gap-2 font-semibold text-clinical-700 underline underline-offset-4">View programme details <ArrowRight size={15}/></Link>
          </article>;
        })}</div>}

        <div className="mt-14 border-t border-navy-100 pt-8"><h2 className="font-heading text-xl font-bold text-navy-900">For educators and healthcare organisations</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-600">Clinova works with healthcare educators and institutions to develop structured learning opportunities and programme delivery.</p><div className="mt-5 flex flex-wrap gap-4"><Link to="/become-an-instructor" className="text-sm font-semibold text-clinical-700 underline underline-offset-4">Instructor information</Link><Link to="/training-partners" className="text-sm font-semibold text-clinical-700 underline underline-offset-4">Institutional partnerships</Link></div></div>
      </div>
    </section>
  </>;
}
