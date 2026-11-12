# Clinova — Role and ACL Read-only Findings

**Date:** 2026-11-12
**Project:** `ssxpmcbqfdggfsoqbxac`
**Method:** Read-only catalog queries through the connected Clinova Supabase project.
**No database changes were made.**

## 1. Current role helper

The current `public.has_clinova_role(text)` is a SQL STABLE function with `search_path=pg_catalog`. It returns true when the JWT `app_metadata.clinova_roles` array contains the requested role, or for the legacy `content_admin` role when `app_metadata.role='admin'`.

Positive:
- It does not authorize from user-editable `user_metadata`.
- Its search path is restricted.

Limitations:
- The authorization source is JWT metadata rather than a relational assignment record.
- Role revocation may remain stale until the JWT is refreshed.
- It has no institution/programme/course/scheme/case scope.
- The legacy generic admin fallback is too broad for the target academy model.
- A role name alone cannot encode separation of duties or assignment validity windows.

## 2. Signup trigger

`public.handle_new_clinova_user()` is SECURITY DEFINER and inserts a basic `profiles` row using `new.raw_user_meta_data.full_name`. It does not grant roles or read a role field. This is an acceptable profile bootstrap pattern subject to review of trigger attachment, function ACL and profile RLS; do not repurpose it for privileged provisioning.

## 3. Private-schema ACL finding

The live `clinova_private` schema ACL currently grants schema USAGE to both `anon` and `authenticated` (and owner `postgres`). This is inconsistent with the intended non-exposed implementation boundary. The schema should not be considered inaccessible to API roles today.

Catalog inspection also shows direct EXECUTE grants to `authenticated` on several SECURITY DEFINER implementation functions in `clinova_private`, including content creation, review, publication and certificate issuance functions. The verifier is executable by both `anon` and `authenticated`. These grants may be necessary for the existing public wrapper path or legacy implementation, but they must be mapped and removed/refactored deliberately; do not revoke them blindly before reviewing wrapper dependencies and actual Data API exposure.

## 4. Public function ACLs

The existing public workflow wrappers are SECURITY INVOKER and have explicit EXECUTE ACLs for `authenticated` (plus `service_role` on several functions). The public certificate verifier and `has_clinova_role` are executable by `anon` and `authenticated`. Trigger-only functions such as `handle_new_clinova_user` do not show API-role EXECUTE grants in the inspected ACL.

The current function ACL output did not show a PUBLIC grantee on the inspected functions with explicit ACLs. Nevertheless, every proposed migration must explicitly inspect effective privileges including default ACL behavior; a simple revoke from `anon` and `authenticated` is not a universal substitute for reviewing `PUBLIC` inheritance.

## 5. Default privileges — confirmed high-priority finding

The current `pg_default_acl` rows show broad default grants on future objects in schema `public` for both `postgres` and `supabase_admin`:

- Tables (`r`): `anon` and `authenticated` receive `arwdDxtm` (all standard table privileges including TRUNCATE, REFERENCES and TRIGGER).
- Sequences (`S`): `anon` and `authenticated` receive `rwU`.
- Functions (`f`): `anon` and `authenticated` receive EXECUTE.

This means new public-schema objects can inherit broad API-role access unless default privileges are corrected for every actual object-creating role. The two inspected owners are confirmed; inventory all other object owners before finalizing the migration.

## 6. Implementation implications

1. Do not use the initial proposed grant SQL; it has been superseded and converted to a non-executable warning file.
2. Inventory all relation ACLs, effective role memberships, policy dependencies, function owners/ACLs, and Data API exposed schemas before constructing an allow-list.
3. Plan a staged transition from JWT metadata to database-backed role assignments. Keep a compatibility period while policies/functions are migrated.
4. Do not expose `clinova_private` via the Data API. Remove API-role schema USAGE only after confirming no RLS policy or invoker wrapper requires it.
5. Refactor private SECURITY DEFINER functions behind narrow, audited entry points where needed. Keep fixed search paths and derive the actor from `auth.uid()`.
6. Correct default ACLs for all confirmed object-creating roles; validate future object behavior in local PostgreSQL.
7. Preserve signup profile creation but ensure signup metadata cannot create role assignments.

## 7. Scope and limitation

These are catalog-level findings, not a completed exploitability assessment. They do not establish whether `clinova_private` is currently included in Supabase Data API exposed schemas, nor whether each granted function is reachable through PostgREST. No test identity was created, no RLS was bypassed, and no production privilege was changed.
