import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import PageHero from '@/components/PageHero';
import { publishedProgrammes } from '@/data/programmes';
import type { Programme } from '@/data/types';

export default function CertificationPage({ programmeRecords = publishedProgrammes }: { programmeRecords?: Programme[] }) {
  const [query, setQuery] = useState('');
  useSEO({
    title: 'Certificate and qualification information',
    description: 'Current certificate availability and links to Clinova programme learning guides.',
  });

  const filteredProgrammes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return programmeRecords;
    return programmeRecords.filter((programme) =>
      `${programme.title} ${programme.department} ${programme.description}`.toLowerCase().includes(normalizedQuery),
    );
  }, [programmeRecords, query]);

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Certificate information' }]}
        eyebrow="Certificates and qualifications"
        title="Certificate information"
        description="Find current information about certificate availability and explore the published programme learning guides."
      />

      <section className="bg-white px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-editorial space-y-12">
          <section aria-labelledby="certificate-availability-heading" className="border border-navy-200 bg-surface-50 p-6 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">Current service status</p>
            <h2 id="certificate-availability-heading" className="mt-3 font-heading text-2xl font-bold text-navy-800">
              Public certificate services are unavailable
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-navy-600">
              The published learner-facing pages do not define or confirm a certificate-eligibility or issuance process. Programme and CPD pages are self-study learning resources; their publication does not establish an award, accreditation, or certificate eligibility.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-navy-600">
              A course-completion certificate and an accredited qualification are different claims. This public page cannot issue a certificate or show certificate records or eligibility decisions, and it makes no accredited-qualification claim.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/verify" className="inline-flex min-h-11 items-center justify-center border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-white">
                Check verification availability
              </Link>
              <Link to="/cpd-courses" className="inline-flex min-h-11 items-center justify-center px-5 py-3 text-sm font-semibold text-clinical-700 underline">
                Browse self-study courses
              </Link>
            </div>
          </section>

          <section aria-labelledby="programme-guides-heading">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">Repository-backed catalogue</p>
              <h2 id="programme-guides-heading" className="mt-3 font-heading text-2xl md:text-3xl font-bold text-navy-800">
                Published programme learning guides
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">
                These links open the learning-guide pages in the current catalogue. They are not certificate applications or qualification offers.
              </p>
            </div>

            <div className="mt-7 max-w-xl">
              <label htmlFor="certification-programme-search" className="mb-2 block text-sm font-semibold text-navy-800">
                Search programme guides
              </label>
              <input
                id="certification-programme-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, department or topic"
                className="w-full rounded-md border border-navy-300 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
              />
            </div>
            <p className="mt-4 text-sm text-navy-600" role="status" aria-live="polite" aria-atomic="true">
              {programmeRecords.length === 0
                ? 'No published programme guides are currently listed.'
                : `${filteredProgrammes.length} programme ${filteredProgrammes.length === 1 ? 'guide' : 'guides'} found`}
            </p>

            {programmeRecords.length === 0 ? (
              <p className="mt-5 border border-navy-200 bg-surface-50 p-5 text-sm text-navy-700">
                Programme details are not available in the current published catalogue.
              </p>
            ) : filteredProgrammes.length > 0 ? (
              <ul className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                {filteredProgrammes.map((programme) => (
                  <li key={programme.id}>
                    <article className="flex h-full flex-col border border-navy-200 bg-white p-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-clinical-700">{programme.department}</p>
                      <h3 className="mt-2 font-heading text-lg font-bold text-navy-800">
                        <Link to={`/programmes/${programme.slug}`} className="underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:decoration-current">
                          {programme.title}
                        </Link>
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">{programme.description}</p>
                      <Link to={`/programmes/${programme.slug}`} className="mt-5 inline-flex min-h-11 items-center font-semibold text-clinical-700 underline">
                        Read this learning guide
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 border border-navy-200 bg-surface-50 p-5 text-sm text-navy-700">
                No programme guides match your search. Try another title, department or topic.
              </p>
            )}
          </section>
        </div>
      </section>
    </>
  );
}
