# Clinova Preview: request rejected, nothing deployed

The default-off learner frontend is implemented and locally verified at app source commit `fc0995317e3ff5815901fee3663f8b2935d25298` on `feat/clinova-local-learner-ui`. PR #4 remains unchanged at `4ae53c2382541b6f8a4e7c804d0ace57c5e60f94`. The owner subsequently authorised an explicit Preview deployment only; no Production or branch-push fallback was authorised.

## Exact deployment blocker

A single `POST /v13/deployments` request used:

- Project: `prj_zurasqRt9svFH1F9JGhXxve5C8WR` / `clinova-international-academy`.
- Team: `team_J2SEYRfmaWXwhvx7IpC1EXA2`.
- Target: explicitly `preview`.
- Source metadata: local integration SHA above, branch `feat/clinova-local-learner-ui`, `dirty: true` to disclose additional deployment-bootstrap files.
- No `gitSource`, project settings, aliases, paid build machine or production target.

Vercel rejected the request with **HTTP 400 `bad_request`**:

> Invalid request: `target` should be 'production', 'staging', or a custom environment identifier.

Request ID: `iad1:sfo1::7p9fb-1792663400238-c667e6566f73`.

The tool description says an omitted target defaults to Preview, but the owner required an explicit Preview target. We therefore **did not omit the target, substitute `staging`, create a custom environment, repeat creation, push a branch or change settings**. A subsequent exact-project/SHA deployment query returned zero results. There is no new deployment ID, URL, build status or hosted test result to provide. The available Vercel CLI was absent, and a saved-token lookup found no match; no login or new credential was requested.

## Access and safety checks

This task’s Vercel read access works; the earlier coordinator 403 is not the current blocker. Project metadata confirmed the correct Clinova project, Vite and Node 24. Existing SSO protection is enabled for `all_except_custom_domains`; it was not changed or bypassed. No protected URL was opened using a bypass link.

Existing deployment metadata includes Production deployment `dpl_BMaYjgA62VFeHf2F4JDy481Yj2h6` from the old feature branch `feat/clinova-frontend-completion`, commit `759019cd95200c7ff118424399e15ccb5632a039`. This is an existing deployment, **not created by this task**. Its presence reinforces why a branch push was not an acceptable Preview-only workaround. No Production deployment or alias was touched.

Project environment metadata was read without decryption: only the existing Supabase URL and browser-key entries were listed for Production/Preview. No feature flags, domain-origin variables or environment entries were added/changed.

## Locally verified source payload

To avoid a branch push, an internal four-file deployment bootstrap was prepared at `/workspace/clinova-preview-payload-fc099.mOlz`:

`package.json`, `hydrate.mjs`, `local.patch.gz`, `source-hashes.json`.

It fetches the exact public [baseline GitHub commit](https://github.com/zainmirza3039/clinova-international-academy/tree/4ae53c2382541b6f8a4e7c804d0ace57c5e60f94), applies the local app patch and verifies SHA-256 hashes for all 94 app-build files before copying only those files. Docs, tests, SQL and archive extras are excluded. The original package and lockfile are restored before installation/build. The child build explicitly forces auth, enquiries, learner data and indexing false without touching `VITE_SITE_URL`, canonical configuration or the repository deployment guard.

The four files total 20,035 bytes. Source-manifest SHA-256: `ac358dd4630a8bfdc1ea50b98390c2aba3fd06c14236797119da8682ff489626`.

An exact disposable bootstrap build passed locally, including source verification, dependency installation, Vite build and postbuild preview safeguards: noindex, disallow-all robots, empty sitemap, no synthetic harness fixtures. The rejected API request never reached a hosted build, so this pipeline is **not Vercel-build-verified**.

## What the QA proves—and does not

The main integration has 268 passing frontend tests, a passing default-off build, 34 passing disposable PostgreSQL assertions and local browser checks for public draft pages, disabled real student/auth routes, synthetic loading/empty/error/reading/completion states, and 375px/768px synthetic dashboard iframe viewports. See [the implementation handoff](CLINOVA-LOCAL-LEARNER-INTEGRATION.md) for files and coverage.

None of this is hosted student E2E. Clinova’s latest metadata shows no learner tables and an empty migration ledger despite the prior manual enquiry-migration report. No repair or live migration was attempted. Auth redirects/callbacks, hosted RLS/PostgREST, real persistence, abuse controls and multi-account behavior remain unverified. Retention/CASCADE deletion and inherited own-profile-write policy remain unresolved launch blockers. All real learner/auth/enquiry/indexing features stay off; educational content stays draft.

A future attempt needs an approved, supported explicit-Preview deployment path. Do not silently reinterpret this failed request as permission to omit/change its target, bypass SSO, enable features or use Production.
