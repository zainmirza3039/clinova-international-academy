# Clinova Healthcare Education and Professional Certification Platform

**Document status: owner-supplied development scope translated into a local planning specification.** It is not a launch approval, clinical approval, accreditation statement, candidate rulebook, or authorization to change hosted services. The live application remains fail-closed for unapproved workflows. No production Supabase schema, data, Auth, roles, storage, or permissions and no Vercel settings or environment were changed for this specification.

## 1. Product structure

Clinova is to be designed as three related but independently governed systems:

1. **CPD education** — course discovery, enrollment, learning activities, course-level assessment where approved, learning history and CPD completion credentials.
2. **Professional competency certification** — scheme-specific eligibility and independent competence assessment, followed by an independently recorded certification decision and, only if authorized, a distinct professional competency credential.
3. **Shared institutional, public-information and administrative services** — public website, login, institutional collaboration, quality management, governance, reporting and audit.

The CPD and professional certification systems may share identity infrastructure only after authorization and security review. Their records, permissions, eligibility rules, assessments, decisions, audit events and credential types must remain distinct. Purchasing or completing a CPD course cannot by itself lead to a professional competency certification credential.

Neither credential type implies statutory professional registration, a licence to practise, UKAS accreditation, or any other recognition unless that exact recognition has actually been awarded by the relevant authority.

## 2. Public navigation and pages

The public navigation should provide these destinations, with current status stated plainly:

| Destination | Purpose | Safe current state |
| --- | --- | --- |
| Home | Academy identity, services, programmes and clear next steps | Public information; no unverified service claims |
| About | Mission, vision, leadership, governance and organisation | Publish only owner-verified facts |
| CPD Courses | Course catalogue, search and filters | Catalogue development; no course may be represented as open without approved course data |
| Professional Certification | Scheme overview, scope, eligibility and application status | Proposal-only; no scheme currently open |
| Assessment | Candidate guidance for written, case-based and practical assessment | Development status only; no exam, OSCE or schedule is operational |
| For Institutions | Institutional CPD and training collaboration | Discussion information only; no unverified partner or agreement claims |
| Resources | Healthcare articles, educational resources and announcements | Source-linked content subject to review; no clinical approval implied |
| Verify Certificate | Type-specific verification for CPD and professional credentials | No live lookup; format checks do not verify issuance or status |
| Contact | Public contact details and enquiry information | Forms must clearly disclose whether submission is active; no unsupported claims |
| Login / Register | Account access | Auth remains off until hosted prerequisites and approved permissions exist |

Certification scheme subpages may use `/certification/physiotherapy`, `/certification/medicine` and `/certification/nursing`. The first proposed development scheme is **Musculoskeletal Physiotherapy Assessment & Clinical Competence**. These are planning labels only; no competency standard, eligibility criteria, assessment thresholds, fees, dates, validity or application status is approved.

The `/assessment` page should explain future assessment components without presenting a timetable, exam, OSCE station, rubric, result or candidate requirement as live. The public quality-assurance page may publish only approved policies; internal controlled documents must remain restricted.

## 3. CPD Education System

### 3.1 Course catalogue and detail

The future CPD catalogue should support categories, search and filters. Each course detail record needs authoritative course title, scope, objectives, syllabus, CPD hours (if approved), faculty/instructor identity and credentials (if approved), delivery terms, assessment rules, fees and enrolment status. Missing fields must remain absent or explicitly pending; never fill them with invented values. Old self-directed course material is not to be presented as a self-study course offer.

Until each course is reviewed and approved, the public site should say that enrollment is unavailable and should not treat repository publication metadata as clinical/editorial sign-off. Do not surface unreviewed learning outcomes, CPD hours, instructors, fees or completion conditions as fact.

### 3.2 Enrollment and learning service

A future course flow may include an application/enrollment and payment integration, a learner dashboard, course player for authorized video/text/PDF materials, course-specific quizzes or examination, completion evidence, CPD history, and a CPD completion credential. None is enabled here. Payment, storage, course content, assessment logic and learner records require separate approved hosted designs and security tests.

Course assessments and CPD completion rules must be stated for the individual course before enrollment. A CPD certificate confirms participation or completion under those stated rules only; it is not a professional competence award or statutory registration.

## 4. Professional competency certification system

Certification is independent from ordinary education and CPD completion. The future workflow is:

1. Candidate registration and identity/qualification evidence under an approved privacy and retention policy.
2. Eligibility review against a versioned, approved scheme; reviewers record an evidence reference and outcome.
3. Scheme-specific assessment, possibly written examination, clinical case assessment, practical OSCE and/or portfolio where approved.
4. Assessor submits evidence and a result under the approved rubric. The assessor cannot issue a certificate or decide the same case.
5. Conflict-of-interest declarations and review by an independent impartiality role; unresolved conflict or recusal blocks progression.
6. A separately authorized certification decision-maker independently reviews eligibility, scheme, evidence, assessment result, impartiality and decision policy and records a reasoned decision.
7. Credential issuance, if allowed, occurs in a separate controlled step after the decision and approved issuer/policy check. No purchase or course completion triggers it.
8. Renewal/surveillance, complaints/appeals, suspension, withdrawal and verification follow a published, approved policy.

No competencies, pass marks, eligibility thresholds, exam blueprints, OSCE rubrics, recertification periods or validity dates are supplied in the approved source data. They must be developed and reviewed for each scheme; the application, examination and certificate paths remain unavailable until then.

## 5. Candidate, assessor and faculty portals

### Candidate dashboard

The intended dashboard may show profile and qualification records; CPD enrollment, progress and learning history; CPD credentials; certification application and eligibility status; examination schedules and results; assessment feedback; downloadable credentials; renewal reminders and settings. The CPD and certification panels must be visually and logically separate. No candidate information is currently collected or displayed by these pages.

### Assessor/examiner dashboard

The future restricted assessor workspace may show assigned candidates and exam schedules, versioned rubrics and competency checklists, OSCE scoring, written assessment marking, authorized evidence uploads/comments, conflict declarations, submission/moderation status and audit trail. An assessor cannot decide or issue the professional credential for the same candidate. No candidate/evidence data is queried in this build.

### Faculty dashboard

A faculty area is separate from certification assessor permissions. Faculty/course authorship must not imply assessor, eligibility reviewer or certification-decision authority. Instructor profiles and qualifications require owner verification. The current faculty/instructor route remains informational/unavailable.

## 6. Admin, governance and quality dashboard

The eventual operational control centre is divided into capability areas, each with dedicated least-privilege roles and server-side authorization:

| Module | Intended capability | Current boundary |
| --- | --- | --- |
| User management | Candidate, faculty, assessor and staff accounts | No role assignment or private-record access from this build |
| Course CMS | Author, review, publish, archive CPD courses | CMS queries and actions are source-disabled; no private workflow reads or live publication approval |
| Certification CMS | Manage versioned schemes, scope and standards | Draft proposals only; no scheme activation function |
| Examination management | Question banks, exam scheduling and marking | No items, results or live exams |
| Certification panel | Review recommendations and record independent decisions | Local gate model only; no production decisions |
| Credential management | Separate CPD and professional credential lifecycle | No issuance, renewal, revocation or public lookup |
| Finance | Payments, invoices and refunds | No payment integration or records |
| Partnerships | Institutional records and agreements | No partner records or contract claims |
| Governance | Policies, conflicts, complaints and appeals | Public policies remain placeholders until approved; private records absent |
| QMS | Controlled documents, audits and corrective action | Internal workflow proposal only; no QMS records |
| Reporting | Enrollment and outcomes | No metrics fabricated; no private-record query |
| Audit logs | Who did what and when | Immutable audit model proposed; no hosted log store |

Admin and CMS access must use server-managed claims, not browser-editable profile data. Each module checks its own role; a global admin claim must not silently confer assessor, eligibility reviewer, impartiality officer or certification-decision authority. QMS manuals, SOPs, audit reports, CAPA records, assessor competence records, management reviews and scheme-validation evidence are confidential controlled records and must not appear on public pages.

## 7. Credential types and verification

Two non-interchangeable credential types are required:

- **CPD completion certificate** — relates to a named educational activity and its approved completion/assessment rules.
- **Professional competency certification credential** — relates to an approved scheme and an independently recorded certification decision after eligibility and competence assessment.

They require separate record types, issuance authorities, policy versions, audit trails, identifiers and status lifecycles. No type should be represented as professional registration or UKAS accreditation. The public verification page must identify which type is being checked and disclose the lookup result truthfully. In this release it performs no server request, saves nothing, and cannot show valid/expired/suspended/withdrawn status.

## 8. Proposed architecture and permission boundaries

The conceptual architecture is a Clinova web application with public pages and separately gated portals, connected in a later approved phase to modular Supabase services for CPD/LMS, certification, examinations, candidate records, CMS, QMS/governance, payments and verification.

A future database design should use separate schemas/tables for CPD course/enrollment/progress/assessment/completion/CPD credential and certification scheme/candidate eligibility/assessment/COI review/decision/professional credential/status history. Shared identity references may be UUIDs, but should not collapse authorization or credential records. Public verification should be a narrowly scoped server function returning only approved minimum fields, with opaque high-entropy lookup tokens, rate limits, privacy controls and audit/abuse monitoring. No raw token or evidence should be logged.

Required controls before hosted activation:

- Server-side authorization for every read/write; browser checks are only a usability layer.
- Role claims granted only by trusted administrators; never derive access from user metadata, public registration, query parameters or client-supplied role names.
- Row-level security and narrow RPC/Edge Function grants; no broad authenticated table writes.
- Fixed search paths, hardened `SECURITY DEFINER` functions, minimal returned fields and explicit denial tests.
- Immutable append-only decision/audit events with actor, time, policy/scheme version, evidence reference/hash and recorded reason.
- Concurrency/idempotency controls for decisions and credential issuance; issuance must recheck the authoritative decision atomically.
- Independent assessor/decision-maker/impartiality separation, candidate self-assessment denial and conflict/recusal handling.
- Retention, appeals, renewal, suspension and withdrawal policies; privacy, accessibility, security, backup and incident response review.
- No production migration, schema, data, role, permission, Auth, storage or environment change without a separate approved deployment plan.

Any local SQL proposal lives outside the migrations directory and may be exercised only in a disposable local database. It is not a production-ready migration.

## 9. Suggested role groups

Role labels below are a design, not provisioned roles:

| Role group | Scope | Must not automatically receive |
| --- | --- | --- |
| Public visitor | Public approved pages and public verification status | Candidate, staff or private data |
| CPD learner | Own enrollment, course progress, CPD history and CPD credentials | Assessor, certification decision or admin rights |
| CPD course author/reviewer/publisher | Separate draft/review/publish steps for course content | Candidate records or certification authority |
| Faculty | Assigned educational activity and approved course materials | Certification decision or QMS access by default |
| Certification candidate | Own certification application, eligibility and results | Other candidate data, assessor or decision role |
| Certification assessor/examiner | Assigned evidence and assessment submission | Same-case decision or credential issuance |
| Eligibility reviewer | Scheme-based eligibility evidence and outcome | Assessment or certification decision by default |
| Impartiality officer | Conflict declarations, independent review and recusal | Candidate, assessor or decision-making for the same case |
| Certification decision-maker | Independent decision on an assigned complete case | Same-case assessment, direct credential issuance or public disclosure |
| Credential issuer | Separate controlled issue/reissue/revoke operation | Decision authority unless separately justified and approved |
| QMS/auditor | Controlled quality records within assignment | Candidate/assessment changes by default |
| Administrator | Only explicitly assigned operational modules | All domain roles by virtue of a generic admin role |

## 10. API and lifecycle design (future, not connected)

Potential API boundaries are separate by domain: course catalogue/detail; enrollment; learner progress; course assessment; CPD completion and CPD credential; certification application; eligibility review; assessor assignment/submission; impartiality declaration/review; pending certification decision; independent decision record; credential issue/status lifecycle; narrow public verification; QMS document/audit/CAPA workflows; and administrator reporting.

Every endpoint needs a written contract, authorization matrix, schemas, idempotency/transaction rules, audit fields and negative tests before implementation. Certification decision submission must not call the CPD credential issuer. CPD completion must not create or imply a professional competency credential. Public verification is read-only and separate from issuance/revocation.

## 11. Development sequence and gates

Recommended staged implementation:

1. Public identity and approved public information.
2. Auth, account lifecycle, server-managed roles and denial tests.
3. CPD catalogue and approved course data; then separately approved enrollment/LMS and CPD completion rules.
4. Certification scheme design, candidate application and privacy policy.
5. Assessment/OSCE/examiner design and tested records.
6. Independent certification decision model and audit trail.
7. Separate credential issuance and public verification policy.
8. Governance/QMS controls, audit, complaints/appeals and lifecycle.
9. Payments, institutional delivery and reporting only when agreements and controls exist.

A phase is not live merely because a route, feature flag, TypeScript type, SQL proposal, mock or test exists. Each hosted activation needs evidence, owner/policy approval, authorized environment, security and accessibility tests, operational monitoring and a rollback plan. In this task all new workflows remain disabled.

## 12. Current implementation boundary and references

The local build adds draft pathway and credential models, public status pages, role-gated shells and a certification-decision guard. Local disposable database tests may validate the proposed authorization contract. No hosted Supabase or Vercel settings are changed. CPD and certification pages must not render unverified course offers, assessments, candidates, results, credentials or accreditation claims.

ISO/IEC 17024:2026 is the current edition listed by ISO (published 31 March 2026); ISO/IEC 17024:2012 was withdrawn on 31 March 2026. UKAS describes the transition to 2026, including new applications from 1 January 2027, mandatory use for assessments from 1 January 2028, and expiry of 2012 accreditation after 31 March 2029. These are external transition facts, not Clinova compliance or accreditation status. Do not reproduce copyrighted standard clauses.

- [ISO/IEC 17024:2026](https://www.iso.org/standard/17024)
- [ISO record: ISO/IEC 17024:2012](https://www.iso.org/standard/52993.html)
- [UKAS transition bulletin](https://www.ukas.com/resources/technical-bulletins/transition-arrangements-for-iso-iec-170242026-conformity-assessment-general-requirements-for-bodies-operating-certification-of-persons/)
- [UKAS certification-body accreditation](https://www.ukas.com/accreditation/standards/certification-body-accreditation/)

The internal accreditation reference number and preliminary-assessment status were absent from both supplied attachments and the fresh repository. Keep those values private and blank until the owner supplies the exact information and an approved restricted system is available.
