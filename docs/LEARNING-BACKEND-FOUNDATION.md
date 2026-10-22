# Clinova learner backend foundation

## What this adds

An additive SQL migration supplies an empty, least-privilege foundation for real learner records. It does not create users, publish proposed courses, enrol anyone, or issue certificates. It does not alter frontend/auth files, DNS, domains, existing enquiries, or live service settings.

The migration is `supabase/migrations/20261022090000_create_learning_foundation.sql`. It is a **local release candidate, not an applied live migration or a working end-to-end LMS**. The correct live Clinova project is `ssxpmcbqfdggfsoqbxac`; this task's Supabase connector inventory exposes only an unrelated project, which was not used. The earlier live enquiry migration remains the only migration known to have been applied.

## Data and access contract

| Table | Browser access | Trusted backend responsibility |
| --- | --- | --- |
| `student_profiles` | Signed-in learner reads/creates own row and updates only `display_name`. | Account deletion/retention handling. No roles or credentials stored here. |
| `learning_courses` | Anonymous and signed-in visitors read published courses only. | Validate ownership, accuracy and publication approval before inserting/publishing courses. |
| `learning_modules` | Signed-in active/completed enrollees read modules of published courses. | Maintain course/module structure. |
| `learning_lessons` | Signed-in active/completed enrollees read published lessons of published courses. | Write reviewed lesson material; render Markdown with a safe renderer, never raw unsanitized HTML. |
| `student_enrolments` | Learner reads own records only. | Verify eligibility and approved enrolment process; only a trusted service can grant/change enrolment. |
| `lesson_progress` | Learner reads own completion markers. Writes only through the narrow RPC below. | Progress is self-reported study activity, never evidence of passing assessment or eligibility for an award. |
| `student_assessment_records` | Learner reads own records only. | Real assessment submission/marking system must verify and record outcomes. No assessment engine is implied. |
| `student_certificates` | Learner reads own records only, including revocation status. | Verify actual award conditions before issuance/revocation; generate unpredictable references. |

Every table has Row Level Security. Explicit grants remove inherited browser table privileges; the service role is the trusted write path for enrolments, content, assessments and certificates. **Never put the service-role key in a Vite variable, browser bundle, client function or repository.** There is no browser admin role, user-selected role, public student search, or anonymous certificate-table read policy.

Course/module/lesson foreign keys prevent a lesson from claiming a module from another course. Assessment and certificate records require an existing enrolment for the same learner and course. Revoked certificates require a revocation timestamp. These are integrity constraints, not automated award eligibility checks.

Deleting an Auth user is destructive: their profile, enrolments, progress, assessment records and certificates cascade away. Direct enrolment deletion remains restricted while assessment/certificate records reference it. The owner must approve this deletion/retention contract before launch; if awards need legally justified retention, replace account deletion with an explicit reviewed anonymization workflow first. Browser users have no account/table-delete grant in this migration.

## Frontend integration for the auth owner

This delivery does not modify PR #4 or its worktree. Once the backend is separately deployed and tested, its auth owner can query these tables through the signed-in Supabase client. Select only required columns and paginate lists. Do not read another learner's ID from a URL and treat that as authorization; RLS uses `auth.uid()`.

For a profile, insert only `{ user_id: session.user.id, display_name }`, or update only `{ display_name }`. Do not send `created_at`, roles or other private account attributes. Profile creation is explicit; there is no auth trigger silently copying untrusted signup metadata.

For a lesson completion marker:

```ts
const { error } = await supabase.rpc('set_my_lesson_completion', {
  p_lesson_id: lessonId,
  p_completed: true, // false removes the caller's marker
});
```

The RPC accepts no learner ID or timestamp. It requires authentication, an active enrolment, a published course and a published lesson; it creates the caller's server-timestamped marker idempotently. It locks the relevant enrolment/content rows during the update. Completed or withdrawn enrolments cannot change progress. Completed learners may still read published lessons. Repeated completion does not overwrite the original timestamp.

Read saved completion markers for progress indicators, compare them only with currently available published lessons, and distinguish self-reported progress from trusted assessment/award records. Backend/network errors must not be displayed as zero progress or a verified certificate. Retain loading, empty, and unavailable states.

## Certificate verification stays honest

No public verification RPC or endpoint is introduced. Anonymous users have no certificate-table access, and no real or fake certificates are seeded. The public page must remain unavailable until a separate, rate-limited server endpoint and a minimal disclosure/consent policy are implemented. That endpoint should return only approved award fields and distinguish issued, revoked, invalid and unavailable states without exposing email, date of birth, internal learner ID, or other private records. A frontend ID pattern match is not verification.

## Live release prerequisites

1. Reconcile the manually applied enquiry migration `20261018200942` against the live schema and migration ledger before **any** automatic migration push. The prior SQL Editor application did not update that ledger. Do not blindly replay the old migration or claim this new migration is already live.
2. Review the new migration against a fresh schema inventory in the confirmed Clinova project. It deliberately fails if its new tables already exist, rather than silently accepting drift. Do not point tools at the unrelated project to bypass missing access.
3. Run the disposable PostgreSQL tests described below. Then apply only this reviewed migration through an authorized Clinova connection and verify table grants, policies and the RPC on the real Supabase API using two approved test accounts. Local SQL tests do not establish hosted API behavior.
4. Integrate frontend data queries on a separate reviewed branch owned by the auth/frontend developer; do not wholesale cherry-pick the earlier overlapping SEO/auth files. Retain disabled launch flags until integration, account recovery and email delivery are tested in the authorized environment.
5. Implement trusted course publication, enrolment, assessment and certificate workflows before presenting those as available services. Establish retention/export/deletion procedures before collecting real student records. Course deletion is restricted where enrolments/records exist; do not use destructive deletes as rollback.
6. Existing enquiries remain disabled until server-side abuse protection, validation and actual API persistence are tested. Client validation and insert-only RLS are not rate limiting. Current enquiry SQL still permits whitespace/malformed direct inserts and caller-supplied audit timestamps; those are separate hardening tasks, not fixed by this learner migration.

No new domain, canonical, redirect, DNS, deployment or live auth configuration is included. The owner-confirmed intended canonical is `clinovaacademy.co.uk`, but all domain-related work remains paused.

## Testing and rollback

The local test runner starts a disposable PostgreSQL cluster with no TCP listener, supplies minimal Supabase role/auth stubs and destroys it on exit. Its synthetic users and records exist only in that temporary cluster. Run:

```sh
bash scripts/test-learning-schema.sh
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

The SQL suite tests cross-user denial, published/draft visibility, enrolment requirements, narrow completion writes, trusted-only awards and relational constraints. This is not a hosted Supabase API test, a browser auth test, a full penetration test or proof of certificate issuance functionality.

Rollback before release means leaving this additive migration unapplied. After deployment, disable learner integrations and fix forward; preserve legitimate enrolment, progress, assessment and certificate records. Never drop learner or enquiry tables as an automatic rollback.
