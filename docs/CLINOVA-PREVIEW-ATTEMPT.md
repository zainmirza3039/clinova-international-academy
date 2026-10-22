# Clinova deployment is READY; Preview target remains unconfirmed

The corrected, authorised source-file request created a deployment, but the connector returns `target: null` rather than confirming Preview. Testing stopped as instructed. Cancellation was attempted while the last observed state was BUILDING; the cancellation returned HTTP 400. A subsequent metadata read shows READY. No second request or alternate target was tried after the correction.

## Result

- Deployment: `dpl_HmoWoAB5WFiEGsNCiy3NnDEz4cK7`.
- URL: https://clinova-international-academy-2dno6kzxn-zainmirza3039s-projects.vercel.app
- Verified project: `prj_zurasqRt9svFH1F9JGhXxve5C8WR` / `clinova-international-academy`.
- Request team: `team_J2SEYRfmaWXwhvx7IpC1EXA2`.
- Verified source SHA: `fc0995317e3ff5815901fee3663f8b2935d25298`.
- Verified branch metadata: `feat/clinova-local-learner-ui`.
- Final state: **READY**.
- Returned target: **null** in creation and both detail reads. Preview classification is **not confirmed**; do not call this a Preview-tested result.
- Returned aliases: empty array. No alias, promotion or project/environment setting was requested.

No browser or anonymous HTTP request was made to this deployment URL. There is no hosted route, mobile, auth, persistence or student-data test result.

## What was authorised and sent

The earlier task wording required a literal `target: preview` API field; that first request was rejected with HTTP 400 `bad_request`: “target should be production, staging, or a custom environment identifier.” Its request ID was `iad1:sfo1::7p9fb-1792663400238-c667e6566f73`, and no resource was created by that request.

The coordinator then corrected that wording: the owner had authorised deploy/test under no-Production restrictions, not a particular literal field. The full `create_deployment` definition explicitly documents omitted target as Preview. One new request was therefore authorised with **the target property omitted**. It used only the exact Clinova project/team and the previously verified local source payload. It did not include `production`, `staging`, a custom environment, `gitSource`, settings, paid build machine or aliases. No branch was pushed.

The creation response returned the correct project and source SHA, INITIALIZING and `target: null`. An immediate detail read returned the same project/SHA and null target, with state BUILDING. Because Preview could not be confirmed, no testing was started and cancellation was requested.

## Cancellation outcome

`PATCH /v12/deployments/dpl_HmoWoAB5WFiEGsNCiy3NnDEz4cK7/cancel` returned **HTTP 400 `deployment_not_canceled`**:

> Could not cancel the deployment: dpl_HmoWoAB5WFiEGsNCiy3NnDEz4cK7

Cancellation request ID: `iad1:sfo1::n2kh6-1792663861531-62c65f472603`.

The final read returned READY, with `ready: 1792663850113`. That ready timestamp precedes the cancellation request timestamp. Cancellation was not repeated and the READY deployment was not deleted, promoted, aliased or tested. The connector did not return an explicit Preview classification, so this task stops here rather than inferring permission to continue.

## Source and local QA

Before the corrected request, all 94 app-build files in the local worktree were rechecked against the already-tested manifest. Source-manifest SHA-256: `ac358dd4630a8bfdc1ea50b98390c2aba3fd06c14236797119da8682ff489626`. Compressed patch SHA-256: `22c54843a930ba2e80081a051e79c2b86d4144e66475b2ed791fb36bda99da1b`.

The internal payload at `/workspace/clinova-preview-payload-fc099.mOlz` comprises `package.json`, `hydrate.mjs`, `local.patch.gz` and `source-hashes.json`. It reconstructs the exact public baseline commit plus the local app patch, verifies all app-build hashes, and copies only whitelisted build files. SQL, tests, documentation and archive extras are excluded. The original package/lockfile is restored before installation/build. The child build forces auth, enquiries, learner data and indexing false; `VITE_SITE_URL`, canonical configuration and the repository deployment guard are unchanged.

The complete application previously passed 268 frontend tests, 34 disposable SQL assertions, typecheck and a default-off build. Lint has zero errors and four pre-existing fast-refresh warnings. Local browser checks cover draft public pages, disabled real auth/student routes and isolated synthetic learner states, including 375px/768px iframe layouts. The separate disposable payload build passed locally with noindex, disallow-all robots, an empty sitemap and no synthetic harness fixtures. See [implementation details](CLINOVA-LOCAL-LEARNER-INTEGRATION.md).

READY is a returned deployment status, not proof that hosted learner behaviour, Preview classification or active runtime flags were independently tested.

## Protection and launch limits

The project preflight showed SSO protection enabled for `all_except_custom_domains`. It was not changed or bypassed. Deployment-specific SSO behaviour was not checked after the target classification failed.

No Production target, promotion, aliases, project/environment changes, branch push, login, domain/DNS/canonical changes or live database writes were requested. No student rows were read. The latest coordinator schema metadata still reports no learner tables and an empty migration ledger despite the earlier manual enquiry-migration report; no repair or migration was attempted. Retention/CASCADE deletion and own-profile-write policy remain unresolved. Live Auth redirects/callbacks, hosted RLS/PostgREST, persistence and abuse controls remain unverified. Learner/auth/enquiry/indexing flags remain off in the source/payload, and educational content remains draft.
