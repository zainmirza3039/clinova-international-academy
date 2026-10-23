# Clinova assessment and trusted operations schema review

## Status

The learner and assessment schema migrations are committed to `main` but **have not been applied to Supabase**. The latest main commit is `dce71b0d1902c51b9c28617a80a10178e5e65c93`; its Git-triggered Vercel production deployment `dpl_DseLZBgi4h2AVc36VBvjx6qAYeb6` is READY. A Vercel deployment does not execute SQL migrations. Live project `ssxpmcbqfdggfsoqbxac` currently has only three public enquiry tables; learner, assessment, staff-role and audit tables are absent. Auth, learner data, enquiries and public certificate verification remain forced off. This is not launch approval.

## Added migration

`supabase/migrations/20261023010000_create_assessment_engine.sql` adds the assessment tables and private staff/audit structures. Follow-up migration `20261023020000_harden_assessment_choice_validation.sql` adds strict choice payload validation:

- `learning_assessments`: course-linked assessment configuration, pass threshold, attempt limit and publication status.
- `learning_assessment_questions`: ordered question prompts and choices, with composite keys preventing questions from being attached to another course's assessment; the follow-up migration requires each choice to have a unique non-empty string ID and label, rejects extra fields, and prevents answer-key data being smuggled into choice objects.
- `app_private.assessment_answer_keys`: correct answers and grading explanations outside the exposed public schema.
- `learning_assessment_attempts`: learner-owned attempts and controlled state transitions (in progress, submitted, graded, voided).
- `learning_assessment_responses`: responses constrained to questions belonging to the attempt's assessment.
- `app_private.academy_staff_roles`: trusted server-side role assignments; never exposed to browser roles.
- `app_private.academy_audit_events`: service-only audit events for privileged operations.

The migration creates no users, course content, questions, answers, attempts, staff assignments, grades, or certificates. Browser roles have read-only access to published assessments/questions for enrolled learners, and can read only their own attempts/responses. All assessment writes and all private-schema access are reserved for the trusted server-side `service_role`; never put that key in a Vite/browser variable.

## Important limits

This migration supplies data structures and access boundaries, **not a complete assessment product**. A trusted backend must still implement and test: start-attempt/attempt-limit enforcement under concurrency, answer submission, submission locking, objective grading, assessor marking for free text, final outcome recording, audit writes, staff authorization, and certificate issuance/revocation. It must validate every state transition on the server. Client-side gating is not authorization.

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

Run `bash scripts/test-learning-schema.sh` with the documented PostgreSQL 16 binaries, then `npm run typecheck`, `npm run lint`, `npm test`, and a forced-off build. These are local/CI checks only. They do not authorize a hosted migration or prove Supabase Data API behavior. Before a staging migration, also run the Supabase security/performance advisors and verify the actual policies with two separate test accounts.

## Remaining launch work

1. Confirm and document account deletion, award retention and anonymization rules.
2. Reconcile the existing public-enquiry migration with the live schema and migration ledger; do not replay it blindly.
3. Apply the base learning and assessment migrations only in an approved isolated non-production target, then verify table grants/RLS via PostgREST.
4. Implement server-side enrolment, assessment/marking, content management, certificate issuance/revocation and audit workflows.
5. Configure and test verified sender/SMTP and recovery email; keep secrets server-side.
6. Finalize the academy’s legal/privacy text, enquiry processing and notification/retention workflow.
7. Run authenticated browser tests with two approved accounts before considering feature flags.

A Git-triggered production Vercel deployment for `dce71b0d1902c51b9c28617a80a10178e5e65c93` is READY. No Supabase schema migration/live database write, auth setting, Edge Function, secret, domain or DNS setting was changed. The SQL migrations remain unapplied; feature flags remain off. Production indexing is enabled by the build script, while previews remain non-indexable.
