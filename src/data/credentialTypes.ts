export const credentialTypes = [
  {
    id: 'cpd-completion',
    title: 'CPD completion certificate',
    purpose: 'Confirms participation or successful completion of an educational activity under that course’s separately approved assessment rules.',
    issuanceGate: 'A course-specific completion policy and authoritative completion evidence are required.',
    state: 'unavailable' as const,
  },
  {
    id: 'professional-competency',
    title: 'Professional competency certification credential',
    purpose: 'Confirms that a candidate met an approved competency standard after eligibility review, independent assessment and an authorised certification decision.',
    issuanceGate: 'An approved scheme, verified eligibility, complete assessment evidence, impartiality clearance and an independent recorded decision are required.',
    state: 'unavailable' as const,
  },
] as const;

export type CredentialTypeId = typeof credentialTypes[number]['id'];
