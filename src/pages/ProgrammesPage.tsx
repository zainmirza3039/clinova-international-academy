import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import PageHero from '@/components/PageHero';
import ProposedProgrammeCard from '@/components/ProposedProgrammeCard';
import { ownerListedProgrammes } from '@/data/programmeCatalogueBrowse';
import { useSEO } from '@/hooks/useSEO';

export default function ProgrammesPage() {
  const [query, setQuery] = useState('');

  useSEO({
    title: 'Browse proposed programmes',
    description: 'Browse eight Clinova programme titles as proposals only. No programme is open for enrolment.',
    noindex: true,
  });

  const filteredProgrammes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return ownerListedProgrammes.filter((programme) =>
      !normalizedQuery || programme.title.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Programmes' }]}
        eyebrow="Programme catalogue"
        title="Browse proposed programmes"
        description="These eight titles are proposed catalogue entries only. None is open for enrolment."
      />
      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="border border-amber-300 bg-amber-50 p-6" role="status">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-heading text-xl font-bold text-navy-900">Programme enrolment is not open</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">
                  The titles below are listed as proposals only. No programme application or enrolment is available.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-10" aria-labelledby="programme-directory-title">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Title directory</p>
              <h2 id="programme-directory-title" className="mt-2 font-heading text-2xl font-bold text-navy-900">Find a proposed programme</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">Browse the listed titles only; each detail page repeats its proposed, not-open status.</p>
            </div>
            <div className="mt-6 max-w-2xl">
              <label htmlFor="programme-title-search" className="mb-2 block text-sm font-semibold text-navy-800">Search proposed programme titles</label>
              <input
                id="programme-title-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by programme title"
                className="min-h-12 w-full rounded-md border border-navy-300 bg-white px-4 text-sm text-navy-900 placeholder:text-navy-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
              />
            </div>
            <p className="mt-4 text-sm text-navy-600" role="status" aria-live="polite">
              Showing {filteredProgrammes.length} of {ownerListedProgrammes.length} proposed programme titles.
            </p>
            {filteredProgrammes.length > 0 ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProgrammes.map((programme) => <ProposedProgrammeCard key={programme.id} programme={programme} />)}
              </div>
            ) : (
              <p className="mt-5 border border-navy-200 bg-surface-50 p-5 text-sm text-navy-700" role="status">No proposed programme titles match your search.</p>
            )}
          </section>

          <div className="mt-12 flex flex-wrap gap-5 border-t border-navy-100 pt-7">
            <Link to="/departments" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Browse proposed subject areas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/cpd-courses" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Browse proposed CPD topics <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/application" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-clinical-700 underline underline-offset-4">Application information <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
