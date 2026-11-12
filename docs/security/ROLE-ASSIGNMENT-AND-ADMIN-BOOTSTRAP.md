# Clinova — Role Assignment and First Administrator Provisioning

**Status:** Implementation specification; no database changes applied.
**Target:** Existing Clinova Supabase project, PostgreSQL 17.11.
**Cost constraint:** Free-tier only. No paid branch, project, or additional compute.
**Release constraint:** This document does not authorize production DDL, grants, role assignments, Auth invitations, or deployment.

## 1. Decision: database-backed authorization is authoritative

The existing `app_metadata.clinova_roles` helper is acceptable as a transitional compatibility mechanism, but it is not the long-term source of truth. The target authorization source is a protected relational role-assignment model. Auth identifies the person; the academy database determines what that person may do, in which domain, and within which scope.

Do not copy all role assignments into long-lived JWT claims as the authority. JWT claims can remain stale until refresh. Sensitive operations and RLS predicates must check active database assignments (or a carefully bounded, short-lived authorization cache with an explicit revocation strategy).

Never authorize from `user_metadata`, request-body role names, client state, URL parameters, or a caller-supplied actor UUID.

## 2. Logical relations

Keep the authorization relations in a non-exposed schema, provisionally `clinova_private`. Confirm schema existence, ownership, API exposure and current dependencies before migration.

### `roles`
- `id uuid primary key`
- `role_key text unique not null` (stable machine identifier)
- `display_name text not null`
- `description text`
- `is_privileged boolean not null default false`
- `is_assignable boolean not null default true`
- `created_at timestamptz not null`

Role keys are seeded from a reviewed catalogue. Do not let administrators create arbitrary permission-bearing role keys.

### `permissions`
- `id uuid primary key`
- `permission_key text unique not null` (for example `admissions.application.review`)
- `domain text not null`
- `action text not null`
- `description text`

### `role_permissions`
- `role_id uuid references roles`
- `permission_id uuid references permissions`
- composite primary key `(role_id, permission_id)`

### `user_role_assignments`
- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `role_id uuid not null references roles(id)`
- `scope_type text not null` (global, institution, programme, cohort, course, scheme, case)
- `scope_id uuid null` (must be null for global; required for all other scope types)
- `valid_from timestamptz not null`
- `valid_until timestamptz null`
- `revoked_at timestamptz null`
- `revoked_by uuid null references auth.users(id)`
- `grant_reason text not null`
- `created_at timestamptz not null`
- `created_by uuid not null references auth.users(id)`

Use a check constraint for the global/scope_id relationship, a valid time-window check, and a partial uniqueness strategy preventing duplicate active grants for the same user, role and scope. Do not use cascading deletion for role or assignment history.

### `role_assignment_events`
Append-only event record for proposed, approved, granted, rejected, revoked, expired and emergency-suspended assignments. Record actor, target, role, scope, reason, event time, request/correlation ID and relevant approval reference. No API role receives UPDATE or DELETE.

### `role_change_requests` (two-person control)
A privileged role change is a request, not an immediate assignment. Store requester, target, role, scope, reason, status, expiry and a distinct approver. Enforce that requester and approver differ. Super-admin grants, super-admin revocations and certification decision-maker assignments require two-person approval. The second approver must independently possess the relevant approval permission. A request expires and cannot be replayed.

### `admin_bootstrap_events`
Append-only record of the initial administrator bootstrap. Store target Auth UUID, operator identity/context, timestamp, reason/change reference, and completion state. Do not expose this relation through the Data API.

## 3. Role catalogue and separation of duties

Seed stable roles, then attach granular permissions. Roles are permission bundles, not authorization checks in application components.

- `super_admin`: narrowly controlled platform/security administration and role-governance authority.
- `academy_admin`: academy operations; cannot grant itself super-admin.
- `admissions_officer`: scoped application review and admissions decisions.
- `finance_officer`: scoped invoicing, reconciliation and approved refunds.
- `applicant`, `learner`: own records and permitted learning actions.
- `instructor`: assigned courses/cohorts and teaching functions.
- `content_author`, `clinical_reviewer`, `editorial_reviewer`, `content_publisher`: separate content lifecycle duties.
- `assessor`: assigned assessment and evidence capture.
- `eligibility_reviewer`: eligibility review for a specific certification scheme.
- `certification_decision_maker`: independent certification decisions.
- `impartiality_officer`: conflict and impartiality oversight.
- `quality_officer`: audits, controlled documents, complaints, appeals and corrective actions.
- `partner_manager`: institution- and agreement-scoped partner operations.

A role does not imply global scope. Every scoped permission check must match the relevant institution, programme, cohort, course, scheme or case. Deny by default if the scope relationship cannot be resolved.

Enforce separation-of-duties constraints in database command functions, not only in the UI:
- an author cannot review or release their own content;
- an assessor cannot make the final certification decision for the same candidate/case;
- an applicant cannot review or decide their own application;
- a finance officer cannot change academic marks or certification decisions;
- requester and approver cannot be the same person for controlled role changes;
- no ordinary administrator can elevate themselves or another user to an equal/higher privileged role.

## 4. Authorization function design

Implement a minimal permission predicate that accepts a permission key and the resource scope being checked. It must derive the subject from `auth.uid()`; it must not accept a caller-supplied user ID.

The internal lookup should:
1. reject a null `auth.uid()`;
2. join active assignments to role permissions;
3. require `valid_from <= now()`;
4. require `valid_until is null or valid_until > now()`;
5. exclude revoked assignments;
6. match global scope or the exact requested scope;
7. fail closed for unknown permission/scope types.

For RLS use, expose only a boolean-returning, narrowly scoped wrapper in the exposed schema if required. If it must be `SECURITY DEFINER`, use a fixed safe search path (prefer `pg_catalog`), fully qualify every non-system object, derive identity from `auth.uid()`, return no assignment rows or PII, and revoke function EXECUTE from `PUBLIC`, `anon` and `authenticated` before granting only the required caller role. Review function owner and RLS bypass behavior explicitly.

Do not grant API roles schema USAGE on `clinova_private` merely to make a wrapper work. A public invoker wrapper cannot call a private function if the caller lacks private-schema access; use a carefully reviewed definer boundary or an alternative policy design. Keep all implementation tables and helper functions out of exposed schemas.

For sensitive commands, re-check authorization in the same database transaction that performs the write. Do not rely solely on a prior page-load check.

## 5. First administrator: controlled, one-time procedure

The first privileged account must not be created by public signup metadata, a public RPC, a client-side secret, or an unauthenticated bootstrap endpoint.

1. The operator invites the intended person through Supabase Auth using the approved institutional email process.
2. The person completes account verification and MFA enrollment. Confirm the actual Auth UUID using a trusted administrative view; do not accept a UUID supplied in a browser request.
3. Two authorized operators verify the identity and approve the bootstrap record out-of-band.
4. A reviewed, one-time operator procedure inserts the initial assignment and append-only bootstrap event in one transaction. It runs only in a privileged administrative context and is not callable by API roles.
5. The procedure checks that no active global super-admin assignment exists and that no successful bootstrap event already exists. It aborts on either mismatch.
6. The bootstrap event and assignment commit atomically. A second execution must fail closed.
7. Remove the bootstrap procedure/capability from the normal operational path. Confirm there is no public function, trigger or signup path that can recreate privileged access.
8. Verify the new administrator can perform only the intended privileged actions and cannot bypass audit, MFA or separation-of-duties controls.

This specification does not authorize sending an invitation or assigning any real user a role.

## 6. Subsequent role changes

All later grants/revocations use a server-side command:
- authenticate the actor from the session;
- check the actor's active permission and scope in the database;
- require a reason and target;
- prevent self-elevation and equal/higher privilege grants;
- create a pending request for controlled roles;
- require a distinct eligible approver;
- apply the assignment and append event atomically;
- record expiry and revocation;
- make sensitive commands re-evaluate current assignments so revocation is effective without waiting for JWT refresh.

Use idempotency keys for retried requests. Do not permit clients to write assignment or event tables directly.

## 7. Migration sequence

1. Re-inventory current role helper, policies, triggers, grants, default privileges, schema owners and function ACLs.
2. Create role/permission/assignment/event relations in a non-exposed schema with RLS/ACL defense in depth.
3. Seed the fixed role and permission catalogue.
4. Implement the authorization predicate and test it using synthetic users in a disposable local database.
5. Migrate existing CMS roles only after mapping each legacy role to an approved new role and verifying the actual person/assignment. Do not infer privileged roles from display names or user metadata.
6. Update RLS policies and command functions domain by domain.
7. Introduce the controlled bootstrap procedure separately, after the model passes tests.
8. Remove legacy metadata-based authorization only after every dependent policy/function is migrated and regression-tested.

## 8. Required tests

Positive:
- each role can perform its explicitly granted action within its assigned scope;
- an assignment becomes active at valid_from and expires at valid_until;
- a scoped instructor/partner manager can access only their assigned resources;
- a distinct approver can approve a valid pending privileged-role request.

Negative:
- null/anonymous identity receives no permission;
- user_metadata or request payload role injection grants nothing;
- learner A cannot read learner B;
- an instructor cannot access an unassigned course/cohort;
- an institution user cannot cross tenant boundaries;
- revoked/expired assignment is denied on the next sensitive command;
- self-grant and equal/higher privilege grant are denied;
- requester cannot approve own request;
- assessor cannot issue the final certification decision for their own assessed case;
- a second bootstrap attempt fails;
- API roles cannot read/write role tables, alter assignments, update/delete event history, or invoke internal helper functions;
- no function remains executable by unintended roles through inherited `PUBLIC` privileges.

## 9. Open decisions before physical migration

- Confirm the existing `clinova_private` schema owner and whether it is already exposed.
- Confirm exact existing `has_clinova_role(text)` body, all call sites, triggers and policies.
- Confirm all roles that create objects and their default ACLs; do not assume postgres/supabase_admin are exhaustive.
- Decide the exact institution/programme/course/scheme/case scope foreign-key strategy. A generic UUID scope is flexible but requires validated scope resolution; dedicated nullable FKs or typed scope tables provide stronger referential integrity.
- Confirm MFA enforcement policy and the operational identity of the two bootstrap approvers.
- Confirm whether emergency access is needed; if so, time-box it and require post-event review.

## 10. Release gate

No production schema, grants, policies, role assignments, Auth invitations, secrets, storage, or deployment changes are made until:
- migration SQL is reviewed against the live schema and migration history;
- local PostgreSQL/Supabase tests pass;
- positive and negative RLS/ACL tests pass;
- Supabase security advisors are clean;
- rollback and backup procedures are documented;
- the user explicitly approves the specific production change.


## 11. Feature-branch implementation status (2026-11-12)

The source-only migration `supabase/migrations/20261112010000_create_database_role_authorization.sql` now implements the first authorization foundation:
- normalized roles, permissions and role-permission mappings;
- scoped, time-bounded user assignments;
- role-change request and append-only event relations;
- two-person request/approval functions exposed through narrow authenticated RPC wrappers;
- privileged-role approval checks requiring the super-admin permission;
- transaction advisory locking for concurrent grant/revoke requests;
- append-only triggers for role assignment and bootstrap audit events;
- a boolean-only permission-check wrapper that does not expose assignment rows.

The first-administrator operator template is `ops/bootstrap-first-clinova-admin.template.sql`. It requires separately verified target, operator and approver Auth identities and a one-time precondition. It is intentionally not invoked by the application.

Local test coverage is in `tests/database/role-authorization.local.sql` and is wired into `scripts/test-disposable-postgres.sh`. It covers exact-scope permission checks, expiry, metadata spoof denial, role request/approval, privileged approval separation, and immutable audit events.

**Important:** this is implementation source, not production-ready authorization cutover. Existing policies still use the legacy JWT helper. The migration deliberately preserves existing private-schema access and old RPCs to avoid breaking current content workflow triggers and invoker wrappers. Local runtime tests have not yet been executed because PostgreSQL server binaries are unavailable in the current execution environment. Do not apply this migration to the hosted project until the disposable test harness passes and the legacy-policy transition is separately reviewed.


### Initial dual-administrator bootstrap clarification

The operator template now provisions **two distinct initial super-administrator accounts in one transaction**, with a separate operator and independent approver. This avoids a governance deadlock in which a single initial super-admin cannot obtain a second super-admin approval for later privileged grants. Both initial accounts must be verified, invited through Auth and enrolled in MFA before the operator procedure is run. The template is not a public RPC and is not run by the application.
