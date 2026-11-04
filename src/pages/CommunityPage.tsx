import { CalendarDays, GraduationCap, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { learnerDataEnabled } from '@/lib/siteConfig';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import { useSEO } from '@/hooks/useSEO';

function EmptyState({ icon: Icon, title, text }: { icon: typeof CalendarDays; title: string; text: string }) {
  return (
    <div className="border border-navy-200 bg-white p-8 text-center">
      <Icon className="mx-auto mb-4 h-8 w-8 text-teal-500" aria-hidden="true" />
      <h2 className="font-heading text-xl font-bold text-navy-800">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-600">{text}</p>
    </div>
  );
}

export function EventsPage() {
  useSEO({ title: 'Community events', description: 'Browse upcoming learning events and academy announcements.' });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Community events' }]}
        eyebrow="Community"
        title="Community events"
        description="Event dates, venues and registration details are published here when confirmed."
      />
      <section className="bg-surface-50 py-16 lg:py-24">
        <div className="mx-auto max-w-editorial px-6 lg:px-10">
          <EmptyState icon={CalendarDays} title="No events currently listed" text="New event details will appear here when available." />
        </div>
      </section>
    </>
  );
}

type VerifiedInstructor = { user_id: string; public_name: string; professional_title: string; biography: string | null; credentials: string[] };

export function FacultyPage() {
  const [faculty, setFaculty] = useState<VerifiedInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured || !learnerDataEnabled) { setLoading(false); return; }
    let active = true;
    void supabase.from('verified_instructors').select('user_id,public_name,professional_title,biography,credentials').order('public_name').then(({data,error: queryError}) => {
      if (!active) return;
      if (queryError) setError(true); else setFaculty(((data ?? []) as { user_id: string; public_name: string; professional_title: string; biography: string | null; credentials: unknown }[]).map(person => ({ ...person, credentials: Array.isArray(person.credentials) ? person.credentials.filter((item: unknown): item is string => typeof item === 'string') : [] })) as VerifiedInstructor[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  useSEO({
    title: 'Healthcare faculty',
    description: 'See verified faculty information for Clinova International Academy and how educator information is handled.',
  });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Healthcare faculty' }]}
        eyebrow="Healthcare faculty"
        title="Faculty and contributors"
        description="This directory is reserved for educators whose professional information and responsibilities can be presented accurately."
      />
      <section className="bg-surface-50 px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-editorial lg:px-10">
          {loading ? <p className="border border-navy-200 bg-white p-8 text-center text-sm text-navy-600" role="status">Loading verified faculty profiles…</p> : error ? <p className="border border-amber-200 bg-amber-50 p-6 text-sm text-navy-700" role="alert">Faculty profiles are temporarily unavailable.</p> : faculty.length === 0 ? <EmptyState icon={GraduationCap} title="No verified faculty profiles are currently published" text="There are no approved profiles to display here. Profiles will appear after an administrator verifies professional details and teaching scope." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{faculty.map(person => <article key={person.user_id} className="border border-navy-200 bg-white p-6"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-clinical-700">Verified faculty</span><h2 className="mt-3 font-heading text-xl font-bold text-navy-900">{person.public_name}</h2><p className="mt-1 text-sm font-semibold text-navy-700">{person.professional_title}</p>{person.biography && <p className="mt-4 text-sm leading-relaxed text-navy-600">{person.biography}</p>}{person.credentials.length > 0 && <div className="mt-4 border-t border-navy-100 pt-4"><h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-500">Verified qualifications</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-700">{person.credentials.map((credential,index)=><li key={`${person.user_id}-${index}`}>{credential}</li>)}</ul></div>}</article>)}</div>}
          <div className="mt-8 border border-navy-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-700">Profile publishing standard</p>
            <h2 className="mt-3 font-heading text-xl font-bold text-navy-800">Professional details need to be checked before publication</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-600">
              Any future profile should identify its contributor's verified qualifications, relevant specialty and agreed teaching or supervisory scope. No CVs, identity documents or professional credentials are collected on this page.
            </p>
            <Link
              to="/become-an-instructor"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-navy-300 px-5 py-3 text-sm font-semibold text-navy-800 hover:bg-surface-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
            >
              Read instructor information
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function CommunityPage() {
  useSEO({ title: 'Clinova community', description: 'Community information and verified updates from Clinova International Academy.' });

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Community' }]}
        eyebrow="Community"
        title="A thoughtful learning community"
        description="Find verified updates about events and faculty as this section grows."
      />
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-editorial gap-8 px-6 md:grid-cols-2 lg:px-10">
          <Link to="/events" className="border-t-2 border-teal-500 p-5 pt-6 hover:bg-surface-50">
            <Users className="mb-4 h-6 w-6 text-clinical-600" aria-hidden="true" />
            <h2 className="font-heading text-xl font-bold text-navy-800">Events</h2>
            <p className="mt-2 text-sm text-navy-600">See only confirmed event information.</p>
          </Link>
          <Link to="/faculty" className="border-t-2 border-teal-500 p-5 pt-6 hover:bg-surface-50">
            <GraduationCap className="mb-4 h-6 w-6 text-clinical-600" aria-hidden="true" />
            <h2 className="font-heading text-xl font-bold text-navy-800">Faculty</h2>
            <p className="mt-2 text-sm text-navy-600">Review verified profiles and instructor information.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
