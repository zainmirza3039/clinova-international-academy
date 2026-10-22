import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import Breadcrumbs from '@/components/Breadcrumbs';
import { learningResources } from '@/data/learningResources';

const publishedLearningResources = learningResources.filter(resource => resource.publicationStatus === 'published');
import { educationalDisclaimer, getEducationalArticle } from '@/data/educationalArticles';

export default function LearningResourcesPage() {
  useSEO({ title: 'Study Guides and Learning Resources', description: 'Explore educational checklists, reasoning worksheets, documentation prompts and revision notes. Professional learning resources awaiting qualified review, not clinical protocols.' });
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => publishedLearningResources.filter(resource => `${resource.title} ${resource.kind} ${resource.summary}`.toLowerCase().includes(search.trim().toLowerCase())), [search]);
  return <>
    <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Resources', to: '/resources' }, { label: 'Study tools' }]} eyebrow="Learning resources" title="Study, Reflect and Discuss" description="Use these original reading-based tools to structure professional learning. No downloads, submissions, saved notes or learner records are available here." />
    <section className="max-w-editorial mx-auto px-6 lg:px-10 py-12">
      <aside className="p-5 mb-8 bg-amber-50 border border-amber-200 text-sm leading-relaxed text-navy-700">{educationalDisclaimer} Do not enter or share personal or patient information.</aside>
      <label htmlFor="study-resource-search" className="block mb-2 font-semibold text-navy-900">Search study tools</label><input id="study-resource-search" type="search" value={search} onChange={event => setSearch(event.target.value)} className="w-full p-3 border border-navy-200 mb-5 focus:ring-2 focus:ring-clinical-500" placeholder="Search guides, checklists or worksheets" />
      <p role="status" aria-live="polite" className="text-sm text-navy-600 mb-6">Showing {filtered.length} resource{filtered.length === 1 ? '' : 's'}</p>
      {publishedLearningResources.length === 0 ? <p className="p-6 bg-surface-50 border border-navy-100 text-navy-700">Study resources are being prepared for publication after qualified review. Unapproved materials are not available in the public library.</p> : filtered.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(resource => <article key={resource.slug} className="p-6 bg-white border border-navy-100"><p className="text-xs font-semibold text-clinical-600">{resource.kind}</p><h2 className="mt-3 text-lg font-bold text-navy-900"><Link to={`/learning-resources/${resource.slug}`} className="hover:underline">{resource.title}</Link></h2><p className="mt-3 text-sm leading-relaxed text-navy-700">{resource.summary}</p><p className="mt-4 text-xs text-navy-500">Read online — no downloadable file or submission</p></article>)}</div> : <p className="p-6 bg-surface-50 text-navy-700">No study tools match your search. Try a broader term.</p>}
      <Link to="/resources" className="inline-block mt-8 text-clinical-600 underline">Browse educational articles</Link>
    </section>
  </>;
}

export function LearningResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const resource = publishedLearningResources.find(item => item.slug === slug);
  useSEO({ title: resource ? resource.title : 'Study Resource Not Found', description: resource?.summary ?? 'The requested study resource could not be found.' });
  if (!resource) return <section className="max-w-3xl mx-auto px-6 py-24 text-center"><h1 className="text-3xl font-bold text-navy-900">Study Resource Not Found</h1><Link to="/learning-resources" className="inline-block mt-6 text-clinical-600 underline">Browse study tools</Link></section>;
  const related = resource.relatedArticleSlugs.map(getEducationalArticle).filter((article): article is NonNullable<typeof article> => Boolean(article && article.status === 'published'));
  return <>
    <header className="bg-navy-900 pt-28 pb-12 lg:pt-36"><div className="max-w-4xl mx-auto px-6"><Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Study tools', to: '/learning-resources' }, { label: resource.kind }]} /><p className="mt-5 text-teal-300 text-sm">{resource.kind}</p><h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">{resource.title}</h1><p className="mt-4 text-navy-200">{resource.summary}</p></div></header>
    <article className="max-w-4xl mx-auto px-6 py-12">
      <aside className="bg-amber-50 border border-amber-200 p-5 text-sm leading-relaxed text-navy-700"><strong>Educational reading only.</strong> {educationalDisclaimer} No patient-data collection, downloadable document, course credit or completion record is provided.</aside>
      {resource.sections.map(section => <section key={section.heading} className="mt-9"><h2 className="text-2xl font-bold text-navy-900">{section.heading}</h2>{section.paragraphs.map((paragraph, index) => <p key={index} className="mt-4 leading-relaxed text-navy-700">{paragraph}</p>)}</section>)}
      <section className="mt-9 p-6 bg-surface-50"><h2 className="text-xl font-bold text-navy-900">Reflection prompts</h2><p className="mt-3 text-sm text-navy-600">These are reading prompts, not inputs or a form. Use only fictional material in an approved learning setting.</p><ol className="mt-4 list-decimal pl-5 space-y-3 text-navy-700">{resource.prompts.map(prompt => <li key={prompt}>{prompt}</li>)}</ol></section>
      <section className="mt-9"><h2 className="text-xl font-bold text-navy-900">Related reading</h2><ul className="mt-4 space-y-3">{related.map(article => <li key={article.slug}><Link to={`/resources/${article.slug}`} className="text-clinical-600 underline">{article.title}</Link></li>)}</ul></section>
      <section className="mt-9"><h2 className="text-xl font-bold text-navy-900">Source guidance</h2><p className="mt-3 text-sm text-navy-600">UK guidance informs these study prompts; check local professional rules and clinical guidance. The sources do not endorse this resource.</p><ul className="mt-4 space-y-3">{resource.references.map(reference => <li key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer" className="text-clinical-600 underline break-words">{reference.title}<span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul></section>
    </article>
  </>;
}
