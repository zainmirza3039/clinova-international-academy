# Clinova — Live RLS, Trigger and RPC Dependency Map

**Date:** 2026-11-12  
**Source:** Read-only PostgreSQL catalog inspection of the connected Clinova project.  
**No production changes were made.**

## 1. RLS policy baseline

The current public schema contains 48 policies (catalog audit count). Policy groups include:
- public enquiry inserts with explicit false SELECT/UPDATE/DELETE policies;
- published content reads and staff content workflow access;
- learner-owned enrolment, progress and certificate reads;
- instructor access tied to active course assignments;
- profile self access and assigned-instructor visibility;
- admin-only workflow operations using `public.has_clinova_role('content_admin')`.

### Material observations

1. Existing policy authorization is mostly role-name/JWT based. It is not yet scoped through a relational permission assignment model.
2. The broad legacy `content_admin` permission is used for admin reads/writes across content, course operations, enrolments, certificates, profiles, and enquiries. It should be split by domain before the legacy claim is retired.
3. Learner self-read policies are generally tied to `auth.uid()`; instructor access checks active assignment rows. These are useful existing boundaries, but they need full negative testing with synthetic identities.
4. Public content policies permit reads of published `content_versions.snapshot` and parent `content_items`. The snapshot is a JSON document; its public schema must be reviewed for hidden editorial fields, internal evidence references, author notes, and unpublished metadata before it is treated as a safe public projection.
5. `instructor_profiles` permits anonymous/authenticated read for public verified profiles, own profile, or legacy content admin. The table projection includes an internal Auth UUID; consider replacing public access with a deliberately limited view.
6. Certificate verification returns certificate number, learner name, course title, issue timestamp and status. A privacy/consent basis for learner-name disclosure must be established before retaining that field in the public verifier.

## 2. Trigger dependency inventory

Read-only catalog inspection found these non-internal triggers:

| Table | Trigger | Function | Purpose/next check |
|---|---|---|---|
| `content_review_decisions` | `content_review_decisions_audit` | `clinova_private.audit_review_decision()` | Append audit evidence after review insertion |
| `content_review_decisions` | `content_review_decisions_immutable` | `clinova_private.prevent_review_mutation()` | Prevent update/delete of review decisions |
| `content_versions` | `content_versions_audit` | `clinova_private.audit_content_version_change()` | Audit version lifecycle changes |
| `content_versions` | `content_versions_immutable_snapshot` | `clinova_private.prevent_content_snapshot_mutation()` | Protect immutable content snapshots |
| `content_versions` | `content_versions_set_hash` | `clinova_private.set_content_hash()` | Set content integrity hash |
| `course_instructor_assignments` | `validate_course_instructor_assignment` | `public.validate_course_instructor_assignment()` | Validate instructor assignment |
| `course_lessons` | `prevent_non_admin_lesson_publication` | `public.prevent_non_admin_lesson_publication()` | Prevent unauthorized publication |
| `instructor_profiles` | `enforce_instructor_profile_verification_evidence` | `public.enforce_instructor_profile_verification_evidence()` | Require verification evidence |

Do not revoke execution on all private functions wholesale: existing triggers depend on private functions. Any function ACL migration must preserve trigger execution and be tested.

## 3. Public RPC wrappers and private dependencies

The public content workflow wrappers are currently SECURITY INVOKER SQL functions that directly call corresponding functions in `clinova_private`:
- `archive_content_version`
- `create_content_item`
- `create_content_version`
- `publish_content_version`
- `record_content_review`
- `submit_content_for_review`
- `withdraw_content_version`
- `issue_cpd_certificate`
- `verify_cpd_certificate`

Because these wrappers are invoker functions, callers currently need schema USAGE on `clinova_private` and EXECUTE on the private functions. This explains why removing private schema USAGE immediately would break the current RPC path.

### Required safe migration order

1. Review each private implementation function body and authorization checks.
2. Convert only the required public entry points to narrowly scoped SECURITY DEFINER wrappers, explicitly owned by a trusted role, with fixed `search_path=pg_catalog` and fully qualified object references.
3. Revoke EXECUTE from PUBLIC/anon/authenticated on private implementation functions only after the new wrapper path and trigger dependencies are validated.
4. Verify all triggers continue to execute and public RPCs retain their intended caller restrictions.
5. Only then remove API-role USAGE on `clinova_private`, after confirming no other policies/views/functions require it.
6. Run positive/negative tests and verify function privilege inheritance, including PUBLIC and default ACLs.

Do not perform step 2–5 as a bulk operation.

## 4. Default ACLs

The live default ACL inventory confirms that both `postgres` and `supabase_admin` grant broad table, sequence and function privileges to `anon` and `authenticated` for new objects in `public`. Correcting these defaults must be a separate migration after verifying the complete list of object-creating roles and the required public workflows.

## 5. New role authorization migration

The feature branch now contains a source-only migration that creates:
- roles and permissions;
- role-permission mappings;
- time-bounded scoped user assignments;
- two-person role-change request records;
- append-only assignment event records;
- one-time bootstrap audit records;
- a boolean-only public permission wrapper.

The migration deliberately does not replace existing RLS policies, change legacy JWT role claims, revoke existing private-schema USAGE, or alter existing function ACLs. This avoids breaking the current content RPC and trigger dependencies while the transition is designed.

## 6. Validation status

- Live catalog inspection: completed read-only for RLS policies, trigger definitions, RPC wrappers, schema ACLs, function ACLs and default ACLs.
- Local runtime validation: not yet executed in this environment; PostgreSQL server binaries are not installed in the current execution container.
- Hosted runtime validation: intentionally not attempted against production.
- Production migration: not applied.

Next gate: install/use local free PostgreSQL tooling in a non-production environment, run the disposable harness, then extend tests to existing content and learner workflows before proposing the least-privilege cutover migration.
