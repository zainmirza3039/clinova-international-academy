-- PROPOSAL ONLY — DO NOT APPLY TO PRODUCTION YET.
-- Generated from a read-only inventory of Clinova Supabase on 2026-11-12.
-- Requires review against the exact migration chain and a disposable PostgreSQL test DB.
-- No data is changed by this file until an operator explicitly applies it.

begin;

-- 1) Remove excessive direct table/view privileges from API roles.
-- RLS policies remain in place; this changes SQL privileges, not row predicates.
revoke all privileges on all tables in schema public from anon, authenticated;

-- Public intake: write-only for anonymous users; staff reads remain RLS-gated.
grant insert on table public.contact_submissions to anon, authenticated;
grant select on table public.contact_submissions to authenticated;

grant insert on table public.newsletter_subscriptions to anon, authenticated;
grant select on table public.newsletter_subscriptions to authenticated;

grant insert on table public.partnership_inquiries to anon, authenticated;
grant select on table public.partnership_inquiries to authenticated;

-- Public read projections only. These views were inventoried as security_invoker.
grant select on table public.published_content to anon, authenticated;
grant select on table public.verified_instructors to anon, authenticated;

-- CMS: read through RLS; state transitions go through validated RPCs.
grant select on table public.admin_role_audit_events to authenticated;
grant select on table public.content_audit_events to authenticated;
grant select on table public.content_items to anon, authenticated;
grant select on table public.content_review_decisions to authenticated;
grant select on table public.content_source_provenance to authenticated;
grant select on table public.content_versions to anon, authenticated;

-- Learner/faculty operations: only the operations represented by existing policies.
grant select, insert, update on table public.profiles to authenticated;
grant select on table public.instructor_profiles to anon, authenticated;
grant insert, update on table public.instructor_profiles to authenticated;
grant select, insert, update on table public.course_enrollments to authenticated;
grant select, insert, update on table public.course_instructor_assignments to authenticated;
grant select, insert, update, delete on table public.course_lessons to authenticated;
grant select, insert, update on table public.course_live_sessions to authenticated;
grant select, insert, update on table public.course_lesson_progress to authenticated;
grant select on table public.course_certificates to authenticated;

-- Do not grant direct certificate INSERT/UPDATE/DELETE: issuance/revocation must
-- be implemented through an audited, permission-checked domain command.

-- 2) Remove blanket default table grants so future tables do not inherit them.
-- Execute as a role permitted to alter default privileges for these object owners.
alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated;
alter default privileges for role supabase_admin in schema public
  revoke all privileges on tables from anon, authenticated;

-- Existing identity tables use UUIDs; revoke default sequence privileges too.
alter default privileges for role postgres in schema public
  revoke all privileges on sequences from anon, authenticated;
alter default privileges for role supabase_admin in schema public
  revoke all privileges on sequences from anon, authenticated;

-- 3) Tighten default function EXECUTE grants. Existing trigger/internal functions
-- should not become callable by API roles merely because they are created in public.
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;
alter default privileges for role supabase_admin in schema public
  revoke execute on functions from anon, authenticated;

-- Existing private implementation functions are called by public wrappers.
-- Keep schema USAGE because the current invoker wrappers require it; restrict
-- EXECUTE to the specific implementation functions they call.
revoke execute on all functions in schema clinova_private from anon, authenticated;

grant execute on function clinova_private.verify_cpd_certificate(uuid) to anon, authenticated;
grant execute on function clinova_private.archive_content_version(uuid, text) to authenticated;
grant execute on function clinova_private.create_content_item(text, jsonb) to authenticated;
grant execute on function clinova_private.create_content_version(uuid, jsonb) to authenticated;
grant execute on function clinova_private.issue_cpd_certificate(uuid, text) to authenticated;
grant execute on function clinova_private.publish_content_version(uuid) to authenticated;
grant execute on function clinova_private.record_content_review(uuid, text, text, jsonb, text) to authenticated;
grant execute on function clinova_private.submit_content_for_review(uuid) to authenticated;
grant execute on function clinova_private.withdraw_content_version(uuid, text) to authenticated;

-- Public wrappers: retain only the explicitly required user-facing RPCs.
revoke execute on all functions in schema public from anon, authenticated;

grant execute on function public.has_clinova_role(text) to anon, authenticated;
grant execute on function public.verify_cpd_certificate(uuid) to anon, authenticated;

grant execute on function public.archive_content_version(uuid, text) to authenticated;
grant execute on function public.create_content_item(text, jsonb) to authenticated;
grant execute on function public.create_content_version(uuid, jsonb) to authenticated;
grant execute on function public.issue_cpd_certificate(uuid, text) to authenticated;
grant execute on function public.publish_content_version(uuid) to authenticated;
grant execute on function public.record_content_review(uuid, text, text, jsonb, text) to authenticated;
grant execute on function public.submit_content_for_review(uuid) to authenticated;
grant execute on function public.withdraw_content_version(uuid, text) to authenticated;

-- Prevent future private implementation functions from inheriting PostgreSQL's
-- default PUBLIC EXECUTE privilege. Re-grant only the approved verifier and
-- wrapper targets above for the current functions.
alter default privileges for role postgres in schema clinova_private
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role supabase_admin in schema clinova_private
  revoke execute on functions from public, anon, authenticated;

-- 4) Keep API roles' schema USAGE, but no CREATE privilege.
-- Do not revoke clinova_private USAGE yet: public.verify_cpd_certificate is an
-- invoker wrapper and calls the private verifier. Refactor to a narrowly scoped
-- SECURITY DEFINER wrapper before considering removal of private-schema USAGE.
grant usage on schema public to anon, authenticated;
grant usage on schema clinova_private to anon, authenticated;

commit;

-- POST-APPLY ASSERTIONS (run separately):
-- * anon/authenticated have no TRUNCATE, REFERENCES or TRIGGER on public relations.
-- * anon has INSERT only on the three public intake tables and SELECT only on
--   the two approved public views / public content projections.
-- * authenticated has only the table operations listed above.
-- * public/private function EXECUTE grants match the explicit allow-list.
-- * default privileges for postgres and supabase_admin no longer grant blanket
--   table, sequence or function privileges to anon/authenticated.
-- * verify both public views remain security_invoker=true and re-test their
--   underlying RLS behavior.
