# Workstream 01 — Platform foundation

## Objective
Establish a stable, testable foundation for the Clinova 48-hour MVP without changing production behaviour.

## Ownership
- Application configuration and environment validation
- Shared routing/authentication boundaries and feature-flag consistency
- Build, typecheck, lint and test reliability
- Preview-only release configuration; indexing remains disabled

## Acceptance criteria
- Existing Vite/React/TypeScript application builds reproducibly from the committed lockfile.
- Feature flags fail closed when configuration is absent.
- No secrets are exposed to the browser or committed.
- Route-level loading/error handling remains consistent.
- CI reports typecheck, lint, unit tests and production build separately.
- Preview cannot accidentally become indexable or production-targeted.

## Exclusions
No programme content, learner workflow, enrolment schema, certificate policy or admin business logic in this PR.

## Dependencies
This is the foundation lane. Other workstreams may depend on its contracts, but must avoid editing the same shared files without coordination.

## Verification
Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Record any pre-existing failures separately from introduced failures.

## Release rule
Preview only. No production deployment, domain reassignment, live Supabase migration, or indexing enablement.