import { ExternalLink, ShieldAlert } from 'lucide-react';
import { certificationDevelopmentAreas } from '@/data/certificationDrafts';

const controls = [
  { title: 'Organisational governance', detail: 'Structure, responsibilities, confidentiality and controlled decision authority.' },
  { title: 'Impartiality and conflicts', detail: 'Declarations, independent review, recusals and documented safeguards.' },
  { title: 'Scheme development', detail: 'Scheme scope, competence requirements, eligibility, maintenance and renewal evidence.' },
  { title: 'Assessment and examination integrity', detail: 'Assessment design, assessor competence, security, moderation, marking and appeals.' },
  { title: 'Certification decision separation', detail: 'Assessors submit evidence; authorised decision personnel independently review and record outcomes.' },
  { title: 'Quality management', detail: 'Controlled documents, internal audit, corrective action and management review.' },
  { title: 'Digital records and privacy', detail: 'Candidate access, least privilege, retention, security and immutable audit evidence.' },
  { title: 'Certificate lifecycle', detail: 'Issuance, scope, validity, renewal, suspension, withdrawal and public verification.' },
];

export default function AccreditationPreparationPanel() {
  return <section className="mt-8 space-y-6" aria-labelledby="accreditation-preparation-title">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">Internal development only</p>
      <h2 id="accreditation-preparation-title" className="mt-2 font-heading text-2xl font-bold text-navy-900">Accreditation preparation</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-600">This workspace is a readiness-development outline, not an assessment result, conformity statement, application status, or accreditation award. No accreditation claim or symbol is authorised by this panel.</p>
    </header>

    <div className="border border-amber-300 bg-amber-50 p-5" role="note">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-navy-900">Current standard and transition basis</h3>
          <p className="mt-2 text-sm leading-relaxed text-navy-700">ISO lists ISO/IEC 17024:2026 (Edition 3, published 31 March 2026) as the current edition and ISO/IEC 17024:2012 as withdrawn. UKAS states that organisations considering an application should develop systems for the 2026 edition. This preparation work does not establish conformity.</p>
          <p className="mt-2 text-sm leading-relaxed text-navy-700">UKAS says it will be ready to assess to the 2026 edition from 1 January 2027; the 2027 transition period is optional for existing accredited bodies, all assessments move to the 2026 edition from 1 January 2028, and 2012 accreditations cease to be valid after 31 March 2029.</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            <li><a className="inline-flex items-center gap-1 text-clinical-700 underline underline-offset-4" href="https://www.iso.org/standard/17024" target="_blank" rel="noreferrer">ISO/IEC 17024:2026 <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></li>
            <li><a className="inline-flex items-center gap-1 text-clinical-700 underline underline-offset-4" href="https://www.iso.org/standard/52993.html" target="_blank" rel="noreferrer">ISO/IEC 17024:2012 status <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></li>
            <li><a className="inline-flex items-center gap-1 text-clinical-700 underline underline-offset-4" href="https://www.ukas.com/resources/technical-bulletins/transition-arrangements-for-iso-iec-170242026-conformity-assessment-general-requirements-for-bodies-operating-certification-of-persons/" target="_blank" rel="noreferrer">UKAS transition bulletin <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></li>
          </ul>
        </div>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {controls.map((control) => <article key={control.title} className="rounded-xl border border-navy-100 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-navy-900">{control.title}</h3>
          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Draft</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">{control.detail}</p>
        <p className="mt-3 text-xs text-navy-500">Evidence and owner approval not recorded in this workspace.</p>
      </article>)}
    </div>

    <details className="rounded-xl border border-navy-200 bg-surface-50 p-5">
      <summary className="cursor-pointer font-semibold text-navy-900">Internal development work areas</summary>
      <p className="mt-2 text-sm text-navy-600">These topics are a work plan, not requirements copied from the copyrighted standard or proof that any requirement is met.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{certificationDevelopmentAreas.map((area) => <li key={area.id} className="rounded-lg border border-navy-100 bg-white p-4"><h4 className="text-sm font-semibold text-navy-900">{area.title}</h4><p className="mt-1 text-xs leading-relaxed text-navy-600">{area.detail}</p></li>)}</ul>
    </details>

    <p className="rounded-lg border border-navy-200 bg-white p-4 text-sm leading-relaxed text-navy-700">The supplied catalogue-reference document does not establish an approved Clinova certification scheme, accreditation result or preliminary assessment finding. None is recorded in this workspace. Store any future restricted assessment evidence only after its provenance, authorization and access policy are approved.</p>
  </section>;
}
