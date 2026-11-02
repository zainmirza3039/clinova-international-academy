import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import CPDCard from '@/components/CPDCard';
import SearchBar from '@/components/SearchBar';
import { publishedCPDCourses } from '@/data/cpdCourses';
import { getCPDCurriculum } from '@/data/cpdCurricula';

const departments = [...new Set(publishedCPDCourses.map((course) => course.department))];
const levels = [...new Set(publishedCPDCourses.map((course) => course.level))];
const studyFormats = [...new Set(publishedCPDCourses.map((course) => course.duration))];
const pageSize = 8;

function getCourseSearchText(course: (typeof publishedCPDCourses)[number]) {
  const curriculum = getCPDCurriculum(course.slug);
  const curriculumText = curriculum
    ? [
        ...curriculum.outcomes,
        ...curriculum.intendedAudience,
        ...curriculum.prerequisites,
        ...curriculum.modules.flatMap((module) => [
          module.title,
          module.description,
          module.reflectiveActivity,
          ...module.lessons.flatMap((lesson) => [lesson.title, lesson.description, lesson.text]),
        ]),
        ...curriculum.faqs.flatMap((faq) => [faq.question, faq.answer]),
      ]
    : [];

  return [course.title, course.department, course.description, course.level, course.duration, ...curriculumText]
    .join(' ')
    .toLocaleLowerCase('en-GB');
}

export default function CPDCoursesPage() {
  useSEO({
    title: 'Physiotherapy and Healthcare Self-Study Courses',
    description:
      'Explore structured self-study courses with learning outcomes, lessons and evidence sources. These open learning courses do not award accredited CPD hours or certificates.',
  });

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('en-GB');
    return publishedCPDCourses.filter((course) => {
      if (deptFilter !== 'All' && course.department !== deptFilter) return false;
      if (levelFilter !== 'All' && course.level !== levelFilter) return false;
      if (formatFilter !== 'All' && course.duration !== formatFilter) return false;
      if (query && !getCourseSearchText(course).includes(query)) return false;
      return true;
    });
  }, [search, deptFilter, levelFilter, formatFilter]);

  const visible = filtered.slice(0, visibleCount);
  const selectClass = 'w-full px-4 py-3 text-sm bg-white border border-navy-200 focus:outline-none focus:ring-2 focus:ring-clinical-500 focus:border-transparent text-navy-800 disabled:cursor-not-allowed disabled:bg-surface-50 disabled:text-navy-500';
  const hasActiveFilters = Boolean(search.trim()) || deptFilter !== 'All' || levelFilter !== 'All' || formatFilter !== 'All';

  const clearFilters = () => {
    setSearch('');
    setDeptFilter('All');
    setLevelFilter('All');
    setFormatFilter('All');
    setVisibleCount(pageSize);
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    setVisibleCount(pageSize);
  };

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Professional Development' }]}
        eyebrow="Professional Development"
        title="Physiotherapy & Healthcare Self-Study Courses"
        description="Study structured lessons, reflective activities and evidence sources across physiotherapy and healthcare. These open self-study courses do not award accredited CPD hours or certificates."
        image="https://images.pexels.com/photos/5452222/pexels-photo-5452222.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
      />

      <section className="bg-surface-50 px-6 py-8" aria-labelledby="clinical-learning-pathway-heading">
        <div className="mx-auto flex max-w-editorial flex-col gap-4 border border-navy-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="max-w-3xl">
            <h2 id="clinical-learning-pathway-heading" className="font-heading text-lg font-bold text-navy-900">Looking for supervised practical training?</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Clinical placements are a separate service delivered and supervised by partner institutions. No verified placements or application workflow are currently available.
            </p>
          </div>
          <Link to="/clinical-internships" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-navy-300 px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
            Review clinical internship availability <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-editorial px-6 lg:px-10">
          <div className="mb-10 border border-navy-100 bg-surface-50 p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-navy-900">Browse the self-study catalogue</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-600">
              Search published course titles, subject areas, intended audiences, topics and lesson text. Results use the existing course and curriculum records; instructor assignments and approved CPD-hour values are not listed.
            </p>

            <div className="mt-6">
              <SearchBar
                value={search}
                onChange={updateSearch}
                placeholder="Search titles, professions, topics or learning content..."
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="cpd-department" className="mb-1.5 block text-xs font-medium text-navy-700">Department</label>
                <select id="cpd-department" className={selectClass} value={deptFilter} onChange={(event) => { setDeptFilter(event.target.value); setVisibleCount(pageSize); }}>
                  <option value="All">All subject areas</option>
                  {departments.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="cpd-level" className="mb-1.5 block text-xs font-medium text-navy-700">Level</label>
                <select id="cpd-level" className={selectClass} value={levelFilter} onChange={(event) => { setLevelFilter(event.target.value); setVisibleCount(pageSize); }}>
                  <option value="All">All study levels</option>
                  {levels.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="cpd-format" className="mb-1.5 block text-xs font-medium text-navy-700">Study format</label>
                <select id="cpd-format" className={selectClass} value={formatFilter} onChange={(event) => { setFormatFilter(event.target.value); setVisibleCount(pageSize); }}>
                  <option value="All">All study formats</option>
                  {studyFormats.map((format) => <option key={format} value={format}>{format}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="cpd-instructor" className="mb-1.5 block text-xs font-medium text-navy-700">Instructor</label>
                <select id="cpd-instructor" className={selectClass} value="unlisted" disabled aria-describedby="cpd-instructor-note">
                  <option value="unlisted">No instructor details listed</option>
                </select>
                <p id="cpd-instructor-note" className="mt-2 text-xs leading-relaxed text-navy-600">Instructor assignments are not included in these course records.</p>
              </div>
              <div>
                <label htmlFor="cpd-hours" className="mb-1.5 block text-xs font-medium text-navy-700">CPD credit</label>
                <select id="cpd-hours" className={selectClass} value="unawarded" disabled aria-describedby="cpd-hours-note">
                  <option value="unawarded">No approved hours listed</option>
                </select>
                <p id="cpd-hours-note" className="mt-2 text-xs leading-relaxed text-navy-600">This library does not award or record CPD hours.</p>
              </div>
            </div>

            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="mt-5 min-h-11 rounded-md border border-navy-300 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
                Clear search and filters
              </button>
            )}
          </div>

          <div className="mb-8" role="status" aria-live="polite" aria-atomic="true">
            <p className="text-sm text-navy-600">
              Showing <span className="font-semibold text-navy-900">{visible.length}</span> of <span className="font-semibold text-navy-900">{filtered.length}</span> matching self-study course{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {visible.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {visible.map((course, index) => <CPDCard key={course.id} course={course} index={index} />)}
              </div>
              {visibleCount < filtered.length && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + pageSize)}
                    className="inline-flex items-center gap-2 border border-navy-200 bg-white px-6 py-3 font-semibold text-navy-800 transition-colors hover:border-navy-300 hover:bg-surface-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
                  >
                    Load More Courses <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="border border-navy-100 bg-surface-50 py-16 text-center">
              <h2 className="mb-2 font-heading text-xl font-bold text-navy-900">No self-study courses match your current filters.</h2>
              <p className="text-sm text-navy-600">Try another title, subject area, level, format or search term from the course material.</p>
              <button type="button" onClick={clearFilters} className="mt-5 min-h-11 rounded-md bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600">
                Clear search and filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
