# Clinova content inventory

This document summarizes the source at baseline `c60569d`. It is not evidence that the academy’s courses or services are operational.

## Review and publication status

The academy owner reports that clinical review is complete, but the exact reviewed version, reviewer identity, review date, and record-level coverage are not verified in the available evidence. The source identity list is in [CLINOVA-CLINICAL-REVIEW-INVENTORY.md](CLINOVA-CLINICAL-REVIEW-INVENTORY.md); that generated register is not proof that every exact content version was reviewed.

The source currently marks eight programme records and sixteen CPD records as `published`; fifteen article records receive `status: 'published'` in `src/data/educationalArticles.ts`. These are source publication flags, not evidence of clinical review, editorial approval, or final release approval. No publication flag was changed during this local review.

## What the site contains

| Surface | Routes | Implemented content and status |
|---|---|---|
| Home and About | `/`, `/about` | Proposed educational principles, learning-resource navigation, and a clear account of unavailable learner services. No invented history, faculty, accreditation, achievements, or outcomes. |
| Subject areas | `/departments`, `/departments/:slug` | Ten proposed subject groupings, not established academic departments. Each page includes overview, topic list, scope caution, FAQs, and a general link to the shared learning library; resources are not represented as a department-specific curriculum. |
| Programme catalogue | `/programmes`, `/programmes/:slug`; `/courses` aliases | Eight source records. All currently have `publicationStatus: 'published'` and `status: 'Published'`; this is not clinical sign-off. Enrolment, fees, duration, delivery, assessment, recognised CPD hours, and certificates are not promised; CPD hours are null. Unsupported duration/delivery filters are disabled. |
| Programme detail content | `/programmes/:slug`; `/courses/:slug` aliases | Eight programme detail records with source-linked curriculum content. Availability and qualification terms are not confirmed. See the record-identity inventory for IDs, exact titles, routes, and source flags; exact reviewed-version coverage remains unverified. |
| CPD course catalogue | `/cpd-courses`, `/cpd-courses/:slug` | Sixteen source records, all currently marked `publicationStatus: 'published'`. They are not evidence of available bookings or accredited CPD; hours are null and assessment, delivery, and recognition are not confirmed. CPD-hour filtering is disabled. |
| Article library | `/resources`, `/resources/:slug`; `/blog` aliases | Fifteen substantial educational articles in three JSON files. Source code assigns `status: 'published'`; this is not version-specific clinical or editorial approval. Pages include search, topic filtering, full sections, takeaways, references, and scope cautions. No fabricated bylines or publication dates. |
| Study tools | `/learning-resources`, `/learning-resources/:slug` | Six reading-based resources with prompts, sources, and related reading. No fake downloads, patient-data collection, or saved completion. |
| Online learning | `/online-learning` | Illustrative resource-navigation page. Live teaching, enrolment, assessment, progress, and certificates are not represented as operational services. |
| Contact | `/contact` | Owner-confirmed public address: **1 Unity St, Bristol BS1 5HH, United Kingdom**. Phone, email, hours, and visiting arrangements remain unconfirmed; contact submission is disabled. |
| Partners | `/training-partners` | Proposal and enquiry guidance without promises of an agreement, delivery, certificates, or commercial outcomes. Submission remains disabled in preview configuration. |
| Admissions/application | `/admissions`, `/apply`, `/application` | Preview guidance only. No approved admissions contract, online application submission, or persistence. |
| Verification | `/verify` | Honest unavailable state; no invented certificate records, identifiers, or verification results. |
| Auth/student/admin | Auth routes, `/student/*`, `/admin/*` | Default-off auth and guarded routes. No trusted learner, enrolment, progress, assessment, certificate, or administrative data service exists. |
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

The existing enquiry migration defines contact, partnership, and newsletter insert-only tables. It is not a student schema or an operational administration/delivery service. Prior reported insert/read-denial testing is not reclassified as full production verification. A separate CMS-only migration was subsequently applied to Clinova production; the current local frontend work made no additional database change.

Before enabling any workflow, confirm academy/project ownership, abuse and rate controls, privacy/retention, API/browser persistence, staff access, operational delivery, and error/duplicate behaviour. Auth additionally needs reviewed redirect/recovery configuration and live callback/email tests. Student features require a separately reviewed backend contract and authorization—not guessed tables or frontend-only access checks. The separate review-only learner-schema proposal is not integrated or applied here. Learner deletion/retention policy remains an owner decision.

## Outstanding work requiring review or owner inputs

- Reconcile exact clinical-review coverage against each content hash, reviewer identity, and date; track editorial review and final release approval separately. See the [evidence-gap report](CLINICAL-REVIEW-EVIDENCE-GAPS.md) and [record inventory](CLINOVA-CLINICAL-REVIEW-INVENTORY.md).
- Any future assessment/completion content and actual learning media; reading and reflection are not submitted, saved, or counted as CPD completion.
- Verified faculty, partners, fees, intakes, eligibility, recognition, and certificate policy, if those services are to be offered.
- Reviewed student/admin APIs, authorization/RLS, persistence, assessment and issuance contracts, privacy/legal terms, and operational ownership.
- Comprehensive assistive-technology, performance, and real-device QA beyond automated and local-browser checks.
- Domain purchase/DNS/custom-domain aliases, canonical origin, `VITE_SITE_URL`, and domain-dependent SEO/publication remain deliberately untouched.

No further production database write or migration, merge, production deployment, domain/DNS/Vercel change, paid service, or change to PainFix is part of this local work. Curriculum pages are loaded on demand; the homepage does not eagerly load the lesson corpus.

## CMS production schema and local integration status (30 October 2026)

The owner-approved CMS migration was applied once to production project `ssxpmcbqfdggfsoqbxac`; its ledger entry is `20261029192938` / `clinova_content_management_20261030`. It created the five empty content, version, review-decision, source-provenance and audit tables, workflow functions/triggers, RLS, and the `published_content` view. Read-only schema inspection confirms **zero CMS rows**. No source records were imported, no content was published, and no learner, certificate, enquiry, Auth, storage or settings schema was changed by that CMS migration.

The local frontend now has a `VITE_CMS_ENABLED=false`-by-default integration. When explicitly enabled for the known Clinova Supabase project, public pages read only `published_content`; the existing repository library remains visible as fallback and supplementary content can use a dedicated detail route. The Admin Content panel has local draft/review RPC wiring guarded by exact `app_metadata.clinova_roles` claims. The existing app role claim is not mapped to CMS roles, and application Auth remains disabled; therefore the CMS interface is denied/off unless those independent gates are satisfied. This code is **local only**: it has not been deployed, and a production database schema existing does not mean the live frontend is using it.

Live Supabase advisors reported 7 authenticated `SECURITY DEFINER` RPC warnings, 7 unindexed foreign keys, 5 unused indexes on the new empty tables, and 2 overlapping authenticated SELECT-policy warnings. The seven RPC bodies were inspected read-only and contain `auth.uid()` plus role-specific `has_clinova_role(...)` checks; this is a useful server-side control, not a reason to ignore least-privilege warnings. Index and policy findings are performance notices; their impact should be reassessed after approved non-production workload tests. No advisory was remediated in production. See [Supabase implementation status](SUPABASE-IMPLEMENTATION-STATUS.md) for the functions, advisory links, and remaining gates.
