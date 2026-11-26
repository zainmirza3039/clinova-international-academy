# Workstream 04 — Learner accounts

## Objective
Provide a secure learner sign-in and account foundation for the MVP.

## Ownership
- Supabase Auth integration and session lifecycle
- Registration, sign-in, sign-out, password reset and session recovery
- Learner profile read/update boundaries
- Protected learner dashboard shell and role checks
- Safe loading, error and unauthenticated states

## Acceptance criteria
- Authentication is functional only when explicitly enabled with valid configuration.
- Protected routes reject unauthenticated users and unauthorized roles.
- Learners can access only their own private profile data.
- No service-role key or privileged credential is shipped to the browser.
- Auth state survives refresh and handles expired sessions.
- Tests cover access control and common auth failure paths.

## Exclusions
No enrolment state machine, course progress, assessment grading, certificate issuance or admin management.

## Dependencies
Platform contracts from Workstream 01. Coordinate shared Supabase client and route changes before editing.

## Verification
Auth unit/integration tests, protected-route tests, typecheck, lint and build. Live database validation requires authorized non-production access.