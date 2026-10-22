# Clinova International Academy — Content and Route Audit

**Date:** 22 October 2026  
**Repository:** `zainmirza3039/clinova-international-academy`  
**Implementation branch:** `feat/clinova-complete-platform-redesign`

## Executive result

The public content layer has been replaced with substantive, structured content rather than draft or placeholder copy. The resource catalogue now contains **15 publishable educational articles**, each with a summary, three content sections, key points, and a general educational-information disclaimer. The public programme catalogue contains **8 structured programmes** and the CPD catalogue contains **12 structured CPD courses**.

Static content now carries an explicit `publicationStatus` (`draft`, `review`, `published`, or `archived`). Public catalogue pages render publication-filtered collections, so future draft or review records are not exposed accidentally.

## Route audit

| Route / route family | Status | Finding / action |
|---|---|---|
| `/` | Updated | Removed unverified/fabricated testimonials and replaced them with transparent learning principles. Featured content now comes from published records. |
| `/about` | Updated | FAQ source moved to the content source file; no demo records remain. |
| `/departments` | Reviewed | Department catalogue remains data-backed and links to detail routes. |
| `/departments/:slug` | Reviewed | Related programmes/CPD are sourced from published collections/helpers. |
| `/programmes` | Updated | Catalogue renders only `publishedProgrammes`; filters remain functional. |
| `/programmes/:slug` | Reviewed | Programme helper resolves only published programme records. |
| `/cpd-courses` | Updated | Catalogue renders only `publishedCPDCourses`; filtering remains functional. |
| `/cpd-courses/:slug` | Updated | Each course now renders learning outcomes, module outline, prerequisites, assessment, duration, CPD hours, level, and format. |
| `/online-learning` | Updated previously | Honest learner-access state; no fabricated dashboard metrics or fake activity. |
| `/training-partners` | Updated | Form fields now have names matching the persisted payload; missing Supabase configuration is handled honestly. |
| `/resources` | Updated | Renders all 15 articles with category filtering and search. Local rendered verification showed “Showing 15 articles”. |
| `/resources/:slug` | Updated | Full article body renders from structured content; sample/demo copy removed; key points and medical-information disclaimer added. |
| `/verify` | Updated previously | Database-backed public verification with safe public fields; missing Supabase configuration now displays an unavailable state rather than crashing. |
| `/contact` | Updated | Contact controls remain wired to the existing payload; missing backend configuration is handled honestly. |
| `/privacy-policy` | Reviewed | Static legal page remains accessible. |
| `/terms-and-conditions` | Reviewed | Static legal page remains accessible. |
| `/cookie-policy` | Reviewed | Static legal page remains accessible. |
| `/refund-policy` | Reviewed | Static legal page remains accessible. |

## Resource catalogue

| # | Article | Category |
|---:|---|---|
| 1 | Principles of Physiotherapy Assessment | Clinical Education |
| 2 | Clinical Reasoning and Evidence-Informed Practice | Clinical Education |
| 3 | Low Back Pain: Assessment and Management Principles | Clinical Education |
| 4 | Knee Osteoarthritis and Therapeutic Exercise | Clinical Education |
| 5 | Shoulder Pain Assessment: From History to Plan | Clinical Education |
| 6 | Stroke Rehabilitation Fundamentals | Rehabilitation |
| 7 | Balance Training and Falls Prevention | Rehabilitation |
| 8 | Ankle Sprain Rehabilitation | Rehabilitation |
| 9 | ACL Rehabilitation Principles | Rehabilitation |
| 10 | Range of Motion and Strength Assessment | Clinical Education |
| 11 | Gait Assessment Fundamentals | Clinical Education |
| 12 | Exercise Progression and Load Management | Professional Development |
| 13 | Clinical Documentation and Outcome Measures | Professional Development |
| 14 | Red Flags and Referral Considerations | Clinical Education |
| 15 | Patient Communication and Shared Decision-Making | Professional Development |

## Verification performed

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Local preview returned HTTP 200.
- Rendered local verification passed for `/resources`, `/resources/principles-of-physiotherapy-assessment`, and `/cpd-courses/clinical-assessment-of-low-back-pain`.
- Unfinished-content scan found no sample article, demo article, lorem ipsum, placeholder, fake certificate database, or fake testimonial markers. Remaining mentions of “testimonials” are explanatory copy stating that unverified testimonials are not published.
- Supabase startup behavior was corrected so missing environment variables no longer blank the entire SPA; forms and verification now report the connection state honestly.

## Known deployment limitation

The production domain was checked during the audit and was still serving the previous build. This branch contains the completed implementation, but it is not described as live until the branch is merged/deployed and a fresh production smoke test confirms the new content. No accreditation, partnerships, learner outcomes, certificates, or other institutional claims have been invented.
