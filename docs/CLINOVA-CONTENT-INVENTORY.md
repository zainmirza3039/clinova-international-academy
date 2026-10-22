# Clinova content inventory

This is a source-content inventory for the review branch, not evidence that the academy’s courses or services are live. Public academy facts are restricted to owner-confirmed information. Clinical material is original educational draft content and still needs qualified clinical and editorial review.

## What the site now contains

| Surface | Routes | Implemented content and status |
|---|---|---|
| Home and About | `/`, `/about` | Original proposed educational principles, a read–reflect–confirm learning pathway, library navigation and an honest overview of the unavailable student service. No invented history, faculty, accreditation, achievements or outcomes. |
| Subject areas | `/departments`, `/departments/:slug` | Ten proposed subject groupings, not established academic departments. Overview, topic list, audience/scope caution, proposed programme associations, draft article/study links, FAQs and disclaimer. Programme counts match actual draft records rather than the previous unsupported total of 66. |
| Programme catalogue | `/programmes`, `/programmes/:slug`; `/courses` aliases | Eight proposed records. All have `publicationStatus: 'draft'` and `status: 'Draft'`; no enrolment, offer, recognised CPD hours or certificate promise. Duration, delivery, assessment arrangements and certificate fields are unconfirmed; CPD hours are null. Unsupported duration/delivery filters are disabled. |
| Detailed curricula | First two programme detail routes | Two proposed curricula in `courseDrafts.ts`, each with outcomes, intended audience, prerequisites, three modules, two substantive reading lessons per module, reflective activities, FAQs, related articles and evidence references. The other six retain their prior topic outlines and proposed objectives, but do not have full new lesson material. |
| Professional-development topics | `/cpd-courses`, `/cpd-courses/:slug` | Twelve draft topic records, not available CPD bookings. Hours are null; duration and delivery/recognition arrangements are unconfirmed. Hour filtering is disabled. Detailed reviewed curricula for these twelve are not complete. |
| Article library | `/resources`, `/resources/:slug`; `/blog` aliases | Fifteen original, substantive educational drafts in three JSON files. Search covers titles, excerpts and article bodies; topic filtering, result counts and clear-empty-search handling are implemented. Detail pages contain a contents list, full sections, takeaways, references, relevant internal links and clinical/scope caveats. No invented bylines or publication dates. Earlier three draft addresses resolve as compatibility aliases. |
| Study tools | `/learning-resources`, `/learning-resources/:slug` | Six original reading-based resources: assessment reflection checklist, rehabilitation planning/case reflection, documentation worksheet, evidence appraisal guide, shared-decision conversation guide, and clinical reasoning glossary. Each has substantive guidance, prompts, references and related reading. No fake downloads, input collection or saved completion. |
| Online learning | `/online-learning` | Explicitly illustrative platform/feature mock-up. Videos, assessment, enrolment, progress and certificates are not represented as live services. |
| Contact | `/contact` | Owner-confirmed public address: **1 Unity St, Bristol BS1 5HH, United Kingdom**. Used as exact contact information, not proof of campus facilities or legal establishment. Phone, email, hours and visiting arrangements remain unconfirmed. Contact form stays disabled; privacy guidance excludes patient records, passwords and payment data. |
| Partners | `/training-partners` | Useful proposal/enquiry guidance without promising an agreement, delivery, certificates, support capability or commercial outcome. Existing validation remains; submission is disabled in preview configuration. |
| Admissions/application | `/admissions`, `/apply`, `/application` | Preview guidance/local application concept. No approved admissions contract, submission or persistence. |
| Verification | `/verify` | Honest unavailable state; no invented certificate records, identifiers or verification results. |
| Auth/student/admin | Auth routes, `/student/*`, `/admin/*` | Existing PR #4 guarded foundation preserved. Default-off auth, protected routes and safe recovery/return-path handling; auth loading is noninteractive. No trusted student, enrolment, progress, assessment, certificate or administrative data service exists. |
| Community | `/events`, `/faculty`, `/community` | Honest no-confirmed-record states rather than fabricated people, events or attendance. |
| FAQs/testimonials | `/faqs`, shared FAQ data | General proposed/unconfirmed guidance; testimonials remain empty. No learner or success-story fabrication. |
| Legal | Privacy, terms, cookies and refund routes | Existing draft policy documents, not reviewed legal commitments. Operator/controller, processing arrangements and commercial terms require owner/legal confirmation. |
| Fallback | Unknown routes | Real not-found states and recovery links; no fabricated record or success state. |

## Proposed subject groupings

Physical Therapy & Rehabilitation; Nursing & Allied Health; Medicine; Dentistry; Pharmacy; Psychology & Mental Health; Nutrition & Dietetics; Sports & Exercise; Occupational Therapy; Healthcare Management. Each retains eight proposed learning topics. These are navigation categories, not evidence of active departments or regulated training.

## Programme records

1. Certificate in Musculoskeletal Assessment — proposed certificate category; **detailed curriculum draft added**.
2. Certificate in Clinical Pain Management — proposed certificate category; **detailed curriculum draft added**.
3. Professional Development in Sports Rehabilitation — existing topic outline retained.
4. Certificate in Patient-Centred Healthcare Practice — existing topic outline retained.
5. Diploma in Rehabilitation Practice — existing topic outline retained.
6. Certificate in Healthcare Communication — existing topic outline retained.
7. Certificate in Cognitive Behavioural Therapy Fundamentals — existing topic outline retained.
8. Professional Development in Healthcare Leadership — existing topic outline retained.

The words “Certificate” and “Diploma” identify proposed catalogue titles only. No recognised qualification, accreditation, awarding right, duration, fee, intake, certificate issuance or employment outcome is asserted.

## Twelve CPD-topic records

Clinical Assessment of Low Back Pain; Introduction to Sports Rehabilitation; Pain Management Fundamentals; Clinical Communication Skills; Wound Care Essentials; Pharmacotherapy Updates in Chronic Disease; CBT for Anxiety Disorders; Clinical Nutrition for Chronic Disease; Patient Safety in Clinical Practice; Motor Control & Relearning in Neurorehabilitation; Infection Prevention and Control; Quality Improvement in Healthcare.

Their editorial levels and subject associations are provisional. All need confirmed prerequisites, qualified authors/reviewers, outcomes, modules, assessments, references, workload, accessibility review and commercial terms before being treated as real offerings.

## Fifteen article drafts

- Structured physiotherapy assessment; musculoskeletal pain and function; therapeutic exercise progression; knee osteoarthritis; low back pain.
- Shoulder pain; stroke rehabilitation; balance/falls; ankle sprain; ACL rehabilitation.
- Range of motion/strength/function; gait reasoning; evidence-based practice; red flags/referral; documentation/communication.

The main bodies are approximately 847–934 words each, excluding headings and takeaways. They use opened NICE, WHO, HCPC, NHS, professional-body and peer-reviewed sources. References are visible on-page; they do not imply source endorsement. UK guidance does not replace local professional rules or individual clinical judgement. Clinical approval is explicitly **not** claimed.

## Existing backend and safety gates

The existing enquiry migration defines contact, partnership and newsletter insert-only tables. It is not a student schema or an operational administration/delivery service. Prior reported insert/read-denial testing is not reclassified as full production verification. No migration or database write was performed for this work.

Before enabling anything, confirm academy/project ownership, abuse and rate controls, privacy/retention, API/browser persistence, staff access, operational delivery, and error/duplicate behaviour. Auth additionally needs reviewed redirect/recovery configuration and live callback/email tests. Student features require a separately reviewed backend contract and authorization—not guessed tables or frontend-only access checks.

## Outstanding work requiring review or owner inputs

- Qualified clinical/editorial approval, authorship/version ownership and ongoing source-review responsibility for all drafts.
- Six remaining full programme curricula and twelve CPD curricula; reviewed assessments and actual learning media.
- Verified faculty, partners, fees, intakes, eligibility, recognition and certificate policy, if those services are to be offered.
- Reviewed student/admin APIs, authorization/RLS, persistence, assessment and issuance contracts, privacy/legal terms and operational ownership.
- Comprehensive assistive-technology, performance and real-device QA beyond this branch’s automated and local-browser checks.
- Domain purchase/DNS/custom-domain aliases, canonical origin, `VITE_SITE_URL` and domain-dependent SEO/publication remain deliberately untouched.

No login, merge, production deployment, domain purchase/configuration, paid service or change to PainFix is part of this implementation.
