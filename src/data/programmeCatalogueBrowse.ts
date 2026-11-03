export interface OwnerListedProgramme {
  id: string;
  slug: string;
  title: string;
}

/**
 * Title-only projection of the eight proposed programme names in the owner-supplied
 * Clinova Content Inventory. Source programme records stay draft-only; no other
 * programme fields are copied into the public catalogue projection.
 */
export const ownerListedProgrammes: OwnerListedProgramme[] = [
  { id: 'p1', slug: 'certificate-in-musculoskeletal-assessment', title: 'Certificate in Musculoskeletal Assessment' },
  { id: 'p2', slug: 'certificate-in-clinical-pain-management', title: 'Certificate in Clinical Pain Management' },
  { id: 'p3', slug: 'professional-development-in-sports-rehabilitation', title: 'Professional Development in Sports Rehabilitation' },
  { id: 'p4', slug: 'certificate-in-patient-centred-healthcare-practice', title: 'Certificate in Patient-Centred Healthcare Practice' },
  { id: 'p5', slug: 'diploma-in-rehabilitation-practice', title: 'Diploma in Rehabilitation Practice' },
  { id: 'p6', slug: 'certificate-in-healthcare-communication', title: 'Certificate in Healthcare Communication' },
  { id: 'p7', slug: 'certificate-in-cognitive-behavioural-therapy-fundamentals', title: 'Certificate in Cognitive Behavioural Therapy Fundamentals' },
  { id: 'p8', slug: 'professional-development-in-healthcare-leadership', title: 'Professional Development in Healthcare Leadership' },
];

export const ownerListedProgrammeIds = ownerListedProgrammes.map((programme) => programme.id);

export function getOwnerListedProgrammeBySlug(slug: string): OwnerListedProgramme | undefined {
  return ownerListedProgrammes.find((programme) => programme.slug === slug);
}
