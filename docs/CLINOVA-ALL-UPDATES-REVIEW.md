# Clinova: all remaining updates for review

## Decision required before any learner launch

**Do not apply `20261022090000_create_learning_foundation.sql`, enable auth/learner data, or treat this review as launch approval.** The migration now uses `ON DELETE RESTRICT` for Auth-user foreign keys, preventing accidental loss of profiles, enrolments, progress, assessment records and certificates. This is a fail-closed safeguard, not a final deletion/retention workflow. The owner must still approve the lawful retention/export/deletion policy, review composite enrolment/assessment/certificate relationships and own-profile-write permissions, and implement any required anonymization process. Do not infer launch readiness from passing SQL tests. The migration remains unapplied.

## What was integrated

The integrated homepage, programme/CPD pages and data, legal/contact/partner content, verification, branding, SEO, routing and dependency updates were introduced on the historical review branch `review/clinova-all-updates-20261022` and reconciled into `main` before this assessment-schema proposal. Main's deletion of the testimonials file is retained. Draft article cards live in `resourceDrafts.ts`, not a resurrected testimonials module. Main's existing editorial article routes remain available as clearly labelled review snapshots alongside the fifteen educational drafts. Proposed programme and CPD curricula, study resources and default-off learner frontend are included.

Publication-only exports remain publication-only. Explicit review catalogue exports expose draft outlines without relabelling them as published. Course availability, duration, CPD hours, awards, accreditation, enrolment and checkout are not confirmed. Existing public certificate lookup functionality remains behind a separate, default-off approval flag, rather than being removed or silently enabled.

## Review build safeguards

- Auth, learner data, enquiries, indexing and public verification are explicitly forced off by the repository's Vercel build command, even if inherited environment values are true.
- Security headers, server-side `X-Robots-Tag: noindex, nofollow`, static-file-first handling and SPA fallback are present. Review SEO generates no public sitemap entries or canonical origin.
- Main's nullable public Supabase client behavior is preserved. That client cannot persist, refresh or recover student sessions; only the separately gated AuthProvider owns student auth.
- The local patched React Router 7.18.4 dependency is retained. The review notes that reverting to the previous major version produced moderate npm audit findings; dependency changes should remain covered by CI.
- Supplied logo-only PNG files are preserved at their original public paths, alongside the optimized shared brand assets used across navigation, footer, error states, icons and social metadata.

## Verification status

GitHub Actions run [39872609985](https://github.com/zainmirza3039/clinova-international-academy/actions/runs/39872609985) passed for commit `5b37f8a14d79a1d8c3609e2022c42c2f34267ab6`: `npm ci`, TypeScript typecheck, 295 tests across 20 test files, ESLint, and production build with auth, learner data, enquiries, verification and indexing disabled. The corresponding code-scanning AI findings run also completed successfully: [39872613103](https://github.com/zainmirza3039/clinova-international-academy/actions/runs/39872613103).

These checks establish build and test behavior, not production readiness. The isolated PostgreSQL learner-schema suite previously passed using a disposable Unix-socket-only cluster with synthetic fixtures and cleanup; this is not hosted RLS/PostgREST verification or migration approval.

Regression coverage includes deployment gate overrides, server noindex/SPA safeguards, logo asset presence, nullable public client and disabled public-client auth sessions, certificate verification gating, draft discoverability and preservation of current-main article routes.

## Boundaries and remaining verification

The assessment-schema proposal is under review in [PR #13](https://github.com/zainmirza3039/clinova-international-academy/pull/13). No production database migration or live database write is included. This PR's changes are limited to reviewable schema SQL, isolated PostgreSQL tests, CI wiring and documentation; learner/auth/enquiry/verification flags remain disabled. Historical CI run links above refer to the earlier frontend baseline, not the current PR head; use the checks on PR #13 for current verification. Do not merge or apply hosted migrations until current checks pass and the retention, staging-access and backend-readiness blockers are resolved.

Hosted auth, email/recovery, real learner persistence, multi-account RLS, abuse controls, accessibility and end-to-end UI verification remain launch work. Confirm live email delivery, contact channels, legal policy text, public SEO/indexing and production environment configuration before enabling services. Do not enable features merely because CI or a Preview build passes.
