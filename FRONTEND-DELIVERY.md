# Clinova frontend delivery

> Follow-up: see [the current audit recheck and guarded student access handoff](docs/CLINOVA-AUDIT-RECHECK.md). This file records the earlier PR #3 increment; its auth and deployment-status statements are historical, not the current live deployment assessment.

This is a frontend-only, preview-safe increment. It is not a completed production full-stack application.

## Source and ownership

Repository: `zainmirza3039/clinova-international-academy`. Baseline main: `033b8cdc41cb963bf5d9f8ad2e51534ad77db78f`. This branch is stacked on PR #1 (`759299c4fea622dcfe0ea9c687e1cd211ff0b587`) to preserve its validation, enquiry payloads, tests and SPA routing. No backend worktree, schema migration, production data or unrelated resource was modified.

## What is available

The existing React 18 / TypeScript / Vite / npm design and public catalogue are preserved. Added admissions, application-planning, FAQs, events, faculty and community screens. Course and blog URL aliases are available. Admin paths display a locked setup screen, not an unprotected dashboard. Global draft-content disclosure, safer error fallback, keyboard skip link, Escape-to-close navigation, corrected header offset and mobile form typography are included. Invented testimonials, example certificate records, headline statistics, department course counts and unconfirmed contact addresses are removed from rendered content.

Programme titles, outlines, durations and CPD metadata are existing draft catalogue content, not verified academy offerings. Faculty, events, academy location, fees, accreditation, certificate arrangements, contact channels, policies and platform availability require client approval. Stock photographs are illustrative, not photographs of Clinova staff or facilities.

## Checked-in enquiry contract

Only these existing insert-only browser contracts are used:

- `contact_submissions`: `name`, `email`, `phone`, `subject`, `enquiry_type`, `message`.
- `partnership_inquiries`: `full_name`, `organisation`, `role`, `email`, `phone`, `country`, `website`, `message`.
- `newsletter_subscriptions`: `email`.

No application, course-admin, publishing, settings or authentication endpoint is invented. The existing migration is preserved, but its deployed state is unverified. No database read/write test or migration was performed.

## Safe configuration

Use `.env.example`; all `VITE_*` values are public. Never add a service-role key or database password. Without configuration the full public site still renders: the Supabase client is loaded only after an explicitly enabled enquiry submission. Keep `VITE_ENQUIRIES_ENABLED=false` until the backend owner verifies Clinova access, the deployed schema and policies, server-side validation, persistent rate limits/spam controls and actual persistence. A client-side flag is a release safeguard, not a security control.

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
