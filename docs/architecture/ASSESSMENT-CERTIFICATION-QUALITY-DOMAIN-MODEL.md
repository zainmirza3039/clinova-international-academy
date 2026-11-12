# Clinova — Assessment, Professional Certification and Quality Domains

**Status:** Source-only schema foundation committed on the Clinova feature branch.  
**Production:** Not applied.  
**Data:** No assessment items, answer keys, certification schemes, credentials, audits or quality records have been seeded.

## 1. CPD assessment and examination

The CPD assessment domain is attached to existing `public.content_items` and `public.course_enrollments`:
- `assessment_definitions` versions assessment configuration by course content item.
- `assessment_items` and `assessment_options` hold questions, options and private answer keys.
- `assessment_attempts` identify the learner, course enrolment and numbered attempt.
- `assessment_responses` capture submitted responses.
- `assessment_marks` capture item-level marking.
- `assessment_results` hold calculated outcomes and release state.
- `assessment_moderation` records independent moderation.
- `completion_decisions` determine CPD course completion independently of a raw test score.
- `assessment_events` record lifecycle changes.

The migration keeps answer keys in the private schema with no direct API table grants. The command layer must verify that:
- the learner owns the referenced course enrolment;
- each item belongs to the attempt's assessment definition;
- the attempt count is within the definition limit;
- submission is idempotent and cannot alter submitted responses;
- marking cannot exceed item maximum marks;
- total available marks and pass criteria match the exact definition version;
- marker and moderator separation is enforced;
- results are not released before required moderation;
- completion decisions are based on the approved completion rules.

## 2. Professional competency certification

This domain is deliberately separate from CPD:
- `certification_schemes` and `certification_scheme_versions` control scheme lifecycle.
- `certification_scheme_units` and `certification_criteria` define versioned competency requirements.
- `certification_applications` identify candidates against a scheme version.
- `certification_evidence` stores private evidence object keys.
- `eligibility_reviews` record eligibility decisions.
- `certification_assessor_assignments` allocate assessors to a candidate case.
- `competency_assessments` and `competency_observations` record unit and criterion outcomes.
- `impartiality_reviews` record conflict review and mitigation.
- `certification_decisions` record independent certification outcomes.
- `professional_credentials` hold professional credential identifiers and status.
- `certification_appeals` and `certification_events` support appeals and lifecycle evidence.

A professional credential must never be represented as a CPD attendance/completion certificate. A certification decision requires a versioned scheme, documented eligibility, sufficient competency evidence and an impartiality check. The command layer must prevent the assessor for a case from making the final decision on that same case and must prevent conflicted decision-makers from proceeding.

No UKAS accreditation or open candidate scheme is implied by these database structures. A scheme remains a draft until its approval and governance status are independently established.

## 3. Quality management and operational reporting

The quality domain includes:
- controlled documents and immutable document versions;
- internal audit plans and findings;
- corrective actions;
- complaints and appeals;
- risk register;
- staff competency records;
- operational report snapshots;
- append-only quality events.

Controlled document versions, audit findings and report snapshots are immutable evidence. State changes to mutable quality records must be performed through command functions that append a corresponding quality event. Reports must be scoped to authorized operational roles and should use aggregate data where identifiable records are not required.

## 4. Storage and privacy

The migration uses private object keys for certification evidence and quality-controlled documents. It does not create Storage buckets or change existing bucket policies. Required dedicated private buckets:
- `certification-evidence`
- `quality-controlled-documents`

These must be provisioned separately with object policies tied to active case/scheme/quality assignments. Never expose raw object keys or signed URLs in public verification pages.

## 5. Security and validation status

All new relations are in `clinova_private`, RLS-enabled, and have direct privileges revoked from API roles. Narrow server/database commands and public-safe projections are not yet implemented.

Local tests cover schema insertion paths, immutability and absence of direct API table grants. They do not yet prove all workflow authorization or clinical/professional impartiality rules. The test runner includes all migrations and test files, but has not been executed because local PostgreSQL server binaries are unavailable in the current environment.

No production database or Storage change has been made.
