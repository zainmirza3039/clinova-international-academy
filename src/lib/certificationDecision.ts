export const certificationRoles = [
  'certification_candidate',
  'certification_assessor',
  'certification_eligibility_reviewer',
  'certification_decision_maker',
  'certification_impartiality_officer',
  'certification_auditor',
] as const;

export type CertificationRole = typeof certificationRoles[number];
export type CertificationUser = { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> };

const roleSet = new Set<string>(certificationRoles);

/** Only server-managed app_metadata.clinova_roles is trusted; user-editable metadata is ignored. */
export function getCertificationRoles(user: CertificationUser | null | undefined): CertificationRole[] {
  const claims = user?.app_metadata?.clinova_roles;
  if (!Array.isArray(claims)) return [];
  return claims.filter((role): role is CertificationRole => typeof role === 'string' && roleSet.has(role));
}

export function hasCertificationRole(
  user: CertificationUser | null | undefined,
  required: CertificationRole,
): boolean {
  return getCertificationRoles(user).includes(required);
}

export type ReviewState = 'missing' | 'pending' | 'cleared' | 'conflict' | 'recused';
export type CertificationDecisionReadiness = {
  candidateId: string | null;
  schemeStatus: 'draft' | 'approved-for-operation' | 'suspended' | 'withdrawn';
  schemePolicyVersion: string | null;
  eligibilityStatus: 'pending' | 'verified' | 'not-eligible';
  eligibilityPolicyVersion: string | null;
  eligibilityEvidenceRef: string | null;
  assessmentStatus: 'not-started' | 'submitted';
  assessorId: string | null;
  assessmentEvidenceSha256: string | null;
  decisionPolicyApproved: boolean;
  decisionPolicyVersion: string | null;
  decisionMakerId: string | null;
  assessorConflictReview: ReviewState;
  decisionMakerConflictReview: ReviewState;
  impartialityReviewerId: string | null;
};

export type DecisionBlocker =
  | 'candidate-missing'
  | 'scheme-not-approved'
  | 'scheme-policy-missing'
  | 'eligibility-not-verified'
  | 'eligibility-policy-missing'
  | 'eligibility-evidence-missing'
  | 'assessment-not-submitted'
  | 'assessor-missing'
  | 'assessment-evidence-missing'
  | 'decision-policy-not-approved'
  | 'decision-policy-version-missing'
  | 'decision-maker-missing'
  | 'assessor-is-candidate'
  | 'decision-maker-is-candidate'
  | 'assessor-and-decision-maker-not-independent'
  | 'assessor-conflict-not-cleared'
  | 'decision-maker-conflict-not-cleared'
  | 'impartiality-reviewer-not-independent';

const sha256Pattern = /^[a-f0-9]{64}$/i;
const present = (value: string | null) => Boolean(value?.trim());

/**
 * Returns blockers only. This does not assess competence, determine an award,
 * issue a certificate, or connect to a database. A real decision requires an
 * approved scheme and policy plus evidence and independently recorded reviews.
 */
export function getCertificationDecisionBlockers(
  readiness: CertificationDecisionReadiness,
): DecisionBlocker[] {
  const blockers: DecisionBlocker[] = [];
  if (!present(readiness.candidateId)) blockers.push('candidate-missing');
  if (readiness.schemeStatus !== 'approved-for-operation') blockers.push('scheme-not-approved');
  if (!present(readiness.schemePolicyVersion)) blockers.push('scheme-policy-missing');
  if (readiness.eligibilityStatus !== 'verified') blockers.push('eligibility-not-verified');
  if (!present(readiness.eligibilityPolicyVersion)) blockers.push('eligibility-policy-missing');
  if (!present(readiness.eligibilityEvidenceRef)) blockers.push('eligibility-evidence-missing');
  if (readiness.assessmentStatus !== 'submitted') blockers.push('assessment-not-submitted');
  if (!present(readiness.assessorId)) blockers.push('assessor-missing');
  if (!readiness.assessmentEvidenceSha256 || !sha256Pattern.test(readiness.assessmentEvidenceSha256)) blockers.push('assessment-evidence-missing');
  if (!readiness.decisionPolicyApproved) blockers.push('decision-policy-not-approved');
  if (!present(readiness.decisionPolicyVersion)) blockers.push('decision-policy-version-missing');
  if (!present(readiness.decisionMakerId)) blockers.push('decision-maker-missing');

  const candidateId = readiness.candidateId;
  const assessorId = readiness.assessorId;
  const decisionMakerId = readiness.decisionMakerId;
  if (candidateId && assessorId === candidateId) blockers.push('assessor-is-candidate');
  if (candidateId && decisionMakerId === candidateId) blockers.push('decision-maker-is-candidate');
  if (assessorId && decisionMakerId && assessorId === decisionMakerId) blockers.push('assessor-and-decision-maker-not-independent');

  if (readiness.assessorConflictReview !== 'cleared') blockers.push('assessor-conflict-not-cleared');
  if (readiness.decisionMakerConflictReview !== 'cleared') blockers.push('decision-maker-conflict-not-cleared');
  const reviewerId = readiness.impartialityReviewerId;
  if (!present(reviewerId) || reviewerId === candidateId || reviewerId === assessorId || reviewerId === decisionMakerId) {
    blockers.push('impartiality-reviewer-not-independent');
  }
  return blockers;
}

export function canRecordCertificationDecision(readiness: CertificationDecisionReadiness): boolean {
  return getCertificationDecisionBlockers(readiness).length === 0;
}
