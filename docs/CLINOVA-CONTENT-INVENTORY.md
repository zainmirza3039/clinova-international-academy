# Clinova content inventory

This document preserves a historical content snapshot at baseline `c60569d`; it is not evidence that the academy’s courses or services are operational.

> **Current implementation status:** All 8 programme and 16 CPD source records remain draft-only. The public CPD directory shows only the twelve title labels from the owner-supplied Clinova topic list as proposal-only cards and detail statuses; it does not show course content, terms or an enrollment offer. Four additional CPD source rows remain undisplayed. Programme titles remain hidden while conflicting owner-provided lists and exact-version review coverage are reconciled. Authentication, learner persistence, enquiries, CMS queries/actions, assessment, certification, credential issuance and public verification remain disabled in source. See the [master development specification](CLINOVA-MASTER-DEVELOPMENT-SPECIFICATION.md) and [current record inventory](CLINOVA-CLINICAL-REVIEW-INVENTORY.md).

## Review and publication status

The academy owner reports that clinical review is complete, but the exact reviewed version, reviewer identity, review date, and record-level coverage are not verified in the available evidence. The source identity list is in [CLINOVA-CLINICAL-REVIEW-INVENTORY.md](CLINOVA-CLINICAL-REVIEW-INVENTORY.md); that generated register is not proof that every exact content version was reviewed.

At baseline `c60569d`, eight programme records and sixteen CPD records were marked `published`; this feature branch changed those course flags to draft-only and withholds their detail content. Fifteen article records still receive `status: 'published'` in `src/data/educationalArticles.ts`. No source publication flag is evidence of clinical review, editorial approval, or final release approval.

## What the site contains

| Surface | Routes | Implemented content and status |
|---|---|---|
| Home and About | `/`, `/about` | Proposed educational principles, learning-resource navigation, and a clear account of unavailable learner services. No invented history, faculty, accreditation, achievements, or outcomes. |
| Subject areas | `/departments`, `/departments/:slug` | Ten proposed subject groupings, not established academic departments. Detail pages show proposed learning-area labels and owner-listed CPD topic titles under clearly provisional subject groupings; neither is presented as an approved curriculum or current offer. |
| Programme catalogue | `/programmes`, `/programmes/:slug`; legacy `/courses` aliases | At baseline there were eight source records with published flags. The current branch marks them draft-only; public pages show status only and do not reveal titles, curricula, enrollment or course detail. |
| Programme detail content | `/programmes/:slug`; legacy `/courses/:slug` aliases | The baseline contained eight curriculum records. Current public detail routes provide a review-status message and no curriculum content. Qualification terms and exact reviewed-version coverage remain unverified. |
| CPD topic directory | `/cpd-courses`, `/cpd-courses/:slug` | At baseline there were sixteen source records with published flags; all remain draft-only. Public browsing is explicitly allowlisted to the twelve title labels in the owner-supplied topic inventory; cards and details show a title and provisional subject grouping only. The four extra source rows, course details, hours, assessment, delivery, recognition, booking and enrollment remain unavailable. |
| Article library | `/resources`, `/resources/:slug`; `/blog` aliases | Fifteen substantial educational articles in three JSON files. Source code assigns `status: 'published'`; this is not version-specific clinical or editorial approval. Pages include search, topic filtering, full sections, takeaways, references, and scope cautions. No fabricated bylines or publication dates. |
| Study tools | `/learning-resources`, `/learning-resources/:slug` | Six reading-based resources with prompts, sources, and related reading. No fake downloads, patient-data collection, or saved completion. |
| Online learning | `/online-learning` | Legacy route redirects to CPD system status. No live teaching, enrolment, assessment, progress, or certificate service is represented as operational. |
| Contact | `/contact` | Owner-confirmed public address: **1 Unity St, Bristol BS1 5HH, United Kingdom**. Phone, email, hours, and visiting arrangements remain unconfirmed; contact submission is disabled. |
| Partners | `/training-partners` | Proposal and enquiry guidance without promises of an agreement, delivery, certificates, or commercial outcomes. Submission remains disabled in preview configuration. |
| Admissions/application | `/admissions`, `/apply`, `/application` | Status and guidance only. No approved intake, online application submission, or persistence; no application data is collected. |
| Verification | `/verify` | Honest unavailable state; no invented certificate records, identifiers, or verification results. |
| Auth/student/admin | Auth routes, `/student/*`, `/admin/*` | Auth is source-disabled; login routes show an unavailable status. Learner and admin record operations remain gated, and no new private learner, application, assessment or credential query is made. |
| Community | `/events`, `/faculty`, `/community` | No-confirmed-record states rather than fabricated people, events, or attendance. |
| FAQs/testimonials | `/faqs`, shared FAQ data | General proposed/unconfirmed guidance; testimonials remain empty. |
| Legal | Privacy, terms, cookies, and refund routes | Draft policy documents, not reviewed legal commitments. Operator/controller, processing arrangements, and commercial terms require owner/legal confirmation. |
| Fallback | Unknown routes | Real not-found states and recovery links; no fabricated record or success state. |

## Proposed subject groupings

Physical Therapy & Rehabilitation; Nursing & Allied Health; Medicine; Dentistry; Pharmacy; Psychology & Mental Health; Nutrition & Dietetics; Sports & Exercise; Occupational Therapy; Healthcare Management. These are navigation categories, not evidence of active departments or regulated training.

## Record-level identity and review evidence

The version-controlled [clinical-review identity inventory](CLINOVA-CLINICAL-REVIEW-INVENTORY.md) contains all 39 source records: eight programmes, sixteen CPD courses, and fifteen articles. It records stable IDs, exact source titles, canonical routes, source files, effective-record hashes, publication flags, and evidence gaps. The separate [clinical-review evidence-gap report](CLINICAL-REVIEW-EVIDENCE-GAPS.md) summarizes the missing exact-hash sign-off, reviewer/date, editorial-review, and release-approval evidence and provides a sign-off template. Neither document establishes that any exact version was reviewed; do not infer approval from source publication flags.

Programme titles containing “Certificate” or “Diploma” identify catalogue labels only. No recognised qualification, accreditation, awarding right, certificate issuance, or employment outcome is asserted. CPD labels likewise do not establish awarded hours or formal recognition.

## Existing backend and safety gates

The existing enquiry migration defines contact, partnership, and newsletter insert-only tables. It is not a student schema or an operational administration/delivery service. Prior reported insert/read-denial testing is not reclassified as full production verification. A separate CMS-only migration was previously reported as applied to Clinova production; this branch makes no database change and disables CMS queries/actions in source pending separate server-side authorization review.

Before enabling any workflow, confirm academy/project ownership, abuse and rate controls, privacy/retention, API/browser persistence, staff access, operational delivery, and error/duplicate behaviour. Auth additionally needs reviewed redirect/recovery configuration and live callback/email tests. Student features require a separately reviewed backend contract and authorization—not guessed tables or frontend-only access checks. The separate review-only learner-schema proposal is not integrated or applied here. Learner deletion/retention policy remains an owner decision.

## Outstanding work requiring review or owner inputs

- Reconcile exact clinical-review coverage against each content hash, reviewer identity, and date; track editorial review and final release approval separately. See the [evidence-gap report](CLINICAL-REVIEW-EVIDENCE-GAPS.md) and [record inventory](CLINOVA-CLINICAL-REVIEW-INVENTORY.md).
- Any future assessment/completion content and actual learning media; reading and reflection are not submitted, saved, or counted as CPD completion.
- Verified faculty, partners, fees, intakes, eligibility, recognition, and certificate policy, if those services are to be offered.
- Reviewed student/admin APIs, authorization/RLS, persistence, assessment and issuance contracts, privacy/legal terms, and operational ownership.
- Comprehensive assistive-technology, performance, and real-device QA beyond automated and local-browser checks.
- Domain purchase/DNS/custom-domain aliases, canonical origin, `VITE_SITE_URL`, and domain-dependent SEO/publication remain deliberately untouched.

The no-merge/no-deployment statement in the earlier baseline report described that review only; the release state of this feature branch is tracked separately. The baseline curriculum-loading note likewise describes the earlier implementation.

## CMS production schema and local integration status (30 October 2026)

The owner-approved CMS migration was applied once to production project `ssxpmcbqfdggfsoqbxac`; its ledger entry is `20261029192938` / `clinova_content_management_20261030`. It created the five empty content, version, review-decision, source-provenance and audit tables, workflow functions/triggers, RLS, and the `published_content` view. Read-only schema inspection confirms **zero CMS rows**. No source records were imported, no content was published, and no learner, certificate, enquiry, Auth, storage or settings schema was changed by that CMS migration.

The earlier CMS integration was designed as opt-in for the known Clinova Supabase project. This feature branch adds an unconditional source-level gate: no public CMS query, private workflow read, or CMS RPC action runs, even if `VITE_CMS_ENABLED` is true. The admin panel explains the inactive state. A production database schema existing does not mean the live frontend is using it or that its permissions have been validated.

Live Supabase advisors reported 7 authenticated `SECURITY DEFINER` RPC warnings, 7 unindexed foreign keys, 5 unused indexes on the new empty tables, and 2 overlapping authenticated SELECT-policy warnings. The seven RPC bodies were inspected read-only and contain `auth.uid()` plus role-specific `has_clinova_role(...)` checks; this is a useful server-side control, not a reason to ignore least-privilege warnings. Index and policy findings are performance notices; their impact should be reassessed after approved non-production workload tests. No advisory was remediated in production. See [Supabase implementation status](SUPABASE-IMPLEMENTATION-STATUS.md) for the functions, advisory links, and remaining gates.
