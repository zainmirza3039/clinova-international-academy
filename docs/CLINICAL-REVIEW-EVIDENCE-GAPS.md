# Clinical-review evidence gaps

## Release summary

The current source snapshot contains **39 records**: 8 programmes, 16 CPD courses, and 15 educational articles. The complete record-by-record register is the [clinical-review identity inventory](CLINOVA-CLINICAL-REVIEW-INVENTORY.md), including each stable ID, exact title, canonical route, source file, effective-record SHA-256, current source publication flag, and review-evidence status. This feature branch marks all 8 programme and 16 CPD records draft-only; 15 article records retain their existing published source status.

The academy owner reports that clinical review is complete. The evidence available in this checkout does not establish which exact source hash each reviewer examined, nor provide reviewer identities, review dates, editorial review records, or release approvals. This means **exact-version clinical sign-off remains unverified**; it does not prove that no review occurred.

The supplied historical `CLINOVA-RELEASE-READINESS-REVIEW-1.md` is dated 2026-10-22 and explicitly marked **NOT APPROVED FOR RELEASE**. Its report date is not a per-record clinical review date, and it contains no hash-linked reviewer/editorial/release decisions. It is therefore not entered as record-level sign-off.

## What is verified from source

- All 39 stable IDs, titles, slugs/routes, source files, and effective-record hashes are listed in the inventory and checked against the exported source records by `tests/clinicalReviewInventory.test.ts`. No source identity row is unmatched; all 39 review-evidence rows remain unmatched to an authoritative hash-linked decision and are marked **Requires version-specific confirmation**.
- Current source publication flags match the inventory: all 8 programme and 16 CPD records are draft-only; the 15 article records are assigned `published` by `src/data/educationalArticles.ts`.
- No version-specific reviewer identity/date, editorial status, or release approval was found in the reviewed source records or supplied inventory evidence.

The baseline course publication fields were implementation metadata, not clinical approval, editorial approval, accreditation, or release approval. All programme and CPD source rows remain draft-only. The public topic directory now displays only the twelve owner-listed CPD title labels as proposal-only cards and detail statuses; it does not expose their curriculum or operational terms, and four additional CPD source rows remain hidden. Programme titles remain withheld until the conflicting owner lists and exact-version review coverage are reconciled. This visibility does not constitute clinical sign-off. Article publication remains a separate source status and does not prove approval of the exact article snapshots. No production system or indexing allowlist was broadened.

## Product implementation status

The current platform implementation does not change programme, CPD or article record content or publication flags. The programme catalogue remains status-only because the available owner sources contain conflicting programme lists and no exact-hash review map. The CPD directory exposes a separate allowlist of twelve owner-supplied title labels as proposed topics only; search and provisional subject grouping do not query a backend, publish curriculum, or open enrollment. The four CPD rows absent from the supplied topic list remain hidden. The 39-record identity/hash regression is a source-parity check, not evidence that a reviewer approved those hashes. Authentication, CMS workflow, learner persistence, applications, assessment, certification, issuance and verification remain disabled in source. See the [master development specification](CLINOVA-MASTER-DEVELOPMENT-SPECIFICATION.md) for current local scope; the [interactive pages audit](INTERACTIVE-PAGES-AUDIT.md) and [backend contract proposal](CERTIFICATION-VERIFICATION-COLLABORATION.md) are historical baseline notes.

## Evidence required before release

1. A qualified clinical reviewer must reconcile each record ID and effective-record SHA-256 to the exact content reviewed, and record their name, role/credentials, review date, decision, conditions, and evidence/source references.
2. Editorial review must be recorded separately, including reviewer, date, copy/source checks, and disposition of outstanding issues.
3. The academy release owner must record a separate release decision for each record (or a documented batch decision that names every included hash).
4. Recompute hashes after any content change and obtain a new review for changed hashes; a prior approval must not silently carry forward.
5. The owner must decide how records without complete evidence are handled before release. Programme and CPD records are currently draft-only; this status does not imply approval. Article publication status remains unchanged and must not be treated as exact-hash clinical or release sign-off.

## Per-record sign-off template

Complete one row per record using the linked inventory as the immutable source identity list. Do not sign off a title or slug alone; include the exact record hash.

| Stable ID | Exact title | Canonical route | Effective-record SHA-256 reviewed | Clinical reviewer name and credentials | Review date | Clinical decision and conditions | Editorial reviewer/date/status | Release owner/date/decision | Outstanding issues and resolution evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  | Not reviewed / Approved / Approved with conditions / Not approved |  |  |  |

A completed template is evidence only when the reviewer is authorized by the academy and the decision is explicitly linked to the exact content hash. No reviewer, date, approval, or accreditation claim is inferred here.
