# Clinova assessment and trusted operations schema review

## Status

The learner and assessment schema migrations are committed to `main` but **have not been applied to Supabase**. Assessment attempt start/submission workflows were merged by PR #16; the latest main commit is `bcefc0693673d694ad25fb579b9c0b9886b240fb`, and production deployment `dpl_EqQkmMLGmmsnyf1bmesD3omLqNax` is READY. GitHub Actions run [39923211421](https://github.com/zainmirza3039/clinova-international-academy/actions/runs/39923211421) passed typecheck, all tests, lint, the disposable PostgreSQL schema suite and the forced-off build. A Vercel deployment does not execute SQL migrations. Live project `ssxpmcbqfdggfsoqbxac` currently has only three public enquiry tables; learner, assessment, staff-role and audit tables are absent. Auth, learner data, enquiries and public certificate verification remain forced off. This is not launch approval.

## Added migration

`supabase/migrations/20261023010000_create_assessment_engine.sql` adds the assessment tables and private staff/audit structures. Follow-up migration `20261023020000_harden_assessment_choice_validation.sql` adds strict choice payload validation:

- `learning_assessments`: course-linked assessment configuration, pass threshold, attempt limit and publication status.
- `learning_assessment_questions`: ordered question prompts and choices, with composite keys preventing questions from being attached to another course's assessment; the follow-up migration requires each choice to have a unique non-empty string ID and label, rejects extra fields, and prevents answer-key data being smuggled into choice objects.
- `app_private.assessment_answer_keys`: correct answers and grading explanations outside the exposed public schema.
- `learning_assessment_attempts`: learner-owned attempts and controlled state transitions (in progress, submitted, graded, voided).
- `learning_assessment_responses`: responses constrained to questions belonging to the attempt's assessment.
- `app_private.academy_staff_roles`: trusted server-side role assignments; never exposed to browser roles.
- `app_private.academy_audit_events`: service-only audit events for privileged operations.

The migration creates no users, course content, questions, answers, attempts, staff assignments, grades, or certificates. Browser roles have read-only access to published assessments/questions for enrolled learners, and can read only their own attempts/responses. The two narrowly scoped authenticated RPCs described below are the only learner-facing write path for starting and submitting attempts; direct table writes and all private-schema access remain reserved for the trusted server-side `service_role`. Never put that key in a Vite/browser variable.

## Attempt workflow increment (merged in PR #16)

The follow-up migration `supabase/migrations/20261023030000_add_assessment_attempt_workflows.sql` adds two authenticated, owner-bound RPCs:

- `start_my_assessment_attempt(assessment_id)` locks the assessment while allocating an attempt number, requires a published assessment/course and an active enrolment, and enforces the configured maximum attempt count.
- `submit_my_assessment_attempt(attempt_id, responses)` locks the caller's in-progress attempt, requires exactly one response per question, validates answer shapes and choice IDs, rejects cross-assessment question IDs and duplicate question responses, validates the whole payload before inserting anything, and locks the attempt after submission.

Both functions are `SECURITY DEFINER` with an empty search path, derive the learner identity from `auth.uid()`, accept no caller-supplied owner ID, and revoke execution from `PUBLIC` and `anon`. Submission deliberately does not grade or mark a learner as passed. The private answer keys remain inaccessible to browser roles.

## Important limits

This remains a schema-and-RPC proposal, **not a complete assessment product**. Trusted grading for objective answers, assessor marking for free text, final outcome recording, audit writes, staff authorization, and certificate issuance/revocation remain unimplemented. The owner must also decide whether completed enrolments can start assessments and how to handle questions changed after an attempt starts. Client-side gating is not authorization.

The migration uses restrictive relationships between attempts and enrolments so an account/enrolment cannot silently erase assessment history. This deliberately makes the owner’s deletion/retention/anonymization decision a launch blocker; do not weaken those constraints or turn on Auth/learner data without an approved policy. The base learner migration has been hardened to use `ON DELETE RESTRICT` for Auth-user foreign keys. This blocks account deletion while learner records exist, but the final retention/export/deletion or anonymization workflow still requires owner approval and implementation.

Public certificate verification remains a separate feature. The private award table and `public_certificates` are not automatically synchronized; a trusted issuance/revocation workflow and rate-limited disclosure endpoint with approved privacy wording are still required. No certificates are seeded.

## Verification

The isolated SQL suite now applies the proposal after the learner foundation and includes checks for:
- anonymous assessment read denial;
- enrolled learner access to published assessments/questions;
- owner-only attempt/response reads;
- answer-key isolation from browser roles; and
- rejection of client-created attempts;
- malformed choices (single-item lists, missing/invalid IDs or labels, duplicate IDs and extra keys) rejected by the follow-up constraint.

Run `bash scripts/test-learning-schema.sh` with the documented PostgreSQL 16 binaries; it now applies and tests the assessment attempt workflow migration after the learner/assessment foundation. Then run `npm run typecheck`, `npm run lint`, `npm test`, and a forced-off build. These are local/CI checks only. They do not authorize a hosted migration or prove Supabase Data API behavior. Before a staging migration, also run the Supabase security/performance advisors and verify the actual policies with two separate test accounts.

## Remaining launch work

1. Confirm and document account deletion, award retention and anonymization rules.
2. Reconcile the existing public-enquiry migration with the live schema and migration ledger; do not replay it blindly.
3. Apply the base learning, assessment, choice-validation, and attempt-workflow migrations only in an approved isolated non-production target, then verify table grants/RLS/RPC behavior via PostgREST.
4. Implement server-side enrolment, assessment/marking, content management, certificate issuance/revocation and audit workflows.
5. Configure and test verified sender/SMTP and recovery email; keep secrets server-side.
6. Finalize the academy’s legal/privacy text, enquiry processing and notification/retention workflow.
7. Run authenticated browser tests with two approved accounts before considering feature flags.

Production deployment `dpl_EqQkmMLGmmsnyf1bmesD3omLqNax` for `bcefc0693673d694ad25fb579b9c0b9886b240fb` is READY. No Supabase schema migration/live database write, auth setting, Edge Function, secret, domain or DNS setting was changed. The SQL migrations remain unapplied; feature flags remain off. Production indexing is enabled by the build script, while previews remain non-indexable.
