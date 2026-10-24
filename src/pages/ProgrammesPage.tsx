import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Filter, RotateCcw, Search } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import ProgrammeCard from '@/components/ProgrammeCard';
import CTASection from '@/components/CTASection';
import SearchBar from '@/components/SearchBar';
import { publishedProgrammes } from '@/data/programmes';
import { departments } from '@/data/departments';

export default function ProgrammesPage() {
  useSEO({
    title: 'Healthcare Learning Guides',
    description: 'Browse structured healthcare learning guides by subject, level and topic for independent study.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const requestedCategory = searchParams.get('type') || 'All';
  const categories = useMemo(
    () => [...new Set(publishedProgrammes.map((programme) => programme.category))].sort(),
    [],
  );
  const categoryFilter = requestedCategory === 'All' || categories.some(category => category === requestedCategory)
    ? requestedCategory
    : 'All';

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('en-GB');
    return publishedProgrammes.filter((programme) => {
      if (searchParams.get('featured') === 'true' && !programme.featured) return false;
      if (categoryFilter !== 'All' && programme.category !== categoryFilter) return false;
      if (deptFilter !== 'All' && programme.departmentSlug !== deptFilter) return false;
      if (levelFilter !== 'All' && programme.level !== levelFilter) return false;
      if (query && ![programme.title, programme.description, programme.department, programme.category]
        .some((value) => value.toLocaleLowerCase('en-GB').includes(query))) return false;
      return true;
    });
  }, [search, deptFilter, levelFilter, categoryFilter, searchParams]);

  const selectClass = 'w-full rounded-md px-4 py-3 text-sm bg-white border border-navy-200 text-navy-800 focus:outline-none focus:ring-2 focus:ring-clinical-500';
  const hasFilters = Boolean(search.trim()) || deptFilter !== 'All' || levelFilter !== 'All' || categoryFilter !== 'All' || searchParams.get('featured') === 'true';

  function resetFilters() {
    setSearch('');
    setDeptFilter('All');
    setLevelFilter('All');
    setSearchParams({});
  }

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Programmes' }]}
        eyebrow="Learning library"
        title="Build your knowledge, one topic at a time."
        description="Browse structured healthcare learning guides for independent study. Each page explains its scope and current catalogue status so you can decide what to explore next."
        image="https://images.pexels.com/photos/8376296/pexels-photo-8376296.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="bg-white py-12 lg:py-20">
        <div className="mx-auto max-w-editorial px-6 lg:px-10">
          <div className="mb-8 flex flex-col gap-4 border-b border-navy-100 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Explore by interest</p>
              <h2 className="mt-2 font-heading text-2xl font-bold text-navy-900 md:text-3xl">Healthcare learning guides</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-600">Use search and filters to narrow the library. These listings are self-study resources, not enrolment or accreditation offers.</p>
            </div>
            <div className="inline-flex shrink-0 items-center gap-2 text-sm text-navy-600">
              <BookOpen className="h-4 w-4 text-clinical-700" aria-hidden="true" />
              <span>{filtered.length} {filtered.length === 1 ? 'topic' : 'topics'} found</span>
            </div>
          </div>

          <div className="mb-10 rounded-xl border border-navy-100 bg-surface-50 p-5 md:p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-navy-900">
              <Filter className="h-4 w-4 text-clinical-700" aria-hidden="true" />
              Find a learning topic
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <label htmlFor="programme-search" className="mb-2 block text-xs font-semibold text-navy-600">Search</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
                  <input id="programme-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topics..." className="w-full rounded-md border border-navy-200 bg-white py-3 pl-9 pr-3 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-clinical-500" />
                </div>
              </div>
              <div>
                <label htmlFor="programme-department" className="mb-2 block text-xs font-semibold text-navy-600">Subject area</label>
                <select id="programme-department" className={selectClass} value={deptFilter} onChange={(event) => setDeptFilter(event.target.value)}>
                  <option value="All">All subject areas</option>
                  {departments.map((department) => <option key={department.id} value={department.slug}>{department.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="programme-category" className="mb-2 block text-xs font-semibold text-navy-600">Resource type</label>
                <select id="programme-category" className={selectClass} value={categoryFilter} onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value === 'All') next.delete('type');
                  else next.set('type', event.target.value);
                  setSearchParams(next);
                }}>
                  <option value="All">All resource types</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="programme-level" className="mb-2 block text-xs font-semibold text-navy-600">Study level</label>
                <select id="programme-level" className={selectClass} value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
                  <option value="All">All levels</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            {hasFilters && (
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-clinical-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-clinical-500">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear filters
                </button>
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-navy-600" role="status" aria-live="polite" aria-atomic="true">
              Showing <span className="font-semibold text-navy-900">{filtered.length}</span> learning {filtered.length === 1 ? 'guide' : 'guides'}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((programme, index) => <ProgrammeCard key={programme.id} programme={programme} index={index} />)}
            </div>
          ) : (
            <div className="border border-dashed border-navy-200 bg-surface-50 px-6 py-16 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-navy-400" aria-hidden="true" />
              <h3 className="mt-4 font-heading text-lg font-bold text-navy-900">No formal programmes currently published</h3>
              <p className="mt-2 text-sm text-navy-600">Formal programme cohorts are not currently published. Browse the available open self-study courses for structured lessons and evidence sources.</p>
              <Link to="/cpd-courses" className="mt-5 inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:ring-offset-2">Browse Self-Study Courses <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Have a topic in mind?"
        description="Contact the academy to ask about educational resources or discuss a subject area you would like to see covered."
        primaryCTA={{ label: 'Contact the Academy', to: '/contact' }}
        secondaryCTA={{ label: 'Explore Departments', to: '/departments' }}
      />
    </>
  );
}
