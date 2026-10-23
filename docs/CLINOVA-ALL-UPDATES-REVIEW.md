# Clinova: all remaining updates for review

## Decision required before any learner launch

**Do not apply `20261022090000_create_learning_foundation.sql`, enable auth/learner data, or treat this review as launch approval.** The migration now uses `ON DELETE RESTRICT` for Auth-user foreign keys, preventing accidental loss of profiles, enrolments, progress, assessment records and certificates. This is a fail-closed safeguard, not a final deletion/retention workflow. The owner must still approve the lawful retention/export/deletion policy, review composite enrolment/assessment/certificate relationships and own-profile-write permissions, and implement any required anonymization process. Do not infer launch readiness from passing SQL tests. The migration remains unapplied.

## What was integrated

The integrated homepage, programme/CPD pages and data, legal/contact/partner content, verification, branding, SEO, routing and dependency updates were introduced on the historical review branch `review/clinova-all-updates-20261022` and reconciled into `main` before this assessment-schema proposal. Main's deletion of the testimonials file is retained. Draft article cards live in `resourceDrafts.ts`, not a resurrected testimonials module. Main's existing editorial article routes remain available as clearly labelled review snapshots alongside the fifteen educational drafts. Proposed programme and CPD curricula, study resources and default-off learner frontend are included.

Publication-only exports remain publication-only. Explicit review catalogue exports expose draft outlines without relabelling them as published. Course availability, duration, CPD hours, awards, accreditation, enrolment and checkout are not confirmed. Existing public certificate lookup functionality remains behind a separate, default-off approval flag, rather than being removed or silently enabled.

## Review build safeguards

- Auth, learner data, enquiries and public verification are explicitly forced off by the repository's Vercel build command, even if inherited environment values are true. Indexing is enabled only for the production build; preview builds keep indexing disabled.
- Security headers, server-side `X-Robots-Tag: noindex, nofollow`, static-file-first handling and SPA fallback are present. Review SEO generates no public sitemap entries or canonical origin.
- Main's nullable public Supabase client behavior is preserved. That client cannot persist, refresh or recover student sessions; only the separately gated AuthProvider owns student auth.
- The local patched React Router 7.18.4 dependency is retained. The review notes that reverting to the previous major version produced moderate npm audit findings; dependency changes should remain covered by CI.
- Supplied logo-only PNG files are preserved at their original public paths, alongside the optimized shared brand assets used across navigation, footer, error states, icons and social metadata.

## Verification status

Historical GitHub Actions run [39872609985](https://github.com/zainmirza3039/clinova-international-academy/actions/runs/39872609985) passed for the earlier frontend commit `5b37f8a14d79a1d8c3609e2022c42c2f34267ab6`; it is not evidence for the latest schema changes. The follow-up choice-validation changes passed CI in run [39879769588](https://github.com/zainmirza3039/clinova-international-academy/actions/runs/39879769588) for commit `59fd0caaa062b0cba136f82fb7e6e63ef266a0db`: disposable PostgreSQL schema tests, TypeScript typecheck, application tests, lint, and the forced-off build all succeeded. Re-run these checks for any subsequent code changes.

These checks establish build and test behavior, not production readiness. The isolated PostgreSQL learner-schema suite previously passed using a disposable Unix-socket-only cluster with synthetic fixtures and cleanup; this is not hosted RLS/PostgREST verification or migration approval.

Regression coverage includes deployment gate overrides, server noindex/SPA safeguards, logo asset presence, nullable public client and disabled public-client auth sessions, certificate verification gating, draft discoverability and preservation of current-main article routes.

## Follow-up assessment workflow review (2026-10-23)

PR #16 merged `20261023030000_add_assessment_attempt_workflows.sql` with authenticated RPCs for owner-bound attempt creation and validated response submission, plus `tests/sql/assessment-workflows.sql` for attempt-limit, invalid-payload, duplicate/cross-user and submission-state regression coverage. The schema test runner invokes this suite. CI run [39923211421](https://github.com/zainmirza3039/clinova-international-academy/actions/runs/39923211421) passed the disposable PostgreSQL suite, typecheck, application tests, lint and forced-off build. The RPCs do not grade attempts, mark free-text responses, grant staff privileges, or issue certificates. No live database was changed.

## Boundaries and remaining verification

Schema foundation and assessment migrations were merged into `main` by [PR #13](https://github.com/zainmirza3039/clinova-international-academy/pull/13), and assessment attempt workflows by [PR #16](https://github.com/zainmirza3039/clinova-international-academy/pull/16). Production deployment `dpl_EqQkmMLGmmsnyf1bmesD3omLqNax` for commit `bcefc0693673d694ad25fb579b9c0b9886b240fb` is READY. The deployment did not execute SQL. Live Supabase remains unchanged: only the three enquiry tables are present, and learner/auth/enquiry/verification flags remain off. The schema review is code-only until a safe non-production target is available; no learner migration should be applied to production.

Hosted auth, email/recovery, real learner persistence, multi-account RLS, abuse controls, accessibility and end-to-end UI verification remain launch work. Confirm live email delivery, contact channels, legal policy text, public SEO/indexing and production environment configuration before enabling services. Do not enable features merely because CI or a Preview build passes.


## Legal draft hardening (2026-10-23)

The source policy drafts were revised to remove unapproved refund deadlines, eligibility thresholds, cookie/analytics assertions, privacy guarantees, and claims that certificates or accreditation are promised. Public legal routes continue to display the explicit policy-unavailable notice rather than rendering these source drafts. Regression tests guard against reintroducing those unsupported claims. These drafts still require academy and qualified legal review before publication.
