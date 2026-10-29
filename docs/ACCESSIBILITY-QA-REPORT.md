# Clinova Accessibility QA & Release-Readiness Report

**Checkout:** `/workspace/clinova-main-c60569-review`

**Baseline:** detached `c60569d32e2e898577f4c5cadade40ea0f4cac52`

**Status:** Local implementation and automated checks pass. Manual assistive-technology QA, secure live workflows and exact-version clinical sign-off remain open. This is not release approval.

This report is a historical pre-release QA snapshot. Repository and deployment statements below describe the state when this report was prepared, not the current release status.

## Key findings and fixes

- **SPA navigation:** Desktop and mobile links expose the correct current page/section using path-boundary matching. A pathname change focuses the existing `#main-content` landmark; initial page load does not steal focus.
- **Hash and search behavior:** Lazy hash navigation waits briefly for its target. Programme result counts use one polite atomic live region; a filtered no-match is described as no match rather than as an unpublished catalogue.
- **Homepage filters:** The self-study controls form a named group, use explicit `type="button"`, and expose the selected option through `aria-pressed`.
- **Catalogue links:** Regression coverage checks exact displayed titles/routes for all 8 programme guides, 16 CPD courses and 15 educational articles, including supported aliases.
- **Error fallback:** Render errors retain one main landmark and announce the fallback message.
- **Certificate information:** The page links to current repository-backed programme guides, supports search, announces result counts and distinguishes an empty source catalogue from a filtered no-match. It does not claim eligibility, issuance, accreditation or verification.
- **Certificate-code entry:** The labelled input trims and format-checks locally; keyboard submission and Clear work. A valid-looking code always receives an explicit unavailable/not-checked status, never a verification result.
- **Collaboration draft:** Inputs have labels/help/error associations; the error summary receives focus. Required values, email, optional phone format and length limits are checked locally. The status says no enquiry was submitted or saved; Clear resets the draft.
- **Admin certificate state:** Certificate issue/revoke controls and browser mutation handlers have been removed; the admin list is read-only with an explicit unavailable notice. This is a frontend guard only: the existing RLS role check does not verify course completion or award eligibility, and no server issuance function or database write restriction was added. Keep issuance disabled.

## Automated validation

| Check | Result |
| --- | --- |
| Full Vitest suite | **Pass:** 20 files, 295 tests. The suite includes expanded admin, auth, route, and interactive-page regressions; synthetic fixtures do not validate hosted RLS or production data. |
| Public route matrix | **Pass:** 107 route/title cases. |
| TypeScript | **Pass:** `npm run typecheck`. |
| ESLint | **Pass:** `npm run lint`, 0 errors and 0 warnings. The previous six warnings were resolved by separating auth configuration/utilities/hooks from the component module and correcting the two effect dependency lists; no warning suppression was added. |
| Local production build | **Pass.** Entry JavaScript is 491.17 kB (136.80 kB gzip); the admin console is a 20.37 kB (5.48 kB gzip) lazy chunk. No chunk-size warning was emitted. Postbuild generated preview safeguards (`noindex`, no public sitemap entries); no production indexing setting was changed. |
| `git diff --check` | **Pass:** clean after final documentation whitespace check. |
| 39-record identity/hash regression | **Pass:** source IDs, titles, routes, source files, effective-record hashes and publication flags match the maintained inventory. This is source parity, not clinical approval. |
| Changed-file lint | **Pass:** no diagnostics on the changed feature files. |

## Local browser smoke

## Local browser smoke

The smoke used **Chrome for Testing 151.0.7922.34** in headless mode against the local Vite server only. It checked `/certification`, `/verify` and `/training-partners` at 1440×900 and simulated 390×844. All six page/viewport visits returned HTTP 200 with no horizontal overflow. Enter submitted the verification format check and collaboration validation; Clear worked on both. The collaboration response explicitly stated no submission occurred.

All non-local requests were blocked. Fourteen blocked asset requests generated expected `ERR_FAILED` resource messages; there were **no Supabase requests**. This is a representative local smoke, not an exhaustive route crawl, physical-device test or screen-reader test.

Follow-up **keyboard-only interaction smoke** passed on `/certification`, `/verify` and `/training-partners` at 1440×900 and simulated 390×844 (six route/viewport combinations). It verified first-Tab skip-link focus and Enter-to-main focus, search status and no-match recovery, malformed and valid-looking-but-unverified code states plus Clear, partnership error-summary focus and keyboard recovery link, valid local draft checking, repeated Enter submission with no changed outcome, and Clear. No horizontal overflow was found; ten non-local requests were blocked and no Supabase host was requested. This is automated browser QA, not human keyboard review or a screen-reader test.

## Manual QA matrix

**Manual status:** Automated keyboard-only smoke passed on the three public pages at desktop and simulated mobile sizes. Human keyboard traversal and real screen-reader output were not tested; no screen-reader software/session or physical mobile device was available. Automated focus and ARIA assertions do not establish what assistive technology speaks.

| Check | Automated/local result | Remaining manual check | Status |
| --- | --- | --- | --- |
| Keyboard-only navigation and focus | Automated Chromium smoke verified skip-link focus, main-landmark focus, field tab order, error-summary focus/recovery, and Enter/Space interaction on all three routes at desktop and simulated mobile sizes. | Human traversal of the full header/page/footer order and inspection of every visible focus indicator. | **Automated smoke passed; human review pending** |
| Screen-reader landmarks and announcements | Tests verify labels, status/alert semantics, `aria-current`, and result announcements. | Use a real screen reader to confirm spoken headings, field errors, route changes and status messages. | **Not Run — no AT software/session** |
| Certificate verification interaction | Keyboard smoke verified malformed-code feedback, a valid-looking code remaining unavailable/not checked, Enter and Clear. | Check spoken alert/status text with an approved browser/AT matrix. | **Automated smoke passed; AT pending** |
| Collaboration draft interaction | Keyboard smoke verified required-field errors, error-link focus, full local validation, repeated Enter submission with no duplicate success, no persistence and Clear; unit tests cover limits. | Human review of visible focus, error links and acknowledgement wording. | **Automated smoke passed; human review pending** |
| Responsive layout | All three new routes had no horizontal overflow at 1440×900 and simulated 390×844. | Check actual phones/tablets and zoom/text scaling. | **Simulated viewport only** |
| Search and filter announcements | Unit tests verify one polite catalogue status, homepage `aria-pressed`, and no-match copy. | Verify spoken announcements with a screen reader. | **Not Run — no AT session** |
| Error-state landmarks | Vitest verifies one main landmark and announced render-error fallback. | Review recovery action and announcement in a real browser/AT session. | **Automated test only** |
| Admin/auth boundaries | Mocked tests confirm non-admin access is denied; with synthetic completed and active enrolments and both gates open, the UI remains read-only and no insert/update/upsert is called. | Validate actual RLS and server-side eligibility behavior with synthetic accounts in an approved non-production environment before any issuance path is enabled. | **Frontend tests only; no database integration test; production path not exercised** |

## Known issues and severity

- **High — clinical release gate:** Exact reviewed source hashes, reviewer identity/date, editorial review and release-owner approval remain unevidenced for the 39 published records. Obtain record-level evidence before a release decision; publication flags were not changed.
- **High — certificate workflow:** No server-side issuance/eligibility function or public verification endpoint exists. The admin UI now exposes no certificate write action, but this does not prevent direct API/database writes allowed by any deployed policy; hosted privileges were not checked and no schema change was made. Course completion/award rules, opaque code generation, uniqueness/concurrency, audit history and endpoint protections remain unresolved. Keep issuance disabled and public verification unavailable until server-side controls and tests exist.
- **High — collaboration submissions:** The local form does not persist. A secure, abuse-controlled endpoint, approved privacy/retention rules and authenticated staff review workflow are still required before submissions can be enabled.
- **Medium — accessibility verification:** Human keyboard review and real screen-reader announcements remain outstanding.
- **Low — browser coverage:** Browser smoke covered three representative routes, not every route. The 107 route/title tests do not replace full browser or assistive-technology review.

## Clinical-review and content integrity

The academy owner reports that clinical review is complete, but the evidence available in this checkout does not link reviewer decisions to exact record hashes or identify reviewer/date, editorial sign-off or release approval. The source marks 8/8 programme records and 16/16 CPD records as `published`; the 15 article records are assigned `published` in source. Those flags are implementation metadata, not clinical, editorial, accreditation or release approval.

The supplied historical `CLINOVA-RELEASE-READINESS-REVIEW-1.md` is dated 2026-10-22 and explicitly **NOT APPROVED FOR RELEASE**. Its report date is not a per-record review date and it adds no hash-linked sign-off. All 39 inventory identity/hash rows match the current source, but every review-evidence row remains unmatched and is marked **Requires version-specific confirmation**.

No programme, CPD or article source record, source hash or publication flag was changed. The [39-record clinical-review inventory](CLINOVA-CLINICAL-REVIEW-INVENTORY.md) and [evidence-gap report](CLINICAL-REVIEW-EVIDENCE-GAPS.md) remain the record-level tracking sources. Exact-hash clinical review, editorial review and separate release-owner approval are still required.

A final metadata-only check of the 16 other Clinova worktrees found 14 clean and two with the same pre-existing dirty-path counts of 7 and 2. No other worktree was modified by this task.

## Scope and Git state

All work remains local and uncommitted in the detached `c60569d32e2e898577f4c5cadade40ea0f4cac52` checkout. No Supabase schema/migration change was added or applied. No remote/production database, Vercel, authentication, storage, production configuration or indexing change was made; no branch was created or switched and no commit, push, PR, merge or deployment occurred. No learner or patient records were read. The 16 other Clinova worktrees were not edited. See also the [interactive pages audit](INTERACTIVE-PAGES-AUDIT.md) and [backend contract proposal](CERTIFICATION-VERIFICATION-COLLABORATION.md).
