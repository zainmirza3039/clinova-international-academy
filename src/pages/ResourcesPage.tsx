import { newsItems as mainArticleSnapshots } from '@/data/content';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import Breadcrumbs from '@/components/Breadcrumbs';
import NewsCard from '@/components/NewsCard';
import { newsItems } from '@/data/resourceDrafts';

const publishedArticleItems = newsItems.filter(item => getEducationalArticle(item.slug)?.status === 'published');
const publishedArticleCategories = [...new Set(publishedArticleItems.map(item => item.category))];
import { educationalArticleCards, educationalDisclaimer, draftDateLabel, getEducationalArticle } from '@/data/educationalArticles';
import { publishedProgrammes } from '@/data/programmes';

export function ResourcesPage() {
  useSEO({ title: 'Educational Article Library', description: 'The public learning library is being prepared. Articles will appear here only after clinical and editorial approval.' });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('en-GB');
    return publishedArticleItems.filter(item => {
      if (category !== 'All' && item.category !== category) return false;
      const article = getEducationalArticle(item.slug);
      const text = [item.title, item.excerpt, ...(article?.sections.flatMap(section => [section.heading, ...section.paragraphs]) ?? [])].join(' ').toLocaleLowerCase('en-GB');
      return !query || text.includes(query);
    });
  }, [search, category]);
  return <>
    <PageHero breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }]} eyebrow="Learning resources" title="Learning Library" description="Educational articles will be listed after clinical and editorial approval. No draft materials are presented as published academy content." />
    <section className="py-12 lg:py-16 bg-white"><div className="max-w-editorial mx-auto px-6 lg:px-10">
      <aside className="bg-amber-50 border border-amber-200 p-5 mb-8 text-sm text-navy-700 leading-relaxed">{educationalDisclaimer}</aside>
      <div className="flex flex-wrap gap-4 mb-8 text-sm font-semibold"><Link to="/learning-resources" className="text-clinical-600 underline underline-offset-4">Study guides, checklists and reflection tools</Link><Link to="/programmes" className="text-clinical-600 underline underline-offset-4">Proposed programme outlines</Link></div>
      <div className="bg-navy-50 border border-navy-100 p-5 mb-8">
        <label htmlFor="resource-search" className="block text-sm font-semibold text-navy-800 mb-2">Search resources</label>
        <input id="resource-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search titles, topics or article text" className="w-full px-4 py-3 mb-4 text-sm bg-white border border-navy-200 focus:outline-none focus:ring-2 focus:ring-clinical-500 text-navy-800" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by topic">{['All', ...publishedArticleCategories].map(cat => <button type="button" key={cat} onClick={() => setCategory(cat)} aria-pressed={category === cat} className={`px-4 py-2 text-sm font-medium border ${category === cat ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-navy-700 border-navy-200'}`}>{cat}</button>)}</div>
      </div>
      <p className="mb-6 text-sm text-navy-600" role="status" aria-live="polite" aria-atomic="true">Showing {filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>
      {publishedArticleItems.length === 0 ? <div className="text-center py-12 bg-navy-50 border border-navy-100"><p className="font-semibold text-navy-800">Articles are being prepared for publication.</p><p className="mt-2 text-sm text-navy-600">Clinical and editorial review must be completed before materials appear in this public library.</p></div> : filtered.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">{filtered.map((item, index) => <NewsCard key={item.id} item={item} index={index} />)}</div> : <div className="text-center py-12 bg-navy-50"><p className="font-semibold text-navy-800">No articles match your search.</p><p className="mt-2 text-sm text-navy-600">Try a broader term or another topic.</p><button type="button" onClick={() => { setSearch(''); setCategory('All'); }} className="mt-5 px-5 py-2 bg-navy-900 text-white">Clear filters</button></div>}

    </div></section>
  </>;
}

export function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = getEducationalArticle(slug);
  useSEO({ title: article?.status === 'published' ? article.seoTitle : 'Article Not Found', description: article?.status === 'published' ? article.seoDescription : 'This educational article is not available for public reading.', noindex: !article || article.status !== 'published' });
  if (!article || article.status !== 'published') return <section className="max-w-3xl mx-auto px-6 py-24 text-center"><h1 className="text-3xl font-bold text-navy-900">Article Not Found</h1><p className="mt-4 text-navy-600">This address does not match an article in the library.</p><Link className="inline-block mt-6 text-clinical-600 underline" to="/resources">View All Resources</Link></section>;
  const explicitRelated = article.relatedArticleSlugs.map(relatedSlug => educationalArticleCards.find(item => item.slug === relatedSlug)).filter((item): item is typeof newsItems[number] => Boolean(item));
  const related = (explicitRelated.length ? explicitRelated : educationalArticleCards.filter(item => item.slug !== article.slug && item.category === article.category && getEducationalArticle(item.slug)?.status === 'published')).slice(0, 3);
  const relatedProgrammes = article.relatedProgrammeSlugs.map(programmeSlug => publishedProgrammes.find(item => item.slug === programmeSlug)).filter((item): item is typeof programmes[number] => Boolean(item));
  return <>
    <header className="bg-navy-900 pt-28 pb-12 lg:pt-36"><div className="max-w-4xl mx-auto px-6"><Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Resources', to: '/resources' }, { label: article.category }]} /><p className="mt-6 text-sm font-semibold text-teal-300">{article.category}</p><h1 className="mt-3 text-3xl md:text-4xl font-heading font-bold text-white leading-tight">{article.title}</h1><p className="mt-5 text-navy-200 leading-relaxed">{article.excerpt}</p><p className="mt-4 text-sm text-navy-300">{draftDateLabel}</p></div></header>
    <article className="max-w-4xl mx-auto px-6 py-12">
      <aside aria-label="Educational status" className="p-5 bg-amber-50 border border-amber-200 text-sm text-navy-700 leading-relaxed"><strong>Not clinically approved or published.</strong> {educationalDisclaimer}</aside>
      <nav aria-label="Article contents" className="my-8 border border-navy-100 p-5"><h2 className="font-semibold text-navy-900">In this article</h2><ol className="mt-3 list-decimal pl-5 space-y-2">{article.sections.map((section, index) => <li key={section.heading}><a className="text-clinical-600 underline underline-offset-2" href={`#article-section-${index + 1}`}>{section.heading}</a></li>)}</ol></nav>
      {article.sections.map((section, index) => <section key={section.heading} id={`article-section-${index + 1}`} className="mt-9 scroll-mt-28"><h2 className="text-2xl font-heading font-bold text-navy-900">{section.heading}</h2>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="mt-4 text-base text-navy-700 leading-relaxed">{paragraph}</p>)}</section>)}
      <section className="mt-10 p-6 bg-surface-50"><h2 className="text-xl font-bold text-navy-900">Practical educational takeaways</h2><ul className="mt-4 list-disc pl-5 space-y-3 text-navy-700">{article.takeaways.map(takeaway => <li key={takeaway}>{takeaway}</li>)}</ul></section>
      <section className="mt-10"><h2 className="text-xl font-bold text-navy-900">References and further reading</h2><p className="mt-3 text-sm text-navy-600">Check the current source, local guidance and population before applying recommendations. Citations inform these materials and are not endorsement of this website.</p><ul className="mt-4 list-disc pl-5 space-y-3">{article.references.map(reference => <li key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer" className="text-clinical-600 underline break-words">{reference.title}<span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul></section>
      {relatedProgrammes.length > 0 && <section className="mt-10"><h2 className="text-xl font-bold text-navy-900">Related proposed programmes</h2><p className="mt-3 text-sm text-navy-600">Proposed outlines only; no enrolment, accreditation or certificate is offered through these pages.</p><ul className="mt-4 space-y-3">{relatedProgrammes.map(programme => <li key={programme.slug}><Link to={`/programmes/${programme.slug}`} className="text-clinical-600 underline">{programme.title}</Link></li>)}</ul></section>}
      <p className="mt-8 text-sm"><Link to="/learning-resources" className="text-clinical-600 underline">Use the learning and reflection resources</Link></p>
    </article>
    {related.length > 0 && <section className="bg-surface-50 py-12"><div className="max-w-editorial mx-auto px-6 lg:px-10"><h2 className="text-2xl font-bold text-navy-900 mb-8">Related articles</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{related.map((item, index) => <NewsCard key={item.id} item={item} index={index} />)}</div></div></section>}
  </>;
}
