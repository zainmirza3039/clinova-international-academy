import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import ProgrammeCard from '@/components/ProgrammeCard';
import SearchBar from '@/components/SearchBar';
import CTASection from '@/components/CTASection';
import { programmes } from '@/data/programmes';
import { departments } from '@/data/departments';
import type { ProgrammeCategory } from '@/data/types';

const programmeTypes: (ProgrammeCategory | 'All')[] = ['All', 'Certificate', 'Diploma', 'Professional Development', 'CPD'];
const durations = ['All', '8 weeks', '10 weeks', '12 weeks', '14 weeks', '16 weeks', '24 weeks'];
const deliveries = ['All', 'Online'];

export default function ProgrammesPage() {
  useSEO({
    title: 'Programmes',
    description:
      'Browse all healthcare education programmes at Clinova International Academy. Filter by department, type, duration and CPD hours.',
  });

  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'All';
  const initialFeatured = searchParams.get('featured') === 'true';

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [durationFilter, setDurationFilter] = useState('All');
  const [deliveryFilter, setDeliveryFilter] = useState('All');

  const filtered = useMemo(() => {
    return programmes.filter((p) => {
      if (initialFeatured && !p.featured) return false;
      if (typeFilter !== 'All' && p.category !== typeFilter) return false;
      if (deptFilter !== 'All' && p.departmentSlug !== deptFilter) return false;
      if (durationFilter !== 'All' && p.duration !== durationFilter) return false;
      if (deliveryFilter !== 'All' && p.delivery !== deliveryFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [search, deptFilter, typeFilter, durationFilter, deliveryFilter, initialFeatured]);

  const selectClass = 'w-full px-4 py-3 text-sm bg-white border border-navy-200 focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:border-transparent text-navy-800';

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Programmes' }]}
        eyebrow="Programmes"
        title="All Programmes"
        description="Browse our complete catalogue of certificate courses, diploma programmes and professional development courses across all healthcare departments."
        image="https://images.pexels.com/photos/8376296/pexels-photo-8376296.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-editorial mx-auto px-6 lg:px-10">
          {/* Search + Filters */}
          <div className="bg-surface-50 p-6 mb-12 border border-navy-100">
            <div className="mb-4">
              <SearchBar value={search} onChange={setSearch} placeholder="Search programmes..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Department</label>
                <select className={selectClass} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option value="All">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.slug}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Programme Type</label>
                <select className={selectClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  {programmeTypes.map((t) => (
                    <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Duration</label>
                <select className={selectClass} value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)}>
                  {durations.map((d) => (
                    <option key={d} value={d}>{d === 'All' ? 'All Durations' : d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Delivery</label>
                <select className={selectClass} value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value)}>
                  {deliveries.map((d) => (
                    <option key={d} value={d}>{d === 'All' ? 'All Delivery' : d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-navy-500">
              Showing <span className="font-semibold text-navy-800">{filtered.length}</span> programme{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {filtered.map((prog, i) => (
                <ProgrammeCard key={prog.id} programme={prog} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface-50 border border-navy-100">
              <p className="text-navy-500 mb-2">No programmes match your current filters.</p>
              <p className="text-sm text-navy-400">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Can't Find What You're Looking For?"
        description="Contact our team to discuss your professional development needs and find the right programme."
        primaryCTA={{ label: 'Contact Academy', to: '/contact' }}
        secondaryCTA={{ label: 'Browse CPD Courses', to: '/cpd-courses' }}
      />
    </>
  );
}
