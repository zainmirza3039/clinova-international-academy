# Clinova International Academy

React, TypeScript and Vite healthcare education website. This review build includes proposed curricula, educational drafts, supplied branding and a disabled learner/auth frontend. Drafts are not confirmed courses, enrolments, CPD awards or accreditation.

## Review safety

**Do not apply the learner migration or enable learner/auth features until the owner approves the account-retention policy and hosted access checks pass.** The learner migration now blocks Auth-user deletion while learner records exist (`ON DELETE RESTRICT`); this is a protective stop, not a finished deletion/anonymization workflow. Local tests establish behavior, not hosted readiness. See [the integration review](docs/CLINOVA-ALL-UPDATES-REVIEW.md).

Auth, learner data, public enquiries and public certificate verification are forced off by `scripts/vercel-build.sh`, regardless of inherited environment values. Indexing is enabled only for the production build and disabled for previews. The learner and assessment migrations are committed as code but have **not** been applied to Supabase. A Git-triggered production deployment is READY; it did not execute SQL migrations. The public Supabase client stays nullable without configuration and never manages student sessions.

## Local checks

Use Node.js 22.12+ or Node.js 24.

```sh
npm ci --ignore-scripts
npm run typecheck
npm run lint
npm test
VITE_AUTH_ENABLED=false VITE_LEARNER_DATA_ENABLED=false VITE_ENQUIRIES_ENABLED=false VITE_INDEXING_ENABLED=false npm run build
bash scripts/test-learning-schema.sh
```

Tests use synthetic data and mocked clients. The SQL runner creates and destroys an isolated Unix-socket-only local PostgreSQL cluster; it does not connect to a hosted database. It requires PostgreSQL 16 binaries. Browser fixtures under `tests/browser` are separate from the normal application.

## Routing and publication

`vercel.json` applies security headers, serves static files first and falls back to `index.html` for application routes. Private routes are noindex, and default review builds have no public canonical origin or sitemap entries. Future publication requires a separate, explicit review of content, identity, policies, domain and hosted integration safety.

Historical documents describe earlier local snapshots and deployment attempts. The integration review is the current handoff for this branch; older test totals and deployment statuses are not evidence for the newly integrated SHA.
