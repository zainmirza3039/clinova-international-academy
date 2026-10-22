import { useState, useMemo } from 'react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import CPDCard from '@/components/CPDCard';
import SearchBar from '@/components/SearchBar';
import { publishedCPDCourses } from '@/data/cpdCourses';
import { departments } from '@/data/departments';
import { ChevronDown } from 'lucide-react';

export default function CPDCoursesPage() {
  useSEO({
    title: 'Confirmed CPD Courses',
    description:
      'Browse academy-approved CPD courses. Unconfirmed topic outlines are not listed as available courses.',
  });

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [cpdFilter, setCpdFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = useMemo(() => {
    return publishedCPDCourses.filter((c) => {
      if (deptFilter !== 'All' && c.department !== deptFilter) return false;
      if (cpdFilter !== 'All' && c.cpdHours !== parseInt(cpdFilter)) return false;
      if (levelFilter !== 'All' && c.level !== levelFilter) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [search, deptFilter, cpdFilter, levelFilter]);

  const visible = filtered.slice(0, visibleCount);
  const selectClass = 'w-full px-4 py-3 text-sm bg-white border border-navy-200 focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:border-transparent text-navy-800';

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'CPD Courses' }]}
        eyebrow="CPD Courses"
        title="Continuing Professional Development"
        description="Only academy-approved CPD offerings appear here. Recognised hours, accreditation, delivery and enrolment will be stated only when confirmed."
        image="https://images.pexels.com/photos/5452222/pexels-photo-5452222.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          {/* Search + Filters */}
          <div className="bg-surface-50 p-6 mb-12 border border-navy-100">
            <div className="mb-4">
              <SearchBar value={search} onChange={setSearch} placeholder="Search CPD courses..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="cpd-department" className="block text-xs font-medium text-navy-500 mb-1.5">Department</label>
                <select id="cpd-department" className={selectClass} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option value="All">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cpd-hours" className="block text-xs font-medium text-navy-500 mb-1.5">CPD Hours</label>
                <select id="cpd-hours" disabled aria-describedby="cpd-hours-note" className={selectClass} value={cpdFilter} onChange={(e) => setCpdFilter(e.target.value)}>
                  <option value="All">Hours awaiting confirmation</option>
                </select>
                <p id="cpd-hours-note" className="mt-2 text-xs text-navy-600">No verified CPD hours are available to filter.</p>
              </div>
              <div>
                <label htmlFor="cpd-level" className="block text-xs font-medium text-navy-500 mb-1.5">Level</label>
                <select id="cpd-level" className={selectClass} value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                  <option value="All">All Levels</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-8" role="status" aria-live="polite" aria-atomic="true">
            <p className="text-sm text-navy-500">
              Showing <span className="font-semibold text-navy-800">{visible.length}</span> of {filtered.length} course{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {visible.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {visible.map((course, i) => (
                  <CPDCard key={course.id} course={course} index={i} />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setVisibleCount((c) => c + 8)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-800 font-semibold border border-navy-200 hover:border-navy-300 hover:bg-surface-50 transition-colors"
                  >
                    Load More Courses
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-surface-50 border border-navy-100">
              <p className="text-navy-800 mb-2 font-semibold">No CPD courses are currently approved for publication.</p>
              <p className="text-sm text-navy-600">The academy will list courses here after confirming availability, recognised CPD hours, delivery and any accreditation. No enrolment is currently offered through this page.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
