import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/PageHero';
import CPDCard from '@/components/CPDCard';
import { useSEO } from '@/hooks/useSEO';
import { credentialTypes } from '@/data/credentialTypes';
import { ownerListedCPDTopics } from '@/data/catalogueBrowse';

const cpdSystemAreas = [
  { title: 'Course catalogue', detail: 'Course descriptions, learning objectives, syllabus and delivery details require separate review and approval.' },
  { title: 'Enrollment and learner access', detail: 'No application, enrollment, payment or learner-record service is connected.' },
  { title: 'Learning and course assessment', detail: 'Course materials, assessments and completion rules are not published as operational services.' },
  { title: 'CPD records and completion certificate', detail: 'No CPD completion record or certificate is currently issued or verified.' },
];

const suggestedSubjectAreas = [...new Set(ownerListedCPDTopics.map((topic) => topic.subjectArea))].sort();

export default function CPDCoursesPage() {
  const [query, setQuery] = useState('');
  const [subjectArea, setSubjectArea] = useState('');

  useSEO({
    title: 'Proposed CPD topics',
    description: 'Browse owner-listed Clinova CPD topic titles. They are proposals only; no course or enrollment is currently available.',
    noindex: true,
  });

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return ownerListedCPDTopics.filter((topic) => {
      const matchesQuery = !normalizedQuery || topic.title.toLocaleLowerCase().includes(normalizedQuery);
      const matchesArea = !subjectArea || topic.subjectArea === subjectArea;
      return matchesQuery && matchesArea;
    });
  }, [query, subjectArea]);

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'CPD Courses' }]}
        eyebrow="CPD education"
        title="Browse proposed CPD topics"
        description="Explore Clinova-listed topic titles by name or suggested subject area. These topic labels are not current course offers."
      />
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="border border-amber-300 bg-amber-50 p-6" role="status">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-heading text-xl font-bold text-navy-900">No CPD course enrollment is available</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">
                  The titles below are shown as proposed topic labels only. They do not represent open courses. Syllabi, outcomes, CPD hours, faculty, schedules, fees, assessments and completion rules are not presented as approved. This page does not collect learner information or submit an application.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-10" aria-labelledby="topic-directory-title">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Topic directory</p>
              <h2 id="topic-directory-title" className="mt-2 font-heading text-2xl font-bold text-navy-900">Find a proposed topic</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                Suggested subject groupings are provisional. Use them for browsing only; they do not establish an academic department or an approved curriculum.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)]">
              <div>
                <label htmlFor="cpd-topic-search" className="mb-2 block text-sm font-semibold text-navy-800">Search proposed topics</label>
                <input
                  id="cpd-topic-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by topic title"
                  className="min-h-12 w-full rounded-md border border-navy-300 bg-white px-4 text-sm text-navy-900 placeholder:text-navy-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
                />
              </div>
              <div>
                <label htmlFor="cpd-topic-subject-area" className="mb-2 block text-sm font-semibold text-navy-800">Suggested subject area (provisional)</label>
                <select
                  id="cpd-topic-subject-area"
                  value={subjectArea}
                  onChange={(event) => setSubjectArea(event.target.value)}
                  className="min-h-12 w-full rounded-md border border-navy-300 bg-white px-4 text-sm text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
                >
                  <option value="">All proposed topics</option>
                  {suggestedSubjectAreas.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
            </div>
            <p className="mt-4 text-sm text-navy-600" role="status" aria-live="polite">
              Showing {filteredTopics.length} of {ownerListedCPDTopics.length} proposed topic titles.
            </p>
            {filteredTopics.length > 0 ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTopics.map((topic) => <CPDCard key={topic.id} course={topic} />)}
              </div>
            ) : (
              <p className="mt-5 border border-navy-200 bg-surface-50 p-5 text-sm text-navy-700" role="status">No proposed topic titles match those filters.</p>
            )}
          </section>

          <section className="mt-14 border-t border-navy-100 pt-10" aria-labelledby="cpd-system-status-title">
            <div className="flex items-start gap-4">
              <BookOpenCheck className="mt-1 h-6 w-6 shrink-0 text-clinical-700" aria-hidden="true" />
              <div>
                <h2 id="cpd-system-status-title" className="font-heading text-xl font-bold text-navy-900">CPD system status</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-600">A topic title does not establish a live course, CPD credit, a completion certificate or professional competence. Related services remain disconnected.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {cpdSystemAreas.map((area) => (
                <article key={area.title} className="border border-navy-100 bg-surface-50 p-5">
                  <h3 className="font-heading text-lg font-bold text-navy-900">{area.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{area.detail}</p>
                  <p className="mt-3 text-xs font-semibold text-amber-800">Development only · not connected</p>
                </article>
              ))}
            </div>
            <section className="mt-8 border border-navy-100 p-6" aria-labelledby="cpd-credential-title">
              <h3 id="cpd-credential-title" className="font-heading text-lg font-bold text-navy-900">CPD completion certificate</h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">A future CPD certificate would be separate from professional competency certification and would require an approved course-specific completion policy. It does not establish statutory registration or a licence to practise.</p>
              <p className="mt-3 text-xs font-semibold text-amber-800">No CPD certificate is currently issued or verified here.</p>
            </section>
          </section>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/departments" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50">Browse subject areas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/programmes" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50">Programme catalogue status</Link>
            <Link to="/certification" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50">Professional certification</Link>
            <Link to="/verify" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50">Credential verification status</Link>
          </div>
          <p className="sr-only">Credential types remain distinct: {credentialTypes.map((item) => item.title).join('; ')}.</p>
        </div>
      </section>
    </>
  );
}
