# Clinova International Academy

React, TypeScript and Vite healthcare education website. This review build includes proposed curricula, educational drafts, supplied branding and a disabled learner/auth frontend. Drafts are not confirmed courses, enrolments, CPD awards or accreditation.

## Review safety

**Do not apply the learner migration or enable learner/auth features until the owner approves the auth-user deletion and record-retention policy.** The proposed SQL currently cascades auth-user deletion into learner records. Local tests establish behavior, not approval. See [the integration review](docs/CLINOVA-ALL-UPDATES-REVIEW.md).

Auth, learner data, public enquiries, public verification and indexing default to off. The Vercel build command explicitly keeps those five flags off, regardless of inherited environment values. No hosted migration or production deployment is part of this review. The public Supabase client stays nullable without configuration and never manages student sessions.

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
