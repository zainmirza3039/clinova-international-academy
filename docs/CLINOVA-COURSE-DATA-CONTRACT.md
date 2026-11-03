# Clinova course data contract

**Design only. No production schema or course rows are created by this document.** The uploaded catalogue reference supplies a useful relational shape but explicitly labels its course inventory as reference research rather than Clinova-approved content. No competitor course titles or records are included here.

Unknown or unapproved fields remain `NULL` or “To be confirmed”; they are never inferred from a title. A course may not be published or opened for enrollment until the content owner and reviewer approve the relevant fields and delivery/assessment terms.

## Relational model

| Entity | Proposed fields and purpose |
| --- | --- |
| `departments` | `id`, `slug`, `name`, `description`, `display_order`, `is_published` |
| `programme_types` | `id`, `code`, `label`, `level_order`; controlled values distinguish certificate, diploma, postgraduate diploma, CPD course, short course and competency-certification pathway |
| `courses` | `id`, `department_id`, `programme_type_id`, unique `slug`, title, subtitle, summary, description, status, featured, created/updated timestamps |
| `course_metadata` | `course_id`, duration/unit, delivery mode, CPD hours, credit, qualification level, language, prerequisites, target audience |
| `course_modules` | `id`, `course_id`, title, description, sequence, estimated minutes |
| `course_learning_outcomes` | `id`, `course_id`, outcome text and sequence |
| `course_faculty` | `course_id`, `faculty_profile_id`, role |
| `course_pricing` | `course_id`, currency, amount, pricing type, validity dates; all values require approved commercial terms |
| `course_intakes` | `course_id`, start/end dates, capacity, delivery location and status; no intake is created without approval |
| `course_applications` | `course_id`, candidate ID, status, submission time and reviewer; private and unavailable until secure enrollment is approved |
| `enrollments` | `course_id`, candidate ID, status, enrollment and completion timestamps |
| `course_assessments` | `course_id`, assessment type, pass mark, attempts allowed and status; policy-dependent and not set by this design |
| `course_documents` | `course_id`, document type, restricted storage path, version and visibility |
| `course_sources` | `course_id`, source URL/title, checked time, extraction status and notes; provenance only, not proof of Clinova approval |

The platform must keep education and professional certification in separate schemas/record families. A course assessment may support a course-specific CPD completion policy; it cannot create a professional competency decision or credential.

## Required record groups

Course identity: owner-approved course title, unique slug, department, programme type and internal course code.

Overview: original Clinova summary and description, intended audience and prerequisites.

Learning design: approved outcomes, normalized module rows, teaching methods and course-level assessment rules.

Delivery: delivery mode, location, schedule and language only when confirmed.

Duration and credits: duration, CPD hours, credits and qualification level only when formally defined.

Commercial terms: price, currency, taxes, payment options and refund/cancellation terms only after authorization.

Governance: academic owner, content reviewer, version, approval/review dates and publication status.

Credential terms: credential type, issuer, assessment conditions, controlled template and verification policy. CPD completion and professional competency credentials must not share an issuance rule.

Operational details: enrollment status, capacity, intake dates, support contact and downloadable resources only when verified.

## Approval and security rules

- Separate draft, review and publication roles; publication metadata alone is not clinical or academic approval.
- Maintain immutable change history, author/reviewer identity and versioned approval evidence.
- Enforce foreign keys, unique slugs, server-side authorization, RLS and least-privilege RPCs.
- Avoid unstructured module blobs; normalize modules/outcomes and restrict document storage.
- Keep candidate applications, credentials, assessment results, prices and faculty records out of public views unless approved for disclosure.
- Produce a pre-publication report for missing fields, duplicates, conflicting sources and unverified metadata.
- Do not bulk-import from a competitor reference. Any future import requires explicit Clinova approval, original wording, source review and field-level evidence.
