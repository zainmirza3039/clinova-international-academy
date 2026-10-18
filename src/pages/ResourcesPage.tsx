import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Search as SearchIcon } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import NewsCard from '@/components/NewsCard';
import CTASection from '@/components/CTASection';
import { newsItems, newsCategories } from '@/data/testimonials';

export function ResourcesPage() {
  useSEO({
    title: 'Resources & News',
    description:
      'Clinical education insights, professional development articles, healthcare insights and academy news from Clinova International Academy.',
  });

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return newsItems.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.excerpt.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [search, category]);

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }]}
        eyebrow="Resources & News"
        title="Latest From Clinova"
        description="Clinical education insights, professional development articles, healthcare insights and academy updates."
        image="https://images.pexels.com/photos/6770532/pexels-photo-6770532.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-50 rounded-xl p-6 mb-8 border border-navy-100">
            <div className="relative mb-4">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                aria-label="Search resources"
                className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:border-transparent text-navy-800 placeholder:text-navy-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', ...newsCategories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    category === cat
                      ? 'bg-navy-900 text-white'
                      : 'bg-white text-navy-600 border border-navy-200 hover:border-navy-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-navy-500">
              Showing <span className="font-semibold text-navy-800">{filtered.length}</span> article{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => (
                <NewsCard key={item.id} item={item} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-navy-50 rounded-xl border border-navy-100">
              <p className="text-navy-500 mb-2">No articles match your search.</p>
              <p className="text-sm text-navy-400">Try a different search term or category.</p>
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Stay Updated With Clinova"
        description="Subscribe to our newsletter for updates on new programmes and resources."
        primaryCTA={{ label: 'Explore Programmes', to: '/programmes' }}
        secondaryCTA={{ label: 'Contact Academy', to: '/contact' }}
      />
    </>
  );
}

export function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = newsItems.find((n) => n.slug === slug);

  useSEO({
    title: item ? item.title : 'Article Not Found',
    description: item?.excerpt ?? 'Article not found.',
    ogImage: item?.image,
  });

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="text-center px-4">
          <h1 className="font-heading text-2xl font-bold text-navy-900 mb-4">Article Not Found</h1>
          <p className="text-navy-500 mb-6">The article you're looking for may have moved or no longer exists.</p>
          <Link to="/resources" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors">
            View All Resources
          </Link>
        </div>
      </div>
    );
  }

  const related = newsItems.filter((n) => n.id !== item.id && n.category === item.category).slice(0, 3);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <section className="bg-navy-900 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-1.5 text-sm">
            <Link to="/" className="text-navy-300 hover:text-teal-400">Home</Link>
            <span className="text-navy-500">/</span>
            <Link to="/resources" className="text-navy-300 hover:text-teal-400">Resources</Link>
            <span className="text-navy-500">/</span>
            <span className="text-white">{item.category}</span>
          </nav>
          <div className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-teal-600 text-white mb-3">
            {item.category}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight text-balance">
            {item.title}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-navy-300">
            <Calendar className="w-4 h-4" /> {formatDate(item.date)}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-base text-navy-600 leading-relaxed">{item.excerpt}</p>
            <p className="mt-4 text-base text-navy-600 leading-relaxed">
              This is a sample article. Full content will be added before publication. The article would explore the topic
              in detail, providing evidence-informed insights relevant to healthcare professionals.
            </p>
          </div>
          <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-navy-600">This is a demo article. Content will be replaced with verified information before publication.</p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-12 lg:py-16 bg-navy-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r, i) => (
                <NewsCard key={r.id} item={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
