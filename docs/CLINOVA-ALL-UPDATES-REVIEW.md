# Clinova: all remaining updates for review

## Decision required before any learner launch

**Do not apply `20261022090000_create_learning_foundation.sql`, enable auth/learner data, or treat this review as launch approval.** The proposed schema still contains Auth-user `ON DELETE CASCADE` relationships. The owner must decide what happens to profiles, enrolments, completion, assessment and certificate records when an account is deleted: delete, retain under a lawful policy, or anonymize. Review the composite enrolment/assessment/certificate relationships and their deletion behavior too; do not infer a retention policy from passing SQL tests. Existing own-profile-write permissions also need explicit review. The migration is retained unchanged as a proposal, not applied.

## What was integrated

A new review branch starts at current main `2870b97deb61ffa5d824dcf145f7e12de3c09f22` and integrates the remaining local work through `f6208a5c8968cc5a1fd292160077bb32a25e2084`. The separate logo-only source `0f2c8e68ba5f4fef24cc011421701ffeec28b143` is included through its exact supplied PNG assets and equivalent shared-component/icon/social integration; it is not a replacement of current main.

Conflicts were reconciled in the homepage, programme/CPD pages and data, legal/contact/partner content, verification, branding, SEO, routing and dependency lockfile. Main's deletion of the testimonials file is retained. Draft article cards now live in `resourceDrafts.ts`, not a resurrected testimonials module. Main's existing editorial article routes remain available as clearly labelled review snapshots alongside the fifteen educational drafts. Proposed programme and CPD curricula, study resources and default-off learner frontend are included.

Publication-only exports remain publication-only. Explicit review catalogue exports expose draft outlines without relabelling them as published. Course availability, duration, CPD hours, awards, accreditation, enrolment and checkout are not confirmed. Existing public certificate lookup functionality remains behind a separate, default-off approval flag, rather than being removed or silently enabled.

## Review build safeguards

- Auth, learner data, enquiries, indexing and public verification are explicitly forced off by the repository's Vercel build command, even if inherited environment values are true.
- Security headers, server-side `X-Robots-Tag: noindex, nofollow`, static-file-first handling and SPA fallback are present. Review SEO generates no public sitemap entries or canonical origin.
- Main's nullable public Supabase client behavior is preserved. That client cannot persist, refresh or recover student sessions; only the separately gated AuthProvider owns student auth.
- The local patched React Router 7.18.4 dependency is retained. Keeping main's version 6 introduced two moderate npm audit findings; restoring the existing local patch removes those production dependency findings.
- Supplied logo-only PNG files are preserved at their original public paths, alongside the optimized shared brand assets used across navigation, footer, error states, icons and social metadata.

## Local checks

The integrated application passes 301 unit/component/regression tests across 19 files, TypeScript, production build and lint (zero errors; four existing AuthProvider fast-refresh warnings). Production dependency audit reports zero findings. The isolated PostgreSQL learner-schema suite passes, using a disposable Unix-socket-only cluster with synthetic fixtures and cleanup; this is not hosted RLS/PostgREST verification or migration approval.

New regression checks cover deployment gate overrides, server noindex/SPA safeguards, logo asset presence, nullable public client and disabled public-client auth sessions, certificate verification gating, draft discoverability and preservation of current-main article routes.

## Boundaries and remaining verification

This is for a new draft PR only. Existing PR branches are not overwritten or force-pushed. No remote-main merge, Production deployment, promotion, alias/domain/DNS/project-setting change, hosted migration or live database write is included. No unrelated application was modified.

Any Git-triggered Preview belongs to the review SHA, not an older deployment. Its actual status is reported in the PR handoff; older deployment records in historical documents do not prove this branch's status. Hosted auth, email/recovery, real learner persistence, multi-account RLS, abuse controls, accessibility and end-to-end UI verification remain launch work. Do not enable features merely because local tests or a Preview build pass.
