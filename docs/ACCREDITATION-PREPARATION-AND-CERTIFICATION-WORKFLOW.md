# Clinova certification and accreditation preparation

**Status: internal development proposal only.** This document is a work plan, not a conformity assessment, certification scheme, application, approval, or accreditation claim. No Clinova scheme is open for candidates. No certificate is issued or verified by this system.

## Current reference basis

ISO lists **ISO/IEC 17024:2026, Edition 3**, published on 31 March 2026, as the current edition. ISO lists ISO/IEC 17024:2012 as withdrawn. UKAS’s 26 October 2026 transition bulletin says organisations considering an application should develop systems and processes to the 2026 edition.

UKAS states that it will be ready to assess to the 2026 edition from 1 January 2027. The 2027 transition period is optional for existing accredited personnel certification bodies; new applications from 1 January 2027 are to the 2026 edition; all UKAS assessments move to the 2026 edition from 1 January 2028; and accreditation to the 2012 edition ceases to be valid after 31 March 2029. These dates are copied here as a concise factual summary, not as Clinova status.

- [ISO/IEC 17024:2026](https://www.iso.org/standard/17024)
- [ISO record for withdrawn ISO/IEC 17024:2012](https://www.iso.org/standard/52993.html)
- [UKAS transition bulletin, 26 October 2026](https://www.ukas.com/resources/technical-bulletins/transition-arrangements-for-iso-iec-170242026-conformity-assessment-general-requirements-for-bodies-operating-certification-of-persons/)
- [UKAS certification-body accreditation scope](https://www.ukas.com/accreditation/standards/certification-body-accreditation/)

The ISO standard is copyrighted. This project does not reproduce its clauses or substitute for obtaining and reviewing the published standard and UKAS requirements.

## Proposed Clinova certification model

Education, assessment and certification decisions are separate functions. Education or CPD participation alone cannot establish competence or lead automatically to certification. Assessors submit assessment evidence and results; a separately authorised decision-maker reviews the approved scheme, eligibility evidence, assessment record, impartiality checks and decision policy, then records an independent outcome with reasons. A decision does not automatically generate a certificate.

The owner-proposed starting point is **Musculoskeletal Physiotherapy Assessment & Clinical Competence**. This is a development proposal, not a defined or open scheme. Medical practice and nursing are also proposal-only areas. Competency statements, eligibility requirements, exam blueprints, OSCE rubrics, portfolio criteria, pass thresholds, appeals, renewal and recertification rules must be designed, reviewed and approved for each scheme before use. No thresholds or candidate facts are invented here.

Assessment methods in the source brief—written examination, case assessment, practical OSCE and portfolio—are design options only. Which methods apply, how they are secured, scored, moderated or combined is not settled.

## Draft work register

| Work area | Development output needed | Safe status now |
| --- | --- | --- |
| Governance | Documented responsibilities, confidentiality, impartiality and conflict controls | Draft; no evidence record |
| Scheme design | Approved scope, competence basis, eligibility, assessment and maintenance rules | Not defined; no scheme open |
| Assessment | Assessor competence, secure instruments, evidence handling, scoring, moderation and appeals | Not approved |
| Decision independence | Separation between assessors and decision personnel; recorded reasons and evidence | Modelled locally; no operational decisions |
| Quality management | Controlled documents, audit plan, corrective actions and management review | Draft outline |
| Candidate services | Registration, identity/qualification checks, eligibility and privacy/retention controls | Not connected; no candidate information collected |
| Certificate lifecycle | Issuance authority, identifier, scope, dates, renewal, suspension and withdrawal | No issuance or verification service |
| Digital controls | Least-privilege server roles, immutable audit trail, security and tested database access | Local proposal and disposable-database tests only |
| Accreditation | Current-edition gap analysis, objective evidence, independent review and application readiness | Preparation only; no conformity or award claim |

## Role separation and decision gates

Proposed server-managed role groups are candidate, assessor, eligibility reviewer, certification decision-maker, impartiality officer and auditor. These are design labels; none is provisioned in hosted Auth. A candidate cannot assess their own case. The assessor cannot decide the same case. An impartiality reviewer must be independent of the candidate, assessor and decision-maker. Conflicts must be declared and reviewed; a conflict or recusal blocks the decision. Only the approved scheme and versioned policy may define a substantive outcome.

The local decision model blocks a decision unless the scheme and policy are approved, eligibility evidence is verified, an assessor has submitted evidence, the decision-maker is distinct, and independent conflict reviews are clear. This gate is not a clinical competence assessment and cannot issue a certificate.

## Digital and release boundary

The frontend workspaces are fail-closed shells. They do not query or write candidate, assessment, certificate or accreditation records. The SQL contract is stored under `supabase/proposals/`, not under migrations, and is exercised only against an isolated disposable PostgreSQL cluster. It must not be applied to production or treated as an approved database design. No public certificate table/view or issuance/verification function is created.

Auth, candidate data, roles, hosted schema, storage, issuance, verification and accreditation claims remain disabled pending authoritative scheme/policy approval, a privacy and retention decision, role provisioning, approved non-production Supabase, security testing and separate hosted-change authorization.

The exact internal reference number and preliminary-assessment wording were not present in the supplied file or fresh repository. They are intentionally omitted from source and public content; add them only to an approved restricted system when supplied and authorized.
