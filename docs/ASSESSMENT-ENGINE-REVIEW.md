# Clinova assessment and trusted operations schema review

## Status

This is a **review-only schema proposal** on `review/clinova-assessment-schema-20261023`. It has not been applied to Supabase and must not be deployed to production until the learner data-retention decision and staging verification are complete. Production project `ssxpmcbqfdggfsoqbxac` currently has only the three enquiry tables in `public`; the learner foundation, assessments, staff roles, and audit tables are absent.

## Added migration

`supabase/migrations/20261023010000_create_assessment_engine.sql` adds:

- `learning_assessments`: course-linked assessment configuration, pass threshold, attempt limit and publication status.
- `learning_assessment_questions`: ordered question prompts and choices, with composite keys preventing questions from being attached to another course's assessment.
- `app_private.assessment_answer_keys`: correct answers and grading explanations outside the exposed public schema.
- `learning_assessment_attempts`: learner-owned attempts and controlled state transitions (in progress, submitted, graded, voided).
- `learning_assessment_responses`: responses constrained to questions belonging to the attempt's assessment.
- `app_private.academy_staff_roles`: trusted server-side role assignments; never exposed to browser roles.
- `app_private.academy_audit_events`: service-only audit events for privileged operations.

The migration creates no users, course content, questions, answers, attempts, staff assignments, grades, or certificates. Browser roles have read-only access to published assessments/questions for enrolled learners, and can read only their own attempts/responses. All assessment writes and all private-schema access are reserved for the trusted server-side `service_role`; never put that key in a Vite/browser variable.

## Important limits

This migration supplies data structures and access boundaries, **not a complete assessment product**. A trusted backend must still implement and test: start-attempt/attempt-limit enforcement under concurrency, answer submission, submission locking, objective grading, assessor marking for free text, final outcome recording, audit writes, staff authorization, and certificate issuance/revocation. It must validate every state transition on the server. Client-side gating is not authorization.

The migration uses restrictive relationships between attempts and enrolments so an account/enrolment cannot silently erase assessment history. This deliberately makes the owner’s deletion/retention/anonymization decision a launch blocker; do not weaken those constraints or turn on Auth/learner data without an approved policy. The base learner migration still contains Auth-user cascades for other records, so the full policy must be reconciled across both migrations.

Public certificate verification remains a separate feature. The private award table and `public_certificates` are not automatically synchronized; a trusted issuance/revocation workflow and rate-limited disclosure endpoint with approved privacy wording are still required. No certificates are seeded.

## Verification

The isolated SQL suite now applies the proposal after the learner foundation and includes checks for:
- anonymous assessment read denial;
- enrolled learner access to published assessments/questions;
- owner-only attempt/response reads;
- answer-key isolation from browser roles; and
- rejection of client-created attempts.

Run `bash scripts/test-learning-schema.sh` with the documented PostgreSQL 16 binaries, then `npm run typecheck`, `npm run lint`, `npm test`, and a forced-off build. These are local/CI checks only. They do not authorize a hosted migration or prove Supabase Data API behavior. Before a staging migration, also run the Supabase security/performance advisors and verify the actual policies with two separate test accounts.

## Remaining launch work

1. Confirm and document account deletion, award retention and anonymization rules.
2. Reconcile the existing public-enquiry migration with the live schema and migration ledger; do not replay it blindly.
3. Apply the base learning and assessment migrations only in an approved isolated non-production target, then verify table grants/RLS via PostgREST.
4. Implement server-side enrolment, assessment/marking, content management, certificate issuance/revocation and audit workflows.
5. Configure and test verified sender/SMTP and recovery email; keep secrets server-side.
6. Finalize the academy’s legal/privacy text, enquiry processing and notification/retention workflow.
7. Run authenticated browser tests with two approved accounts before considering feature flags.

No production schema, auth settings, edge functions, secrets, deployment, domain or DNS settings were changed by this proposal.
