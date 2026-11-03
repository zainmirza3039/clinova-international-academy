import { describe, expect, it } from 'vitest';
import { canRecordCertificationDecision, getCertificationDecisionBlockers, getCertificationRoles, type CertificationDecisionReadiness } from '@/lib/certificationDecision';

const blockedByDefault: CertificationDecisionReadiness = {
  candidateId: null,
  schemeStatus: 'draft',
  schemePolicyVersion: null,
  eligibilityStatus: 'pending',
  eligibilityPolicyVersion: null,
  eligibilityEvidenceRef: null,
  assessmentStatus: 'not-started',
  assessorId: null,
  assessmentEvidenceSha256: null,
  decisionPolicyApproved: false,
  decisionPolicyVersion: null,
  decisionMakerId: null,
  assessorConflictReview: 'pending',
  decisionMakerConflictReview: 'pending',
  impartialityReviewerId: null,
};

describe('draft certification decision safeguards', () => {
  it('trusts only server-managed app_metadata.clinova_roles', () => {
    expect(getCertificationRoles({ user_metadata: { clinova_roles: ['certification_decision_maker'] } })).toEqual([]);
    expect(getCertificationRoles({ app_metadata: { clinova_roles: ['certification_assessor', 'admin', 'certification_decision_maker'] } })).toEqual(['certification_assessor', 'certification_decision_maker']);
    expect(getCertificationRoles(null)).toEqual([]);
  });

  it('fails closed when scheme, policy, eligibility, evidence and independent reviews are missing', () => {
    const blockers = getCertificationDecisionBlockers(blockedByDefault);
    expect(blockers).toEqual(expect.arrayContaining([
      'candidate-missing', 'scheme-not-approved', 'scheme-policy-missing', 'eligibility-not-verified',
      'eligibility-policy-missing', 'eligibility-evidence-missing', 'assessment-not-submitted',
      'assessor-missing', 'assessment-evidence-missing', 'decision-policy-not-approved',
      'decision-policy-version-missing', 'decision-maker-missing', 'assessor-conflict-not-cleared',
      'decision-maker-conflict-not-cleared', 'impartiality-reviewer-not-independent',
    ]));
    expect(canRecordCertificationDecision(blockedByDefault)).toBe(false);
  });

  it('rejects self-assessment, shared assessor/decision-maker and non-independent impartiality review', () => {
    const readiness = {
      ...blockedByDefault, candidateId: 'candidate', schemeStatus: 'approved-for-operation' as const,
      schemePolicyVersion: 'v1', eligibilityStatus: 'verified' as const, eligibilityPolicyVersion: 'v1',
      eligibilityEvidenceRef: 'local-evidence-ref', assessmentStatus: 'submitted' as const,
      assessorId: 'candidate', assessmentEvidenceSha256: 'a'.repeat(64), decisionPolicyApproved: true,
      decisionPolicyVersion: 'v1', decisionMakerId: 'candidate', assessorConflictReview: 'cleared' as const,
      decisionMakerConflictReview: 'cleared' as const, impartialityReviewerId: 'candidate',
    };
    const blockers = getCertificationDecisionBlockers(readiness);
    expect(blockers).toEqual(expect.arrayContaining([
      'assessor-is-candidate', 'decision-maker-is-candidate', 'assessor-and-decision-maker-not-independent',
      'impartiality-reviewer-not-independent',
    ]));
    expect(canRecordCertificationDecision(readiness)).toBe(false);
  });
});
