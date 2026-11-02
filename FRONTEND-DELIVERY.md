# Clinova frontend delivery

> Follow-up: see [the current audit recheck and guarded student access handoff](docs/CLINOVA-AUDIT-RECHECK.md). This file records the earlier PR #3 increment; its auth and deployment-status statements are historical, not the current live deployment assessment.

This is a frontend-only, preview-safe increment. It is not a completed production full-stack application.

## Source and ownership

Repository: `zainmirza3039/clinova-international-academy`. Baseline main: `033b8cdc41cb963bf5d9f8ad2e51534ad77db78f`. This branch is stacked on PR #1 (`759299c4fea622dcfe0ea9c687e1cd211ff0b587`) to preserve its validation, enquiry payloads, tests and SPA routing. No backend worktree, schema migration, production data or unrelated resource was modified.

> **Superseded by the current feature branch:** This earlier PR #3 report described a previous opt-in enquiry implementation. In the current branch, public forms do not submit or persist, and source-level approval gates keep Auth, learner data, CMS and enquiry operations disabled regardless of environment flags. The old contract and setup instructions below are historical only; do not enable them by changing deployment variables. No hosted database or Vercel setting is changed here.

## What is available

The existing React 18 / TypeScript / Vite / npm design and public catalogue are preserved. Added admissions, application-planning, FAQs, events, faculty and community screens. Course and blog URL aliases are available. Admin paths display a locked setup screen, not an unprotected dashboard. Global draft-content disclosure, safer error fallback, keyboard skip link, Escape-to-close navigation, corrected header offset and mobile form typography are included. Invented testimonials, example certificate records, headline statistics, department course counts and unconfirmed contact addresses are removed from rendered content.

At the time of that earlier increment, programme titles, outlines, durations and CPD metadata were draft catalogue content, not verified academy offerings. Faculty, events, academy location, fees, accreditation, certificate arrangements, contact channels, policies and platform availability require client approval. Stock photographs are illustrative, not photographs of Clinova staff or facilities.

## Historical enquiry contract (not active in current source)

The table names and payload fields below document a prior interface only. This feature branch does not query or write these tables, and the source-level release lock cannot be overridden by environment variables.

Only these existing insert-only browser contracts are used:

- `contact_submissions`: `name`, `email`, `phone`, `subject`, `enquiry_type`, `message`.
- `partnership_inquiries`: `full_name`, `organisation`, `role`, `email`, `phone`, `country`, `website`, `message`.
- `newsletter_subscriptions`: `email`.

No application, course-admin, publishing, settings or authentication endpoint was invented in that earlier increment. No database read/write test or migration was performed by this current feature branch; production data, grants and schema were not changed.

## Safe configuration

All `VITE_*` values are public. Never add a service-role key or database password. The old “default-off environment flag” model is superseded: `enquiriesEnabled` is source-disabled, the forms do not load a Supabase client, and setting `VITE_ENQUIRIES_ENABLED=true` cannot activate persistence. Any future activation requires a separately approved code change, backend/privacy/security review, and end-to-end negative tests.

`VITE_SITE_URL` is intentionally blank in preview. Builds generate disallow-all robots, noindex metadata and an empty XML sitemap. Set a confirmed HTTPS academy origin only when publication is authorised; the post-build script generates canonical sitemap URLs. Admin and application routes remain noindex. This SPA uses runtime per-route metadata; server-rendered per-route social cards and genuine HTTP 404 status require a future prerender/server layer.

## Dependency security

The inherited React Router 6 tree produced two moderate production audit findings. Upgraded `react-router-dom` and `react-router` to 7.18.4; all 111 tests, lint, typecheck and build still pass. Final `npm audit --omit=dev` reports zero production dependency vulnerabilities. This is an advisory check, not a penetration test.

## Verification commands

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run preview -- --host 0.0.0.0
```

Automated tests cover migration-aligned validation, enabled mocked insert payloads/errors/duplicate pending submissions, blocked preview submissions, new page honesty/accessibility and public route rendering without credentials. Mocked contract tests are not live database evidence.

## Release checklist

| Requirement | Status | Evidence / remaining action |
| --- | --- | --- |
| Inspect current main and PR #1 | PASS | Exact baseline commits above |
| Public frontend routes and responsive design | PASS | Route tests and browser checks |
| Enquiry client contract | PASS | Existing payloads retained; mocked tests |
| Real database persistence | BLOCKED | Clinova Supabase access denied to backend owner; deployed ledger/schema unknown |
| Live application submission | BLOCKED | No approved application schema/API |
| Admin auth, roles, metrics and CRUD | BLOCKED | No checked-in supported server auth/admin contract; locked screen only |
| Content/settings persistence | BLOCKED | Requires backend contract; current draft content is repository-edited |
| Security headers and preview noindex | PASS | Vercel routing config; build-generated assets |
| Server anti-spam, rate limits and authorisation | BLOCKED | Backend work required before enabling forms |
| Public admin registration / hardcoded passwords | NOT APPLICABLE | Neither is created |
| Private file uploads | NOT APPLICABLE | No upload UI or storage provisioned |
| Full-stack live database/admin tests | NOT TESTED | No authorised live infrastructure contract |
| Production deployment / domain changes | NOT APPLICABLE | Explicitly outside authorised scope |

Only a preview branch deployment is intended. Do not merge this branch or promote it as a production-ready full-stack release until blockers are resolved and client facts/policies approved.
