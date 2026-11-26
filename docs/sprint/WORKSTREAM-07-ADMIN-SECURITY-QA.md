# Workstream 07 — Admin, security and release QA

## Objective
Give authorized academy staff the minimum operational controls required for the MVP and establish a defensible preview release gate.

## Ownership
- Admin role checks and least-privilege access
- Review of Supabase RLS, grants, RPCs, edge functions and migrations
- Enquiry/application review and programme publication controls
- Audit history for privileged actions and certificate decisions
- Cross-workstream regression, accessibility and security testing
- Preview deployment verification and release checklist

## Acceptance criteria
- Admin access is enforced server-side/database-side, not only by hiding UI.
- Sensitive instructor evidence, learner records and private submissions are not exposed to ordinary authenticated users.
- Public certificate verification reveals only approved fields and immutable issuance data.
- Migrations are ordered, idempotent where practical and tested on disposable/non-production PostgreSQL.
- All seven workstreams pass agreed checks before integration.
- Preview is READY and verified; production remains untouched.

## Exclusions
No production migration, production deployment, domain changes or indexing enablement without separate explicit approval.

## Dependencies
Reviews and integrates the security contracts of Workstreams 01–06. This lane owns cross-cutting security review but should not silently rewrite other lanes' business logic.

## Verification
RLS/grant tests, migration tests, role-boundary tests, regression suite, accessibility checks and preview smoke tests.