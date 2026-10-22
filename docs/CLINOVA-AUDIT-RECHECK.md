# Clinova: audit recheck and guarded student access

Historical review snapshot for the original frontend-only increment. It is not the latest backend status. For the read-only Supabase inventory, source-only learner migrations, role-gated admin panel and current release blockers, see [SUPABASE-IMPLEMENTATION-STATUS.md](./SUPABASE-IMPLEMENTATION-STATUS.md). Authentication, enquiries, learner data and indexing remain off by default; no production deployment or live database schema change has been made.

## What the recheck confirmed

The live GitHub `main` was `033b8cdc41cb963bf5d9f8ad2e51534ad77db78f`. PR [#1](https://github.com/zainmirza3039/clinova-international-academy/pull/1) remained open at `759299c4fea622dcfe0ea9c687e1cd211ff0b587`. PR [#3](https://github.com/zainmirza3039/clinova-international-academy/pull/3) remained open at `759019cd95200c7ff118424399e15ccb5632a039`, stacked on #1. PR #2 also remained open using the same head as #3 but targeting main; reviewers should avoid merging overlapping deliveries twice.

The existing clean frontend worktree was preserved. During implementation, another worker added a different auth module and proposed migration in the first new worktree. Those edits were left intact. This delivery was moved to `/workspace/clinova-safe-auth-Sh2gdLt`, branch `feat/clinova-safe-auth-Sh2gdLt`, based on #3. No new migration is included. Coordinate the competing auth work before merging either implementation.

Vercel API access now works for the existing Clinova project `prj_zurasqRt9svFH1F9JGhXxve5C8WR`. It reported `dpl_BMaYjgA62VFeHf2F4JDy481Yj2h6` READY at `https://clinova-international-academy-3ejr4brht-zainmirza3039s-projects.vercel.app`, source `redeploy`, target **production**, mapped to PR #3's exact head. This is not accurately described as only a preview. The old supplied `pg7jii3dk` URL still redirects HTTP 302 to Vercel SSO. SSO protection is enabled for all except custom domains. No browser sign-in or protection bypass was attempted.

The canonical `clinovaacademy.co.uk` still failed DNS resolution (`socket.gaierror: [Errno -2] Name or service not known`). Its ownership and publication intent remain unconfirmed. No replacement domain was invented; `clinovaacademy.com` was not used.

The authorized Supabase inventory did not expose the Clinova project at the initial check. The backend developer subsequently reported that Clinova's public schema was empty and the existing three-table enquiry migration has now been applied; RLS/access checks are still pending. That is a coordination update, not independent proof of persistence. This task made no database requests or live auth calls, read no learner/applicant/patient rows, and did not repeat the migration.

## Findings and action

| Severity | Confirmed issue and affected area | Action / remaining limitation |
| --- | --- | --- |
| Critical | None confirmed within this bounded source and public-access review. | This is not a penetration test or proof that no critical issue exists. |
| High | No dedicated student auth/session/protected-dashboard foundation in main or PR #3 (`src/App.tsx`). | Added an off-by-default Supabase Auth foundation with guarded student routes and honest unavailable/empty states. Live identity flows remain unverified. |
| High | Latest Vercel deployment is production-targeted despite earlier preview-only descriptions. | No deployment changed. Added `git.deploymentEnabled` **only for this review branch**, set false, before pushing. Branch-level behavior follows [Vercel's official Git configuration](https://vercel.com/docs/project-configuration/git-configuration). |
| High | Existing public enquiry INSERT policies have no server abuse/rate controls. Migration has no explicit GRANT statements; effective privileges were not independently verified. | Enquiries remain disabled. Backend owner must verify permissions/RLS and persistent anti-spam/rate controls before enablement. A frontend flag is not a security boundary. |
| High, development tooling | Fresh full `npm audit` reported 9 inherited findings: 6 high, 3 moderate in the Vite/Tailwind/transitive development tree. | No force/major upgrade was attempted because it could disrupt the preserved build/design. Production-only audit reports 0. Update tooling in a separately reviewed dependency PR; do not expose the dev server to untrusted networks. |
| Medium | Unknown URLs could become indexable when a site origin was set (`NotFoundPage`, `useSEO`). | Explicit noindex for 404s; genuine HTTP 404 responses still require a server/prerender strategy. |
| Medium | Aliases could create separate canonical URLs; auth/private routes needed noindex handling (`useSEO`). | `/courses` canonicalizes to `/programmes`; `/blog` and `/announcements` to `/resources`. Auth/student/admin/application routes omit canonical, OG URL and structured data and stay noindex. |
| Medium | A configured site URL alone could publish unapproved draft catalogue content; preview origins were accepted (`siteConfig`, SEO generator). | Separate `VITE_INDEXING_ENABLED=false` gate; reject preview hostnames and credential/query/fragment origins; blank origin remains the default. Owner approval is still a human release requirement. |
| Medium | Catalogue dropdown labels were not associated; same-page programme query navigation left type state stale (`ProgrammesPage`, `CPDCoursesPage`). | Added explicit label/control IDs; URL-backed programme type follows navigation and validates supported values. |
| Medium | Mobile menu Tab navigation could reach background controls (`Header`). | Tab boundary handling, Escape focus return, menu control association and submenu expanded state added. Browser and unit checks performed; not a full screen-reader audit. |
| Low | Newsletter policy text was not linked and promised unimplemented delivery/unsubscribe behavior (`NewsletterForm`). | Linked draft policy; removed unsupported delivery promise and disclosed missing unsubscribe arrangements. |
| Low | Proposed online platform and fictional dashboard metrics could be mistaken for current functionality (`OnlineLearningPage`). | Retained useful illustration, but explicitly identified example enrolments, CPD hours, certificates and progress as fictional before the dashboard. Verification remains unavailable and never returns fake verified records. |
| Low | Four newly introduced Fast Refresh lint warnings in the provider module. | Non-blocking development-only component/helper co-location warnings, reported rather than called pre-existing. No lint errors. |

## What now works in the frontend

Routes `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` and `/student/*` use the existing React, TypeScript, React Router and Supabase stack. The provider handles session loading, stored sessions, auth event subscription/cleanup, sign-out and failures. Recovery password updates require a recovery event/session and use the actual `/reset-password` route. Return targets are limited to safe student paths. Duplicate form submissions are blocked while pending.

Both auth and enquiries are restricted to the confirmed Clinova project origin; another project's URL cannot enable them. No admin API, profile-table lookup, enrolment API, assessment/video/payment implementation or certificate issuance was invented. The student dashboard shows session identity only when configured and signed in, with clearly unavailable profile, enrolment, progress and certificate sections. A client route guard is not database authorization.

## Exact files changed in this increment

| File | Purpose |
| --- | --- |
| `.env.example` | Document default-off auth and publication flags without credentials. |
| `src/App.tsx` | Provider wiring and dedicated auth/protected student routes. |
| `src/auth/AuthProvider.tsx` | Strict project configuration, session lifecycle, auth operations, recovery guard and protected route. |
| `src/pages/AuthPage.tsx` | Accessible auth/recovery screens, validation, pending/error/success states and safe redirects. |
| `src/pages/StudentDashboardPage.tsx` | Session-only dashboard, honest missing-data sections and sign-out. |
| `src/components/Header.tsx` | Student access navigation and mobile keyboard behavior. |
| `src/components/NewsletterForm.tsx` | Linked draft policy and honest subscription copy. |
| `src/pages/ProgrammesPage.tsx` | Accessible filters and query synchronization. |
| `src/pages/CPDCoursesPage.tsx` | Associated filter labels. |
| `src/pages/OnlineLearningPage.tsx` | Explicitly proposed features and fictional example data. |
| `src/pages/NotFoundPage.tsx` | Explicit 404 noindex. |
| `src/hooks/useSEO.ts` | Private-route exclusions, duplicate alias canonicals, explicit noindex and social metadata cleanup. |
| `src/lib/siteConfig.ts` | Publication approval gate, preview origin rejection and Clinova enquiry boundary. |
| `scripts/generate-seo.mjs` | Matching build-time release gate and auth/student robots exclusions. |
| `vercel.json` | Disable Git-triggered deployment for this feature branch only; preserve inherited routes/headers. |
| `tests/auth.test.tsx` | Initial mocked provider/guard/recovery/sign-out tests. |
| `tests/authFlows.test.tsx` | Additional mocked auth/session/validation regression tests. |
| `tests/auditRegression.test.tsx` | Alias/private/404 metadata, filter labels/query navigation and mobile keyboard tests. |
| `tests/publicationConfig.test.ts` | Publication/project boundary and generated SEO tests in temporary test directories. |
| `FRONTEND-DELIVERY.md` | Point readers to this current follow-up report; retain historical delivery context. |
| `docs/CLINOVA-AUDIT-RECHECK.md` | Findings, verified limits, configuration and release handoff. |

No `package.json`, lockfile, existing Supabase client, migration, database schema or unrelated project file is changed by this increment. Check the review commit's diff for the authoritative list.

## QA and honest limits

The PR #3 starting point was actually tested: typecheck, lint, build and all 111 tests passed. Final locked-npm verification passed: `npm ci`, `npm run typecheck`, `npm run lint` (0 errors, 4 Fast Refresh warnings), `npm test` (159 tests across 9 files), `npm run build`, `git diff --check`, and `npm audit --omit=dev` (0 findings). Command logs are retained outside the repository. A test worker mistakenly attempted pnpm; its dependency changes were replaced by successful `npm ci`, and its generated untracked pnpm files are excluded from this commit. Intermediate auth/router integration and a standalone newsletter test failed during development and were fixed; those were not baseline errors.

The local built site was opened in the browser at desktop width 1280. Home, `/student`, `/sign-in`, `/contact`, `/verify`, `/programmes` and an unknown URL rendered expected states, one main landmark, noindex metadata and no preview canonical. The contact submit control was disabled. Home console showed no captured errors. Phone-width 375 and tablet-width 768 were tested using a same-origin embedded browser viewport: programme content did not overflow horizontally; the phone menu opened and Escape closed it. These are responsive browser checks, not physical-device or complete cross-browser testing.

Automated tests use synthetic test-only identities, mocked SDK operations and fixture origins, not real student data. No live account creation, sign-in, sign-out, recovery email, certificate lookup, enquiry persistence, grants, RLS isolation, HTTP-deployed CSP or hosted protected-site end-to-end test is claimed. Hosted QA remains blocked by SSO; do not sign in to bypass the owner's restriction. Screen-reader/contrast auditing and exhaustive remote image/link availability checks remain incomplete. SPA route-specific metadata is client-rendered; server-only social crawlers may see the shared shell.

## Configuration and backend handoff

All `VITE_*` values are public build-time inputs. Never add service-role keys, database passwords or private tokens.

- `VITE_SUPABASE_URL`: the confirmed Clinova project HTTPS origin only.
- `VITE_SUPABASE_ANON_KEY`: only that project's public anon/publishable key.
- `VITE_AUTH_ENABLED=false`: retain until backend owner authorizes Auth configuration, sign-up policy, email delivery, password/security policy and exact callback origin allowlist.
- `VITE_ENQUIRIES_ENABLED=false`: retain until migration state, effective grants, RLS and server validation/abuse controls are verified. Do not duplicate the migration the backend owner reports applying.
- `VITE_SITE_URL`: blank until intended domain ownership/resolution and publication are confirmed. Never use a preview URL as canonical.
- `VITE_INDEXING_ENABLED=false`: separately approve catalogue, identity, accreditation/contact claims, policies and domain before enabling.

Supabase Auth must allow the exact authorized environment's `/reset-password` callback; configure email-confirmation redirect behavior and test actual delivery with approved non-production test accounts. Configure no wildcard redirect to untrusted origins. Do not expose admin registration or accept roles from a public signup form.

The existing checked-in migration defines only `contact_submissions`, `partnership_inquiries`, and `newsletter_subscriptions`, with browser insert-only policies. No new SQL or schema proposal is supplied here. The backend owner must provide and review a real profile/enrolment/progress/certificate contract, user ownership rules (`auth.uid()`), grants, RLS policies, issuer-only certificate write/verification design and cross-user denial tests **before** wiring those dashboard sections. Do not treat the dashboard as a schema definition or fabricate rows.

## Review, deployment and rollback

Review this branch stacked on PR #3; do not merge it or any prerequisite as part of this task. Coordinate overlapping PR #2 and the concurrent auth work first. The feature branch includes a documented branch-specific automatic-deployment block. Leave it in place while reviewing; no new hosted deployment is requested.

After a separately authorized release: establish a non-production environment with confirmed Clinova-only configuration; verify backend security and callback delivery; run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`; inspect generated noindex/robots/sitemap behavior; then arrange an authorized preview and complete hosted QA. Production promotion and domain changes require separate authorization. Do not use `vercel --prod` for this review.

Rollback before merge is simply closing the new PR; earlier branches and the current deployment remain unchanged. If these changes are later merged under separate authorization, revert the isolated review commit and rebuild with auth/enquiry/indexing flags disabled. This frontend-only rollback needs no database reversal. Do not roll back the backend owner's separate migration as part of a frontend rollback.
