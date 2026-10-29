# Clinova Supabase implementation status

**Snapshot:** 23 October 2026  
**Code branch:** `feat/clinova-safe-auth-Sh2gdLt`  
**Supabase project:** Clinova International Academy's existing project, ref `ssxpmcbqfdggfsoqbxac`

This report records read-only inspection of the connected Supabase project and the source-only learner migration added to the existing GitHub development branch. No live database schema or settings were changed, no Edge Function was deployed, and no application was deployed or merged.

## Verified live project

- Project state: active/healthy; PostgreSQL 17.
- Public tables: `contact_submissions`, `partnership_inquiries`, `newsletter_subscriptions`.
- All three tables have RLS enabled.
- Anonymous and authenticated browser roles have INSERT only; they cannot SELECT, UPDATE or DELETE enquiry rows. PUBLIC has no table privileges. This was checked through effective privilege queries, not inferred only from policy names.
- RLS policies deny public reads, updates and deletes; insert policies accept form submissions.
- Security and performance advisors returned no findings at the time of inspection.
- No Supabase Edge Functions and no Supabase development branches were returned.
- The live migration ledger currently lists `20261022162916_harden_public_enquiry_table_privileges`. The existing source migration `20261018200942_create_public_enquiry_submissions.sql` was not present in the returned ledger, so local and remote migration history needs reconciliation before any migration push.

## Current website behavior

- `VITE_ENQUIRIES_ENABLED=false` by default; public forms stay disabled until spam controls and the submission workflow are approved.
- `VITE_AUTH_ENABLED=false` by default; Auth is not live merely because the project exists.
- `VITE_LEARNER_DATA_ENABLED=false` by default; the dashboard does not query learner tables until the matching migration is installed and tested.
- `VITE_INDEXING_ENABLED=false` by default.
- No learner, enrollment, progress or certificate tables were found in the live public schema.
- No email notification or newsletter delivery integration is configured by this work. Database insertion alone does not mean an email was delivered.
- No admin role was provisioned. Trusted admin authorization must use server-controlled `app_metadata`, never user-editable `user_metadata`.

## Source-only migration work

- `20261022162916_harden_public_enquiry_table_privileges.sql` now mirrors the verified insert-only privilege state of the already-listed live migration.
- `20261023010000_create_secure_learner_records.sql` proposes profile, enrollment, progress and certificate tables with RLS. Students can read only their own permitted records; progress/certificate writes and enrollment management are admin-only. Admin checks use trusted JWT `app_metadata.role`.
- These migrations exist only in the GitHub development branch. They have **not** been applied to Supabase. The learner dashboard has a separate feature flag and queries only its own user's rows when explicitly enabled.

## Before enabling or applying anything

1. Establish a non-production Supabase database. No existing Supabase branch was found; do not create a new one or incur branch costs without separate authorization.
2. Reconcile the migration ledger with checked-in SQL; inspect actual remote migration history before pushing. Do not replay migrations blindly.
3. Apply the learner migration only to a non-production database, then run RLS isolation tests with at least two synthetic users and an admin claim.
4. Add an abuse-control path for public submissions (server-side validation, durable rate limits and bot protection) before enabling public forms.
5. Configure and test Auth email confirmation and password-reset callbacks on an explicitly approved origin. Never expose service-role keys to the browser.
6. Provision a trusted admin identity out-of-band, then test the role-gated admin UI against the non-production database. No public admin signup or user-controlled role assignment.
7. Design a separate, privacy-minimizing certificate verification endpoint before enabling public verification. Do not grant anonymous SELECT on student/certificate tables.
8. Confirm lawful privacy/retention wording, newsletter consent and unsubscribe behavior before collecting real submissions.
9. Keep deployment, production schema changes, domain/DNS/email configuration and indexing off until separately approved.

The source migration and dashboard are a development foundation, not proof of a complete or production-ready learning management system.


## Update: CMS schema and local frontend integration (30 October 2026)

### Production schema: applied, empty, read-only verified

The owner-approved CMS-only SQL was applied once to production project `ssxpmcbqfdggfsoqbxac`. The production migration ledger confirms version `20261029192938`, name `clinova_content_management_20261030`. Read-only metadata inspection confirmed the five CMS tables (`content_items`, `content_versions`, `content_review_decisions`, `content_source_provenance`, `content_audit_events`), their columns/RLS, the seven CMS transition RPCs, the `published_content` view, and **zero rows** in each CMS table. The public view exposes only item/version IDs, kind, version number, snapshot, hash and publication time, filtered to published versions whose publication time has arrived. No content rows were read or written; no source content was imported and nothing was published.

No separate staging Supabase project was available. Consequently, **Supabase-staging validation: none**. The read-only production inspection verifies that the authorized schema is present, not that the application has a deployed frontend, provisioned CMS identities, or complete end-to-end/RLS negative testing. No local migration mirror was added or executed because the exact original migration payload was not independently available to verify byte-for-byte. The earlier sections of this document describe the 23 October baseline and should be read as historical where they predate this update.

### Local frontend state: wired but inactive

The local checkout now includes a default-off `VITE_CMS_ENABLED=false` frontend boundary. If enabled for the exact Clinova Supabase URL with a public anon key, public library integration reads only `published_content`; existing repository articles remain visible and empty/error CMS responses do not remove them. Admin Content has local draft creation, review evidence and workflow RPC controls; the admin workflow list and each RPC require the exact matching server-managed `app_metadata.clinova_roles` values. No fallback from `app_metadata.role` is implemented. Auth remains disabled in the current configuration, so these CMS controls are not operational in the current app. No Auth configuration, role claim, private key, storage, or production setting was changed. At the time of this status snapshot, the local code had not yet been deployed; production schema presence and live frontend behavior are separate facts.

The synthetic local tests exercise the flag-off path, the published-view renderer, claim mismatch denial, a mocked draft-to-publish role sequence, and denial before any unauthorized workflow query/RPC. They do not connect to production and are not a substitute for staging integration tests.

### Supabase advisor findings and assessment

Read-only advisor results after the CMS migration reported:

- **7 SECURITY warnings:** signed-in users can execute SECURITY DEFINER functions `archive_content_version`, `create_content_item`, `create_content_version`, `publish_content_version`, `record_content_review`, `submit_content_for_review`, and `withdraw_content_version. The [Supabase database linter 0029 guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) recommends restricting EXECUTE or using invoker security when appropriate. The inspected function bodies check `auth.uid()` and the corresponding `has_clinova_role(...)` claim before sensitive transitions. That provides an explicit server-side role check, but the broad authenticated EXECUTE grant still merits least-privilege review and negative tests. Do not enable Auth or `VITE_CMS_ENABLED` until the authorized staging/security review is complete.
- **7 unindexed foreign keys:** `content_audit_events.actor_id`, `content_review_decisions(content_version_id, reviewed_hash)`, `content_review_decisions.reviewer_id`, `content_source_provenance.imported_by`, `content_versions.author_id`, `content_versions(content_item_id, kind)`, and `content_versions.supersedes_version_id`. See [linter 0001 guidance](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys). These are performance considerations; all CMS tables are currently empty. Reassess against approved query/workload tests before separately authorized DDL.
- **5 unused indexes:** `content_versions_item_history_idx`, `content_versions_status_idx`, `content_review_decisions_version_type_idx`, `content_audit_events_item_time_idx`, and `content_audit_events_version_time_idx`. See [linter 0005 guidance](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index). Empty/new tables explain why they may not yet show use; do not drop them solely from this snapshot.
- **2 overlapping SELECT-policy warnings:** authenticated `content_items` has public-read plus staff-read policies; authenticated `content_versions` has published-read plus staff-read policies. See [linter 0006 guidance](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies). These are policy-planning/performance notices; preserve the intended published/public versus role-controlled staff access when evaluating consolidation.

This Supabase status update covers no production advisory remediation, schema alteration, content migration, RPC invocation, Auth change, or database deployment. The production schema change recorded here is the exact CMS payload already present in the production migration ledger.

### Remaining gates

1. Establish an approved non-production Supabase environment and run real RLS/role-negative tests using synthetic identities; do not create a paid branch or project without separate approval.
2. Review authenticated EXECUTE grants and advisory findings in staging; remediate only under a new exact production-change approval.
3. Approve and provision the trusted server-managed `clinova_roles` claim model out of band. Do not map the current app's `role=admin`, enable Auth, or add public role assignment.
4. Reconcile exact content hashes and independent clinical/editorial/release evidence before considering any publication. Production content must stay empty until explicitly authorized.
5. Keep certificates, learner accounts/data, partnership submissions, private enquiries, storage and app settings disabled pending their own backend/privacy/retention approvals.
6. The full local test suite, typecheck, lint, build and `git diff --check` were completed for the release candidate. The owner separately authorized this website's Git/PR/merge/Production deployment workflow; this Supabase note authorizes no additional SQL, schema, content, Auth, role, or Vercel-setting change.
