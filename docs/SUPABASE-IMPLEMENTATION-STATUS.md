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
