# Workstream 06 — Learning, assessment and certificates

## Objective
Deliver the smallest credible learning lifecycle that can be safely demonstrated to pilot learners.

## Ownership
- Enrolled learner access to programme learning materials
- Lesson/module progression and progress persistence
- Basic assessment submission and result state
- Certificate eligibility rules and issuance workflow
- Public certificate verification using immutable issuance-time facts

## Acceptance criteria
- Only eligible enrolled learners can access protected learning materials.
- Progress and assessment submissions persist and are associated with the correct learner/enrolment.
- Assessment outcomes are deterministic, validated server-side and auditable.
- Certificates cannot be issued by an untrusted client.
- Verification returns issuance-time identity and programme details, not mutable profile fields.
- Revocation/correction states are explicit; no certificate is described as accredited unless verified.

## Exclusions
Advanced proctoring, complex assessor moderation, CPD regulator integrations and full certification-body governance.

## Dependencies
Learner identity from Workstream 04 and enrolment records from Workstream 05. Coordinate all schema/RLS work with Workstream 07.

## Verification
Access-control tests, assessment boundary tests, certificate issuance/verification tests and non-production database validation.