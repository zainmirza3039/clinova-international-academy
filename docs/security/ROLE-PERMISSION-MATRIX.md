# Clinova — Initial Role/Permission Matrix

**Status:** Proposed seed catalogue for review; not applied to the database.
**Rule:** A permission is effective only when the user has an active assignment matching the resource scope. A global assignment is not implied by holding a role.

## Permission catalogue

| Permission key | Domain | Intended operation |
|---|---|---|
| `platform.settings.manage` | platform | Change platform-level settings |
| `access.roles.request` | access | Request a role assignment/change |
| `access.roles.approve_privileged` | access | Approve a controlled privileged role change |
| `access.roles.revoke` | access | Revoke an assignment within authorized scope |
| `admissions.application.read` | admissions | Read assigned applications |
| `admissions.application.review` | admissions | Record an application review |
| `admissions.application.decide` | admissions | Record an admission decision |
| `admissions.documents.review` | admissions | Review private applicant documents |
| `institutions.read` | institutions | Read assigned institution profile |
| `institutions.manage` | institutions | Manage institution operational records |
| `institutions.agreements.manage` | institutions | Manage agreement lifecycle |
| `institutions.members.manage` | institutions | Manage scoped memberships |
| `finance.fees.manage` | finance | Maintain approved fee schedules |
| `finance.invoices.read` | finance | Read scoped invoices |
| `finance.invoices.issue` | finance | Issue invoices |
| `finance.payments.reconcile` | finance | Reconcile verified payment events |
| `finance.refunds.request` | finance | Request a refund |
| `finance.refunds.approve` | finance | Approve a refund within limits |
| `learning.catalogue.read` | learning | Read published learning catalogue |
| `learning.courses.manage` | learning | Manage course delivery content |
| `learning.enrolments.read` | learning | Read scoped enrolments |
| `learning.enrolments.manage` | learning | Manage scoped enrolments |
| `learning.progress.read` | learning | Read scoped learner progress |
| `learning.progress.record` | learning | Record teaching/progress observations |
| `assessment.definition.manage` | assessment | Create/version assessment definitions |
| `assessment.items.manage` | assessment | Manage item bank and answer keys |
| `assessment.attempts.start_own` | assessment | Start own permitted assessment attempt |
| `assessment.attempts.submit_own` | assessment | Submit own attempt |
| `assessment.marking.record` | assessment | Mark assigned assessment work |
| `assessment.moderation.review` | assessment | Moderate marks/results independently |
| `assessment.results.release` | assessment | Release approved results |
| `certification.scheme.manage` | certification | Manage scheme versions and criteria |
| `certification.application.read` | certification | Read assigned candidate applications |
| `certification.eligibility.review` | certification | Record eligibility decision |
| `certification.evidence.read` | certification | Read assigned candidate evidence |
| `certification.assessment.record` | certification | Record assigned competency observations |
| `certification.impartiality.review` | certification | Record conflict/impartiality review |
| `certification.decision.make` | certification | Make independent certification decision |
| `certification.credential.issue` | certification | Issue approved professional credential |
| `certification.credential.revoke` | certification | Revoke credential through controlled workflow |
| `content.item.create` | content | Create content draft |
| `content.version.edit` | content | Create/edit a new content version |
| `content.clinical.review` | content | Record clinical review |
| `content.editorial.review` | content | Record editorial review |
| `content.publish` | content | Publish approved content |
| `quality.documents.manage` | quality | Manage controlled documents and versions |
| `quality.audit.manage` | quality | Plan and record internal audits |
| `quality.findings.manage` | quality | Record findings and corrective actions |
| `quality.complaints.manage` | quality | Manage complaints and appeals |
| `quality.reports.read` | quality | Read authorized operational reports |
| `partner.portal.read` | partner | Read own institution/cohort workspace |
| `partner.learners.manage` | partner | Manage learners in own partner cohort |

## Role-to-permission baseline

| Role | Initial permissions | Scope and restrictions |
|---|---|---|
| `super_admin` | `platform.settings.manage`, `access.roles.approve_privileged`, `access.roles.revoke` | Global only by explicit controlled assignment; cannot waive audit or dual control |
| `academy_admin` | Operational read/manage permissions across approved domains; `access.roles.request` | No automatic super-admin, finance refund approval, certification decision or self-elevation |
| `admissions_officer` | admissions read/review/documents review/decide; institution read | Assigned application/intake/institution scope |
| `finance_officer` | finance fee, invoice, payment and refund workflow permissions | Assigned institution/programme scope; refund approval may require limit and second approval |
| `applicant` | own application read, own document upload, own application status read | Bound to own Auth UUID; no reviewer/decision permissions |
| `learner` | catalogue read, own enrolment/progress read, own attempt start/submit | Own learner records only |
| `instructor` | course read, assigned enrolment/progress read, progress record | Assigned course/cohort only; no grade release unless separately authorized |
| `content_author` | content item create, version edit | Cannot review or publish own version |
| `clinical_reviewer` | clinical review | Assigned content; independent from author |
| `editorial_reviewer` | editorial review | Assigned content; independent from author |
| `content_publisher` | content publish | Only after required approvals; cannot override missing approval |
| `assessor` | certification evidence read, assessment record; assessment marking record | Assigned candidate/case only; cannot make final certification decision on same case |
| `eligibility_reviewer` | certification application read, eligibility review | Assigned scheme/candidate only |
| `certification_decision_maker` | certification application/evidence read, decision make, credential issue | Independent from assessor and eligibility reviewer for the same case where policy requires |
| `impartiality_officer` | impartiality review | Must be independent of the assessment/decision under review |
| `quality_officer` | quality document/audit/finding/complaint/report permissions | Scoped quality remit; cannot silently edit source audit history |
| `partner_manager` | partner portal read, own cohort learner management | Institution and active agreement scope only |

## Explicit non-inheritance rules

- `academy_admin` does not automatically receive `super_admin` or role-approval permission.
- `finance_officer` does not receive assessment, certification or admissions decision permissions.
- `instructor` does not receive finance or certification decision permissions.
- `assessor` does not receive final certification decision/credential issue permission for the same case.
- `content_author` does not receive clinical review, editorial review or publication permission.
- `partner_manager` cannot read another institution's data.
- `applicant` and `learner` permissions are always subject-bound; they are not broad role grants.

## Seed and implementation rules

1. Seed permissions first, then role-permission mappings in a migration.
2. Use stable keys; never use display labels as authorization identifiers.
3. No role gets a permission simply because a similarly named UI route exists.
4. Add scope resolution and conflict-of-interest checks to server/database commands.
5. Treat this matrix as a minimum baseline, not a final regulatory delegation schedule. Approval limits, signing authority, professional certification impartiality requirements and institutional delegations must be confirmed before production.
6. Test permission mappings with synthetic users and cross-scope negative tests before migrating real assignments.
