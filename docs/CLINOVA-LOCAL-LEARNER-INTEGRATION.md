# Clinova: local student frontend implemented

## What is built

The student dashboard now has a real, default-off frontend adapter for the proposed learner schema—not invented enrolments or a live LMS. It reads the signed-in learner’s profile, enrolments and completion markers, and published course/module/lesson content available to that enrolment. Lists are paginated in stable ten-record pages with explicit column projections and ownership/course/module/publication filters appropriate to the draft schema. Database RLS remains the authority; frontend filtering and feature flags are not security boundaries.

The existing AuthProvider client is reused rather than constructing a second auth client. It is exposed to the dashboard only after session readiness, outside password recovery. Disabled auth, disabled learner data, missing client/session, loading and error states do not start learner queries. A session-owner change unmounts the previous workspace; changed query identities immediately mask old data and ignore late responses.

The dashboard supplies separate loading, empty, unavailable, retry and error states. Errors are not turned into zero progress or missing enrolment claims. Module reading opens on demand. Lesson Markdown is deliberately displayed as escaped plain text: no embedded HTML, scripts or remote links are executed. Draft public curricula are not published, seeded or mapped to real enrolments.

Active enrollees can invoke only `set_my_lesson_completion(p_lesson_id, p_completed)`. No learner ID or timestamp is sent. Pending changes disable completion controls, duplicate clicks are suppressed, and there is no optimistic completion percentage, course pass or award. An ambiguous error does not automatically retry; controls remain locked until an explicit successful marker reread. Marker pages are partial records, never a total. Completed enrolments are read-only and withdrawn enrolments have no reading action. The server must still recheck current enrolment/publication status.

There are **no** profile/student-record forms, enrolment creation, assessment UI/data reads, certificate UI/data reads, public verification, admin CRUD, payments or account deletion. The inherited SQL draft does permit authenticated own-profile display-name creation/update through direct REST; this frontend exposes none of those methods. That broader draft capability needs explicit policy review before any live release, not a claim that the whole database contract is read-only.

## Branch and files

Worktree: `/workspace/clinova-local-learner-ui`. App integration/source commit: `fc0995317e3ff5815901fee3663f8b2935d25298`; later commits update handoff documentation only.

Branch: `feat/clinova-local-learner-ui`, created from the rechecked PR #4 head `4ae53c2382541b6f8a4e7c804d0ace57c5e60f94`. Existing learner-schema commit `2bc40ed3ab966c70bc7b4afa834a17b3ef1ef50c` was cherry-picked locally as `cd71003`; the migration itself is unchanged. The source schema worktree and PR #4 were not edited or pushed.

- `src/learner/learnerApi.ts`: bounded, fail-closed reads and narrow completion RPC.
- `src/learner/useLearnerRead.ts`: stale-request masking, loading/error/retry handling.
- `src/learner/LearnerWorkspace.tsx`: profile, enrolment, reading and marker UI.
- `src/pages/StudentDashboardPage.tsx`: independent learner gate and safe sign-out feedback.
- `src/auth/AuthProvider.tsx`: session-ready client reuse; existing auth safety retained.
- `.env.example`: adds only `VITE_LEARNER_DATA_ENABLED=false`. Existing auth, enquiries and indexing remain off; domain/publication settings and the deployment guard are untouched.
- `tests/learnerApi.test.ts`, `tests/learnerWorkspace.test.tsx`, `tests/authLearnerClient.test.tsx`: mocked adapter/UI and actual provider-client tests.
- `tests/sql/learning-foundation.sql`: seven added frontend-shaped projection/filter/pagination assertions using disposable synthetic fixtures.
- `tests/browser/`: isolated synthetic-only Vite harness, excluded from the normal application/build. No real auth or Supabase calls are used.

## Verified locally

**268 tests passed across 16 files**, including 28 new frontend tests. TypeScript and lint pass with zero lint errors and the four existing AuthProvider fast-refresh warnings. The default-off application build passes; initial JS is 372.51 kB / 101.61 kB gzip. No synthetic harness fixtures were found in that built bundle. Dependency manifests are unchanged; the existing nine development-tool audit findings are not resolved by this task.

The disposable PostgreSQL runner passes **34 SQL assertions**, including own-record isolation, published/draft visibility, enrolment requirements, idempotent completion changes, trusted-only records, relational constraints and frontend-shaped reads/pagination. It creates a temporary Unix-socket-only cluster with no TCP listener and destroys it on exit. No hosted migration or write occurred. This is not a PostgREST, hosted RLS or end-to-end auth test.

Local browser checks:

| Check | Result |
| --- | --- |
| Default-off built `/programmes` and programme detail | Rendered catalogue and three draft curriculum disclosures; no horizontal overflow at 1280px. |
| Default-off built `/student` and `/sign-in` | Student access unavailable; no credential/student forms. Preview remains noindex with no canonical. |
| Synthetic ready | Course/module/lesson reading and explicit mock completion-success feedback render; no student-record forms. |
| Synthetic empty / error / loading | Distinct empty text, non-zero-inference error/retry, and loading status. |
| Synthetic completion pending | Saving status; both completion controls disabled. |
| Synthetic completion error | Ambiguous-write warning; both controls locked; no automatic retry. |
| Synthetic completed enrolment | Lesson readable; no completion controls. |
| Responsive synthetic dashboard | Same-origin iframe CSS viewports at 375px and 768px rendered the actual dashboard/styles without horizontal overflow. This is not real-device or complete mobile lesson-flow testing. |

The browser harness uses mock auth/API responses, a fetch guard and a local-only CSP. It is **not** a sign-in test and does not establish persistence or server authorization. Its success response is synthetic, not a real student completion record. Unit tests additionally check escaped malicious lesson text, pagination, stale-account responses and duplicate-write suppression.

## What still blocks launch

1. **No learner schema is applied live.** Latest coordinator metadata confirms the Clinova project, but does not show learner/course/module/lesson/enrolment/progress tables. Reconcile the empty migration ledger and inconsistent schema-inventory results against the earlier manual enquiry migration report before any reviewed live operation. Do not repair or replay automatically.
2. **Retention/deletion is unanswered.** The current proposed migration uses `ON DELETE RESTRICT` for Auth-user foreign keys, preventing automatic cascading deletion while learner records exist. This is only a fail-closed safeguard; it does not define a retention, export, deletion or anonymization workflow. The owner has not approved a final policy, and no consent should be inferred from the constraint or local tests. No deletion interface is exposed. Resolve retention/anonymization and existing own-profile-write policy before applying the schema or enabling learner data.
3. Hosted RLS/PostgREST behavior, real sign-in/recovery, email delivery, redirects/callbacks, persistence, multi-account isolation and abuse controls remain unverified. All learner/auth/enquiry/indexing flags remain default-off.
4. Trusted course publication, enrolment administration, assessments and awards are not implemented. Keep all existing educational content draft and obtain qualified clinical/editorial/legal/commercial review.
5. **Deployment READY, but Preview target is not confirmed; hosted QA stopped.** After the coordinator corrected the literal-target requirement, one authorised file-based request omitted `target` as the API schema documents for Preview. Deployment `dpl_HmoWoAB5WFiEGsNCiy3NnDEz4cK7` returned the correct Clinova project and source SHA `fc0995317e3ff5815901fee3663f8b2935d25298`, but creation and detail reads all returned `target: null`. Cancellation was requested after observing BUILDING and returned HTTP 400 `deployment_not_canceled`; the final read shows READY. No deployment URL was opened or fetched, no testing was performed, and no alternate-target or additional creation request was made after the correction. SSO was enabled in the project preflight and was not changed/bypassed; deployment-specific protection was not tested. The earlier literal `target: preview` request had been rejected with HTTP 400. See [exact deployment and cancellation details](CLINOVA-PREVIEW-ATTEMPT.md).

No browser login, real student-row reads, live database writes/migrations, remote push/PR creation, merge, domain/DNS/canonical change, paid service or PainFix modification is included. The authorised target-omitted deployment reached READY, but its Preview classification remains unconfirmed. No Production target, promotion, alias or project/environment setting was requested; all real feature flags remain off in the source/payload.

## Reproduce locally

```sh
npm ci --ignore-scripts
npm run typecheck
npm run lint
npm test
VITE_AUTH_ENABLED=false VITE_LEARNER_DATA_ENABLED=false VITE_ENQUIRIES_ENABLED=false VITE_INDEXING_ENABLED=false npm run build
bash scripts/test-learning-schema.sh
```

For default-off built routes: `npm run preview -- --host 127.0.0.1 --port 4252 --strictPort`.

For **synthetic testing only**: `npx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port 4251`. Open `/?scenario=ready`, `empty`, `error`, `loading`, `write-error`, `write-pending` or `completed`; `/responsive.html?width=375` and `width=768` provide explicitly labelled iframe viewport checks. This separate config enables the learner UI only against the mock auth module; never enable real auth globally to run it. The normal app does not import or route to the harness.
