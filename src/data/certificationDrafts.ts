export const certificationDevelopmentAreas = [
  { id: 'governance', title: 'Governance and impartiality', detail: 'Define responsibilities, confidentiality, conflicts of interest, recusals and independent oversight.' },
  { id: 'schemes', title: 'Certification schemes', detail: 'Develop and approve scheme-specific competence, eligibility, assessment and renewal rules before any scheme opens.' },
  { id: 'assessment', title: 'Assessment evidence', detail: 'Design secure, scheme-specific assessment and moderation controls; the methods in the planning brief are proposals, not adopted rules.' },
  { id: 'decisions', title: 'Independent certification decisions', detail: 'Keep assessment results separate from eligibility review and certification decisions, with documented reasons and evidence.' },
  { id: 'qms', title: 'Quality management and controlled records', detail: 'Prepare document control, audit, corrective-action and management-review workflows.' },
  { id: 'candidate-records', title: 'Candidate records and privacy', detail: 'Approve lawful data collection, access, retention, deletion and security before collecting candidate information.' },
  { id: 'certificates', title: 'Certificate lifecycle', detail: 'Approve issuance, unique identifiers, validity, renewal, suspension, withdrawal and verification policy before building live actions.' },
  { id: 'digital-controls', title: 'Digital access and audit', detail: 'Provision least-privilege server-managed roles, immutable audit records and tested access controls before connecting hosted services.' },
] as const;

/** Methods named in the owner-provided planning brief; they are not approved examination rules. */
export const proposedAssessmentMethods = [
  'MCQ and case-based tests',
  'Practical assessment',
  'OSCE',
] as const;
