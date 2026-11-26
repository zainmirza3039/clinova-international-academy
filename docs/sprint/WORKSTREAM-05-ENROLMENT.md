# Workstream 05 — Enquiry and enrolment

## Objective
Connect programme discovery to a reliable enquiry/application and enrolment lifecycle.

## Ownership
- Contact and programme enquiry submission
- Application form validation and consent
- Server-side persistence and duplicate/submission handling
- Enrolment statuses and learner-to-programme association
- Clear applicant confirmation and admin review handoff

## Acceptance criteria
- Submissions are persisted only through a secure server/database path.
- Client validation is paired with server-side validation.
- Duplicate submissions and retries are handled safely.
- Applicant data is private and accessible only to authorized roles.
- Status transitions are explicit and auditable.
- The UI never claims an application was submitted unless persistence succeeds.

## Exclusions
No course delivery, assessment grading, certificate issuance or broad CMS/admin redesign.

## Dependencies
Programme identifiers from Workstream 03; learner identity contract from Workstream 04; schema/security review coordinated with Workstream 07.

## Verification
Form tests, persistence tests against disposable/non-production database, RLS tests and failure/retry tests.