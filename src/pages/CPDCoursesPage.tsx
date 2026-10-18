import { useState, useMemo } from 'react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import CPDCard from '@/components/CPDCard';
import SearchBar from '@/components/SearchBar';
import { cpdCourses } from '@/data/cpdCourses';
import { departments } from '@/data/departments';
import { ChevronDown } from 'lucide-react';

export default function CPDCoursesPage() {
  useSEO({
    title: 'CPD Courses',
    description:
      'Browse CPD-focused online courses at Clinova International Academy. Filter by department, CPD hours and level. Flexible online learning for healthcare professionals.',
  });

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [cpdFilter, setCpdFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = useMemo(() => {
    return cpdCourses.filter((c) => {
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
        title="CPD-Focused Online Learning"
        description="Continue your professional development with flexible online CPD courses. Build knowledge, strengthen skills and maintain your professional growth."
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
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Department</label>
                <select className={selectClass} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option value="All">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">CPD Hours</label>
                <select className={selectClass} value={cpdFilter} onChange={(e) => setCpdFilter(e.target.value)}>
                  <option value="All">All Hours</option>
                  <option value="5">5 hours</option>
                  <option value="6">6 hours</option>
                  <option value="8">8 hours</option>
                  <option value="10">10 hours</option>
                  <option value="12">12 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Level</label>
                <select className={selectClass} value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                  <option value="All">All Levels</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-8">
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
              <p className="text-navy-500 mb-2">No CPD courses match your current filters.</p>
              <p className="text-sm text-navy-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
