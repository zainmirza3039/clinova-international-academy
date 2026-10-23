# Clinova implementation and release checklist

## Integrated into main (still feature-gated)

- [x] Audit the React/Vite repository, public routes, SEO, existing migrations, and deployment safeguards.
- [x] Preserve existing public routes and synchronize the static route manifest.
- [x] Keep programme/CPD catalogue and learning content clearly marked as proposed until owner approval.
- [x] Remove fabricated learner dashboard metrics and hardcoded public certificate records.
- [x] Add a default-off Supabase Auth frontend foundation for sign-in, sign-up, password recovery, and protected student routes.
- [x] Add a default-off learner read/progress integration with safe loading, empty, error, and unavailable states.
- [x] Add learner foundation and assessment schema proposals with RLS, explicit grants, private answer keys, and disposable PostgreSQL regression tests.
- [x] Force auth, learner data, enquiries, and public certificate verification off in production build configuration until their release gates are approved.

## Integrated into main: assessment workflow wiring

- [x] Add authenticated, owner-bound RPCs for starting assessment attempts and submitting validated responses.
- [x] Add SQL regression coverage for attempt limits, invalid payloads, duplicate/cross-user protections, and submission state.
- [x] Run the extended disposable PostgreSQL schema suite and all frontend CI checks (GitHub Actions run 39923211421 passed).
- [x] Review and merge assessment workflow PR #16; learner/auth feature flags remain off and no database migration was applied.

## Remaining launch blockers

- [ ] Confirm an approved non-production Supabase target; do not apply learner migrations to production.
- [ ] Reconcile the public-enquiry migration ledger/schema mismatch without blindly replaying SQL.
- [ ] Apply and verify learner/assessment migrations in the approved non-production target; check actual grants, RLS and RPCs through PostgREST using at least two test accounts.
- [ ] Implement trusted grading, free-text assessor marking, attempt review, audit logging, staff authorization, and certificate issuance/revocation.
- [ ] Decide account deletion, learner-record retention, export and anonymization policy before enabling learner accounts.
- [ ] Configure Supabase Auth email delivery, verified sender, callback allowlist, password reset and confirmation flows using test accounts.
- [ ] Obtain academy and qualified legal approval for privacy/terms/cookie/refund wording; unapproved claims have been removed from source drafts. Confirm contact channels, enquiry processing, retention and notifications.
- [ ] Add approved, real course/module/lesson/assessment content; confirm duration, CPD hours, awards, pricing and accreditation before making public claims.
- [ ] Verify newsletter consent, unsubscribe and delivery handling before enabling subscriptions.
- [ ] Complete hosted browser/accessibility QA and a two-account authorization test on the approved non-production environment.
- [ ] Obtain separate approval before enabling production features, merging a release, or deploying production.
