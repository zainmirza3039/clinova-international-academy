import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPublishedCmsContent, type CmsContentKind, type CmsPublishedContent } from '@/lib/cms';

const kindLabels: Record<CmsContentKind, string> = {
  programme: 'Learning guide',
  cpd_course: 'Self-study course',
  article: 'Educational article',
};

function usePublishedCmsContent() {
  const [records, setRecords] = useState<CmsPublishedContent[]>([]);
  const [loading, setLoading] = useState(() => import.meta.env.VITE_CMS_ENABLED === 'true');

  useEffect(() => {
    let active = true;
    void fetchPublishedCmsContent().then((next) => {
      if (active) setRecords(next);
    }).catch(() => {
      // Public CMS failure is intentionally non-fatal: repository content remains available.
      if (active) setRecords([]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return { records, loading };
}

function readText(snapshot: Record<string, unknown>, key: string): string | null {
  const value = snapshot[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function readStringArray(snapshot: Record<string, unknown>, key: string): string[] {
  const value = snapshot[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function readSections(snapshot: Record<string, unknown>) {
  const value = snapshot.sections;
  if (!Array.isArray(value)) return [];
  return value.filter((section): section is { heading: string; paragraphs: string[] } => {
    if (typeof section !== 'object' || section === null || Array.isArray(section)) return false;
    const candidate = section as Record<string, unknown>;
    return typeof candidate.heading === 'string'
      && Array.isArray(candidate.paragraphs)
      && candidate.paragraphs.every(paragraph => typeof paragraph === 'string');
  });
}

export function CmsPublishedContentShelf() {
  const { records, loading } = usePublishedCmsContent();
  if (loading) return <p className="sr-only" role="status">Checking newly published content…</p>;
  if (records.length === 0) return null;

  return <section aria-labelledby="cms-published-content-title" className="mt-12 border-t border-navy-100 pt-10">
    <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Approved CMS releases</p><h2 id="cms-published-content-title" className="mt-2 text-2xl font-heading font-bold text-navy-900">More published learning content</h2><p className="mt-2 text-sm text-navy-600">These additional records are served from the public, published-content view. Existing repository content remains available as well.</p></div>
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {records.map(record => {
        const title = readText(record.snapshot, 'title') ?? 'Untitled content';
        const summary = readText(record.snapshot, 'excerpt') ?? readText(record.snapshot, 'description') ?? readText(record.snapshot, 'overview');
        const slug = record.snapshot.slug as string;
        return <li key={record.content_version_id} className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{kindLabels[record.kind]}</p>
          <h3 className="mt-2 text-lg font-semibold text-navy-900">{title}</h3>
          {summary && <p className="mt-2 text-sm leading-relaxed text-navy-600">{summary}</p>}
          <Link className="mt-4 inline-flex font-semibold text-teal-800 underline underline-offset-4" to={`/cms/${record.kind}/${slug}`}>Open published content<span className="sr-only">: {title}</span></Link>
        </li>;
      })}
    </ul>
  </section>;
}

export function CmsPublishedContentDetailPage() {
  const { kind, slug } = useParams<{ kind: string; slug: string }>();
  const { records, loading } = usePublishedCmsContent();
  const record = records.find(item => item.kind === kind && item.snapshot.slug === slug);

  if (loading) return <section className="mx-auto max-w-3xl px-6 py-20 text-center" role="status"><h1 className="text-2xl font-bold text-navy-900">Loading published content…</h1></section>;
  if (!record) return <section className="mx-auto max-w-3xl px-6 py-24 text-center"><h1 className="text-3xl font-bold text-navy-900">Published content not found</h1><p className="mt-4 text-navy-600">This item is not available from the public published-content view.</p><Link className="mt-6 inline-block text-clinical-600 underline" to="/resources">Return to the learning library</Link></section>;

  const snapshot = record.snapshot;
  const title = readText(snapshot, 'title') ?? 'Published content';
  const summary = readText(snapshot, 'excerpt') ?? readText(snapshot, 'description') ?? readText(snapshot, 'overview');
  const category = readText(snapshot, 'category') ?? readText(snapshot, 'department');
  const sections = readSections(snapshot);
  const takeaways = readStringArray(snapshot, 'takeaways');
  const learningOutcomes = readStringArray(snapshot, 'learningOutcomes');

  return <article className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
    <nav aria-label="Breadcrumb" className="mb-8 text-sm"><Link className="text-clinical-700 underline" to="/resources">Learning library</Link><span className="px-2 text-navy-400">/</span><span className="text-navy-600">{kindLabels[record.kind]}</span></nav>
    <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{kindLabels[record.kind]}{category ? ` · ${category}` : ''}</p>
    <h1 className="mt-3 text-3xl font-heading font-bold leading-tight text-navy-900 md:text-4xl">{title}</h1>
    {summary && <p className="mt-5 text-lg leading-relaxed text-navy-700">{summary}</p>}
    {sections.map((section, index) => <section key={`${section.heading}-${index}`} className="mt-9"><h2 className="text-2xl font-heading font-bold text-navy-900">{section.heading}</h2>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="mt-4 leading-relaxed text-navy-700">{paragraph}</p>)}</section>)}
    {learningOutcomes.length > 0 && <section className="mt-9"><h2 className="text-xl font-bold text-navy-900">Learning outcomes</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-navy-700">{learningOutcomes.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section>}
    {takeaways.length > 0 && <section className="mt-9"><h2 className="text-xl font-bold text-navy-900">Key takeaways</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-navy-700">{takeaways.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section>}
    <p className="mt-10 border-t border-navy-100 pt-5 text-xs text-navy-500">This page displays content returned by the published-content view. Publication status does not establish accreditation, certificate eligibility, or clinical approval beyond the recorded workflow.</p>
  </article>;
}
