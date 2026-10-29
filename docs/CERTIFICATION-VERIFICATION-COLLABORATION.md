# Certification, Verification & Collaboration Contracts

**Status:** Proposal and local UI behavior only. No Supabase schema/migration change was added or applied. No hosted database, auth setting or endpoint was changed or queried in this implementation phase.

## What visitors can do now

### Certificate information

`/certification` searches the current `publishedProgrammes` source list and links each displayed title to its matching programme detail route. The page distinguishes the synchronous repository catalogue's empty state from a search with no matches. It states that learner-facing certificate eligibility and issuance are not defined here and that a published learning guide does not establish a certificate, accredited qualification or eligibility.

`AdminPage` no longer offers certificate issue or revoke actions; certificate records are read-only in this interface. The original learner migration's trusted-admin RLS policy does not verify completion or award eligibility. This frontend guard is not server-side enforcement: if that original policy is deployed, an authenticated admin may still mutate certificate rows directly. Hosted policy state was not checked. Keep certificate issuance disabled until a secure server-side workflow exists.

### Certificate verification

`/verify` accepts a proposed code, trims leading/trailing whitespace and checks the provisional pattern `^[A-Za-z0-9-]{1,64}$`. Enter submits the format check and Clear resets the input and messages. A format-valid string always receives the same explicit service-unavailable/not-checked outcome. No network request, certificate query, learner lookup or browser-storage write occurs.

### Collaboration draft

`/training-partners` presents potential educational discussion topics, clearly labels them as proposals rather than confirmed services, and excludes internships or supervised placements absent operational approval. Its local-only checker collects organisation name/type, country/location, contact name, role, business email, optional phone, collaboration idea, proposal/objectives, expected audience and optional details. Limits are 200, 80, 120, 160, 160, 320, 80, 80, 5,000, 500 and 2,000 characters respectively. It validates required values, email shape, optional phone characters/length, and acknowledgement; errors are associated with fields and the summary receives focus.

The form holds values only in React component memory until Clear, navigation or reload. “Validate draft only” does not send or save data and does not produce a reference. The acknowledgement confirms this behavior; it is not a legal privacy consent. The page warns not to enter patient, learner or other sensitive personal data.

## Existing data structures in repository source

These are local SQL and code artifacts, not a statement of current hosted state.

### Private certificate record proposal

The checked-in source-only learner migration defines `public.student_certificates` with:

| Field | Local source definition | Boundary / limitation |
| --- | --- | --- |
| `id` | UUID primary key | Internal record ID; do not expose as verification token. |
| `student_id` | Required reference to `auth.users(id)` | Private learner relationship; never return publicly. |
| `enrollment_id` | Required composite reference to a learner enrollment | Relates the record to an enrollment; no server-side completion trigger is defined in this migration. |
| `certificate_number` | Unique text, 4–120 characters | Not guaranteed opaque or unguessable. Treat as admin-only until a code-generation and verification policy exists. |
| `programme_title` | Required text snapshot, 1–200 characters | May be returned only after privacy/policy approval; it is not proof of award eligibility. |
| `status` | `issued` or `revoked`, default `issued` | No `expired` status or expiry rule exists. |
| `issued_at`, `revoked_at` | Timestamps | No completion timestamp or expiry timestamp is defined. |
| `issued_by` | Optional auth-user reference | Internal audit detail; not public. |

The original migration enables RLS, grants learners access only to their own issued records, and reserves certificate mutations for a trusted admin role from JWT `app_metadata`. That is a server-side role boundary if the migration is installed, but it has no trigger, RPC or function checking completed enrolment, actual course completion, an approved award rule, or issuance audit requirements. The only issuance path previously found was a direct browser-client insert in `AdminPage`; that insert and the direct revoke update are now removed from the UI. Enrollment/progress management still uses authenticated browser-client writes under the proposed admin RLS policies; an authorized admin can set enrollment status/progress, so those fields are not independent completion evidence. No new schema or permission change was made, so no server-side restriction on direct certificate mutations was proposed. The hosted database state is unknown and the UI guard must not be treated as a backend security boundary. Keep issuance disabled. No learner record was read or written in this task.

### Partnership enquiry proposal

The local `20261018200942_create_public_enquiry_submissions.sql` defines `public.partnership_inquiries` with `id`, `full_name`, `organisation`, `role`, `email`, optional `phone`, `country`, optional `website`, `message` and `created_at`. Its policies deny public SELECT/UPDATE/DELETE and permit anon/authenticated INSERT. The local hardening migration grants those roles INSERT only. The source model lacks organisation type, collaboration type, expected audience, additional details, submission status, retention metadata and a legal acknowledgement record. The current UI is not connected to it.

A maintained Supabase status note dated 23 October 2026 records a historical live-state inspection, but it was not re-verified here. The presence of SQL, a feature flag or an old snapshot does not prove current deployment, migration state or endpoint security.

## Proposed backend contract — not implemented

### Certificate issuance and verification

Reuse `student_certificates`; do not create a duplicate certificate table. Before enabling issuance, the academy must approve completion/eligibility rules, award wording, issuing authority, template/versioning, code lifecycle and revocation rules. The database or trusted server must enforce the eligibility condition and uniqueness atomically; a client-side status check is not authoritative.

If public verification is approved, add an opaque, high-entropy code generated server-side and store only a unique keyed hash (for example `verification_code_hash`) for lookup. Do not expose `student_id`, auth email, learner ID, enrollment ID, private certificate number, internal reason or record ID. Keep status changes in an admin-only audit trail (actor, old/new status, reason, timestamp); the existing `revoked_at` field alone is not a complete history. Add an expiry field only after a written policy defines expiry. Do not return an `expired` outcome before that rule exists.

Suggested endpoint: `POST /api/public/certificate-verification` with `{ "code": "..." }`. Validate again server-side; enforce durable rate limits and abuse controls; avoid logging raw codes; query through a restricted server function rather than granting anonymous SELECT on learner tables. Return only a minimum policy-approved public result, for example `verified` with approved programme title/issue date, `revoked` only if disclosure is authorized, a generic `invalid_or_not_found`, or `service_unavailable`. A failure must never be represented as a successful check. The public response must not reveal whether a private learner record exists when that distinction would create enumeration risk.

### Partnership submission

Prefer an authenticated server/API or Supabase Edge Function as the only public write path; do not insert directly from the browser into a table with a broad anonymous policy. Reuse `partnership_inquiries` through an additive, reviewed migration if compatible; do not create a second source of truth. Proposed additions, only after owner/legal approval, include validated `organisation_type`, `collaboration_type`, `expected_audience`, `additional_details`, a `status` controlled by trusted staff, and a versioned privacy-notice acknowledgement/timestamp only if a lawful notice is approved. Keep the minimum necessary data and avoid sensitive health or learner information.

The endpoint should apply server-side field validation and size limits, durable rate limiting, bot/spam controls, safe output encoding, duplicate/idempotency handling, origin/CSRF protections as applicable, and safe operational logging. Return an opaque reference only after a transaction durably stores the submission; return a non-success response on failure. Keep public read/update/delete denied. Define who can review submissions, permitted fields, audit logs, retention/deletion dates and data-subject request handling before collecting real enquiries. Do not invent a privacy policy or claim legal consent from the current local acknowledgement.

## Local validation and release dependencies

- Current `/verify` client-side code is format/UX assistance only; it cannot return a positive verification result and makes no request. Server validation remains mandatory.
- Certificate issue/revoke actions are disabled in the admin UI only. No server-side eligibility enforcement or database write restriction was added, and the hosted privileges were not checked. The interface change does not prevent direct API/database writes allowed by a deployed policy; keep issuance disabled until approved server-side checks and tests exist.
- `VITE_AUTH_ENABLED`, `VITE_LEARNER_DATA_ENABLED`, `VITE_ENQUIRIES_ENABLED`, `VITE_VERIFICATION_ENABLED` and `VITE_INDEXING_ENABLED` exist in source configuration. Their hosted values were not inspected or changed. Do not enable a flag until the matching backend and tests are approved.
- Admin must use server-enforced trusted roles and least privilege. The checked-in learner migration is not evidence of a current deployed schema; reconcile migration history only in an approved non-production environment.
- Required tests before activation: two synthetic learners plus a trusted admin for RLS isolation; server-side tests proving unauthorized and incomplete enrolments cannot issue; completion/eligibility using an academy-approved model; uniqueness/concurrency and revocation audit; code entropy/rate-limit/enumeration checks; verification outcomes and data minimization; partnership field limits, spam controls, idempotency, access boundaries, deletion/retention and no false success. The current local tests prove only that the frontend admin UI exposes no certificate write action for synthetic completed/active enrolments; no server or database integration test has run.
- Separate academy approval is required for clinical/editorial sign-off, award eligibility and public wording. This document proposes contracts only; it does not approve accreditation, issuing authority, collection purpose, retention or production activation.


## Local readiness follow-up — 2026-10-29

The separate technical package was freshly validated in a disposable PostgreSQL 16.15 cluster using synthetic accounts. Its test suite completed, and its certificate case confirms the source-only `20261023010000_create_secure_learner_records.sql` migration permits a trusted admin to create an `issued` certificate for a `pending` enrollment without completion evidence. This is a reproduced vulnerability, not evidence that issuance is secure. The UI remains fail-closed, `/verify` remains format-only, and no certificate migration, endpoint, or eligibility rule was added.

The CMS SQL was applied only in that throwaway local database, outside the repository's migration directory. It is a prototype, not a production-ready migration or API. The source/live migration history discrepancy was not rechecked or repaired; no managed Supabase environment was used. The local database cluster was stopped and removed after testing.

### Decisions and actions required before implementation can proceed

1. **Academic owner:** approve what each award represents; required units, assessments and passing criteria; treatment of identity, appeals, withdrawal and holds; authorized issuer/revoker roles; and revocation, reissue and expiry rules. Without this policy, technical code cannot determine eligibility truthfully.
2. **Authorized database operator/owner:** reconcile migration history and live object definitions with evidence, then authorize a separate non-production Supabase test path. Do not add the prototype to the migration directory, fabricate an applied-ledger row, or replay the old table-creation migration.
3. **Security/operations owner:** approve the server-side issuance and verification API contract, trusted role assignment, unique/idempotent issuance, immutable audit, opaque token handling, rate limits, log redaction, backup/restore and failure behavior; validate negative cases with synthetic accounts in approved non-production.
4. **Privacy/legal owner:** approve which verification fields may be public, whether revoked status is disclosed, retention/deletion and the data-subject process. Until approval, unknown/unavailable lookups must never return a positive result.

Until these decisions and non-production tests are complete, do not enable learner/certificate/verification flags or enable direct certificate writes. No production or external action was performed in this follow-up.
