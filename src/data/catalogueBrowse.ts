export interface OwnerListedCPDTopic {
  id: string;
  slug: string;
  title: string;
  /** Subject grouping from the supplied list; use for navigation only, not as an approved department. */
  subjectArea: string;
}

/**
 * Minimal public-discovery projection of the twelve topic titles in the
 * owner-supplied Clinova content inventory. Course descriptions, delivery,
 * hours, curricula, images and the four additional source rows are deliberately
 * not imported into the runtime catalogue bundle. These labels do not imply
 * clinical/editorial approval or a current course offer.
 */
export const ownerListedCPDTopics: OwnerListedCPDTopic[] = [
  { id: 'c1', slug: 'clinical-assessment-of-low-back-pain', title: 'Clinical Assessment of Low Back Pain', subjectArea: 'Physical Therapy & Rehabilitation' },
  { id: 'c2', slug: 'introduction-to-sports-rehabilitation', title: 'Introduction to Sports Rehabilitation', subjectArea: 'Sports & Exercise' },
  { id: 'c3', slug: 'pain-management-fundamentals', title: 'Pain Management Fundamentals', subjectArea: 'Physical Therapy & Rehabilitation' },
  { id: 'c4', slug: 'clinical-communication-skills', title: 'Clinical Communication Skills', subjectArea: 'Healthcare Management' },
  { id: 'c5', slug: 'wound-care-essentials', title: 'Wound Care Essentials', subjectArea: 'Nursing & Allied Health' },
  { id: 'c6', slug: 'pharmacotherapy-updates-in-chronic-disease', title: 'Pharmacotherapy Updates in Chronic Disease', subjectArea: 'Pharmacy' },
  { id: 'c7', slug: 'cbt-for-anxiety-disorders', title: 'CBT for Anxiety Disorders', subjectArea: 'Psychology & Mental Health' },
  { id: 'c8', slug: 'clinical-nutrition-for-chronic-disease', title: 'Clinical Nutrition for Chronic Disease', subjectArea: 'Nutrition & Dietetics' },
  { id: 'c9', slug: 'patient-safety-in-clinical-practice', title: 'Patient Safety in Clinical Practice', subjectArea: 'Medicine' },
  { id: 'c10', slug: 'motor-control-relearning-in-neurorehabilitation', title: 'Motor Control & Relearning in Neurorehabilitation', subjectArea: 'Physical Therapy & Rehabilitation' },
  { id: 'c11', slug: 'infection-prevention-and-control', title: 'Infection Prevention and Control', subjectArea: 'Nursing & Allied Health' },
  { id: 'c12', slug: 'quality-improvement-in-healthcare', title: 'Quality Improvement in Healthcare', subjectArea: 'Healthcare Management' },
];

export const ownerListedCPDTopicIds = ownerListedCPDTopics.map((topic) => topic.id);

export function getOwnerListedCPDTopicBySlug(slug: string): OwnerListedCPDTopic | undefined {
  return ownerListedCPDTopics.find((topic) => topic.slug === slug);
}

export function getOwnerListedCPDTopicsBySubjectArea(subjectArea: string): OwnerListedCPDTopic[] {
  return ownerListedCPDTopics.filter((topic) => topic.subjectArea === subjectArea);
}
