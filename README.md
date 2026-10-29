# Clinova International Academy

Public healthcare education enquiry website built with React, TypeScript and Vite. This repository is not a student portal or LMS.

## Local checks

Use Node.js 22.12+ (or Node.js 24) for the test tooling.

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

Tests use a mocked Supabase client and synthetic form values. They do not contact a database or require environment variables. The routing test checks the Vercel fallback configuration; hosted deep-link behavior still needs verification after deployment.

## Separate Clinova deployment

`vercel.json` serves existing static files first and falls back to `index.html` for React Router URLs. It contains no project IDs, domains or environment values.

Before enabling real submissions, the owner must approve a separate Clinova Supabase project, organisation, region and plan/cost. Apply the existing migration only to that approved project, then configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the separate Clinova deployment. These steps are not performed by this code change. Never use a service-role key in frontend code or reuse another project's credentials.

The existing client throws when Supabase configuration is missing, so a preview without those values is not a functioning enquiry site even if its build succeeds. A successful insert stores an enquiry; this repository does not implement email delivery or newsletter sending. Confirm existing domain, email and content claims with the owner before launch.
