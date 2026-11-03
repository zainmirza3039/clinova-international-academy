# Clinova International Academy

Clinova public information site with programme and certification-development status pages. Learner, admin, certificate, verification and enquiry workflows are not operational in this release.

## Local checks

Use Node.js 22.12+ (or Node.js 24) for the test tooling.

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

The Vitest suite uses mocked clients and synthetic form values; it does not contact a database or require hosted credentials. The optional `npm run test:db:local` script creates and destroys a disposable local PostgreSQL cluster to exercise synthetic row-security and certificate-lifecycle cases. Hosted deep-link and production behavior are not exercised by those checks.

## Deployment and data boundaries

`vercel.json` serves existing static files first and falls back to `index.html` for React Router URLs. It contains no project IDs, domains or environment values.

Public enquiry forms do not submit or persist data in this release. The `enquiriesEnabled` control is source-disabled regardless of `VITE_ENQUIRIES_ENABLED`; adding Supabase URL/anon-key variables or setting the flag does not activate submissions. Auth, learner data, CMS operations, certification, issuance and live verification are also source-disabled. Current public pages do not need Supabase credentials.

Any future workflow activation requires a separate code change after owner, backend, privacy and security approval, confirmation of the target environment and database policy, and end-to-end negative testing. Do not apply or replay migrations as part of this branch. Never use a service-role key in frontend code. Confirm legal identity, domain, email and public-content claims with the owner before any launch decision.
