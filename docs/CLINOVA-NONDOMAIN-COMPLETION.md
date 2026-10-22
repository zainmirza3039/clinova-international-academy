# Clinova: safe non-domain implementation

This is a substantial frontend/content increment for draft [PR #4](https://github.com/zainmirza3039/clinova-international-academy/pull/4), not completion of the entire learning-platform brief and not a website launch. The [content inventory](CLINOVA-CONTENT-INVENTORY.md) records each surface and its remaining gaps.

## Implemented

- **Fifteen original article drafts**, approximately 847–934 main-body words each, with meaningful sections, takeaways, visible references, disclaimers and related draft programme/article links. Search covers article bodies as well as titles and excerpts. Topic selection has accessible state, live result counts and a clear empty-search recovery action. No author identities or publication dates were invented.
- **Twenty detailed draft curricula: all eight programmes and twelve CPD topics.** This continuation adds the remaining six programme and twelve CPD curricula: **108 new substantive lessons**, each 133–184 words. Across the twenty curricula there are three modules and six lessons each: **120 reading lessons total**. Each curriculum has proposed outcomes, audience/prerequisites and professional limits, fictional reflective activities, FAQs, valid related reading and scoped evidence references. Reading is not tracked, assessed or counted as completion and does not establish clinical competence.
- **Six substantive study resources:** assessment checklist, rehabilitation planning and fictional case reflection, documentation worksheet, evidence-appraisal guide, shared-decision conversation guide, and clinical reasoning glossary. They are real reading pages, not fake download links or patient-data forms.
- **Honest catalogue and website copy:** all eight programme and twelve CPD-topic records are explicitly draft. Unverified CPD-hour values are null; duration, delivery, assessment and certificate arrangements are unconfirmed. Unverified hour/duration/delivery filters are disabled. Every programme and CPD detail route now has full draft lesson prose rather than only a topic shell. Sensitive catalogue summaries were rewritten to avoid independent-treatment, prescribing or mastery promises. Proposed subject-area counts now derive from the actual draft catalogue instead of the unsupported total of 66.
- **Home, About, subject areas and partner guidance:** original useful proposed wording and learning links replace unsupported claims of live delivery, progress services, certificates or commercial outcomes. Subject categories are not portrayed as formally established departments. Testimonials remain empty.
- **Confirmed public address:** `1 Unity St, Bristol BS1 5HH, United Kingdom` is used exactly in Contact and Footer following the owner’s explicit approval. No phone, email, opening hours, visiting arrangements, facilities or institutional/legal status were inferred.
- **Safety and accessibility:** noninteractive auth-loading state plus defensive readiness gate; mobile submenu state resets on close/route changes; stable submenu relationships and explicit button types; one main landmark across public routes; shared strict UTC-stable resource date handling; honest unavailable platform metrics. Existing backend-dependent features remain disabled.
- **Loading performance:** article bodies and resource pages are code-split. The initial JavaScript chunk moved from 546.24 kB / 150.59 kB gzip in the first integrated build to **372.27 kB / 101.47 kB gzip** after this continuation. Article bodies (124.00 kB), programme details/curricula (110.55 kB) and CPD details/curricula (139.13 kB) load on demand rather than with the homepage. This is a build-size measurement, not a Lighthouse/Core Web Vitals claim.

## This continuation: scope and quality controls

The clean worktree and remote draft PR head were rechecked at `2b81df3ede3a2336a7bf71d898b7a0083b807cf3` before continuing. Changes remain on the same isolated branch and preserve its earlier history. Other worktrees and concurrent backend work were not changed.

The six new programme drafts cover sports rehabilitation, patient-centred practice, rehabilitation practice, healthcare communication, CBT fundamentals and healthcare leadership. Twelve CPD curricula now cover every existing CPD slug. Specialist content is intentionally limited to educational reasoning, professional/licensure boundaries, supervised review and referral—not wound procedures, drug selection/doses, psychotherapy scripts or individual dietary prescriptions. Course names are proposals, not proof of available or recognised awards.

Clinical references were searched and opened before drafting, including [NICE medicines optimisation (NG5)](https://www.nice.org.uk/guidance/ng5), [leg-ulcer infection (NG152)](https://www.nice.org.uk/guidance/ng152), [anxiety guidance (CG113)](https://www.nice.org.uk/guidance/cg113), [nutrition support (CG32)](https://www.nice.org.uk/guidance/cg32), other scoped NICE rehabilitation/pain guidance, WHO, HCPC, GMC, BABCP, NHS safety/infection resources and professional evidence. The exact source URLs and applicability notes are visible in each curriculum. A generic medicines-evidence framework is not an exhaustive or continuously updated chronic-disease prescribing guide.

Repetitive/truncated first-pass specialist prose and tuple-shaped references were rejected and rewritten. Repeated systems-course boilerplate was replaced with specific process examples. Invalid filename-like article links were corrected to real article slugs. New regression checks cover all twenty curricula, content structure, complete sentences, repeated long-sentence templates, dose-pattern exclusions, crosslinks, reserved/missing-slug lookups, collapsed modules, source-link accessibility and absence of learner workflows. These checks do not certify clinical accuracy. Public-route tests now await both lazy rendering and the existing metadata effect; publication code itself is unchanged.

## Decision on the separate research handoff

The separate `clinova-content-research/articles.ts` and README were inspected. They cover the same fifteen topics in a different Markdown/citation schema, use different slugs, and contain suggested rather than route-verified course links. They remain useful independent editorial evidence, but were **not added as a second library or wholesale substituted** after the integrated corpus already had stable crosslinks, complete bodies and route tests. Replacing it would require a separate citation-renderer/slug mapping and clinical/editorial reconciliation; duplicating it would make the site harder to maintain.

Targeted evidence improvements were adopted instead: the 2025 rotator cuff guideline and PubMed record, a muscle-strength narrative review, a gait-assessment scoping review and World Physiotherapy’s evidence-based-practice policy. A WHO reference that could not be read in the initial subtask was replaced with the opened rehabilitation fact sheet. Neither corpus is clinically approved or published. The alternative handoff remains outside this branch.

## Verified checks

| Check | Result |
|---|---|
| TypeScript | Pass: `npm run typecheck` |
| ESLint | Pass, zero errors; four pre-existing Fast Refresh export warnings in unchanged `AuthProvider.tsx` |
| Automated tests | **240 passed across 13 files**, including 79 public-route cases, content structure/crosslinks, draft catalogue states, enquiry validation under mocks, default-disabled states, auth safety and publication safeguards |
| Production build | Pass: `npm run build`; preview generator still emits noindex and no public sitemap entries |
| Patch whitespace | Pass: `git diff --check` |
| Production dependency audit | **0 reported vulnerabilities**: `npm audit --omit=dev` |
| Full dependency audit | **9 development-tool findings: 6 high, 3 moderate**. Remaining Vite/Tailwind/transitive-tool updates need a separately tested upgrade; no forced major upgrade was applied. |
| Local browser | Earlier article/contact/disabled-auth checks retained; this continuation additionally verified sports programme, wound care, pharmacotherapy and CBT pages at a 1280px desktop viewport: three modules/six lessons, no learner inputs, source links, no horizontal overflow, native module opening with visible lesson text, and working section navigation. Preview remains noindex with no canonical. |

Browser checks are local preview checks, not hosted persistence, real-device certification or a complete assistive-technology audit. An embedded responsive-viewport probe did not produce rendered headings and is **not counted as a successful mobile check**. Automated responsive classes and earlier bounded layout work do not establish full real-device coverage.

## Preserved boundaries

Implementation used `/workspace/clinova-nondomain-completion`, branch `fix/clinova-nondomain-completion`, starting at PR #4 head `389a80a10cfd00ab638ba5b078feca72b5279af3`. The separate backend worktree/branch at `3b498a1c722c5ffd6d991fb04634c9e88d0adf6c` was not overwritten or merged. Only clearly non-domain date/learning-content changes were selectively adapted; its SEO/config changes were not imported.

Canonical intent `https://clinovaacademy.co.uk`, domain purchase, DNS, Vercel custom domains/aliases, `VITE_SITE_URL`, domain-dependent indexing/publication, metadata origins, sitemap/robots generator, Vite configuration, Vercel configuration and the branch-specific deployment guard remain untouched. No `clinovaacademy.com` content was used.

No browser login, database write/migration, paid service, merge, production deployment, direct push to main or PainFix modification was performed. The auth provider, approved-project checks, environment defaults and deployed state are preserved.

## Still incomplete—and deliberately not claimed complete

1. Qualified clinical/editorial approval, named review ownership and maintenance of every educational draft.
2. Qualified review of all twenty curricula; any future assessment/completion content and actual learning media. The reading drafts are implemented, but no live course delivery, assessed competence or recognised CPD is claimed.
3. Verified faculty, fees, intake dates, eligibility, recognition/certificate policy, partner terms and legal/operator details.
4. Reviewed student/enrolment/progress/certificate/admin interfaces and authorization. A separate review-only learner-schema proposal is not integrated or applied here, and no trusted live frontend API contract is assumed. **The owner has not decided whether deleting an Auth user should cascade learner records: deletion/retention remains an unanswered draft-launch blocker, not consent.**
5. Approved non-production browser/API persistence, spam/rate controls, privacy/retention, staff access and delivery operations; live sign-in/sign-up/sign-out, recovery callbacks and email delivery. Existing enquiry transaction testing was previously reported rolled back and is not full production verification.
6. Broad mobile/assistive-technology/performance QA and a separately validated development-tool security upgrade.
7. All domain-dependent work, explicitly deferred by the owner.

Auth and enquiry flags remain default-off. Application, administration, enrolment, progress, assessment and verification services stay unavailable. Do not enable a feature merely because a route or earlier enquiry migration exists.

## Review and rollback

Keep PR #4 draft and stacked on PR #3. A remote update is permitted only as a normal fast-forward after rechecking the exact current PR head; an unexpected head change means retaining this local review branch instead. No merge or deployment follows from these results. Rejecting or later reverting the follow-up commit leaves production unchanged and requires no database rollback; do not undo the separate prior enquiry migration.

After editing article bodies or metadata, run `node scripts/generate-article-index.mjs`; the content tests verify that the lightweight card index matches the full corpus. Then rerun typecheck, lint, tests and build before review.
