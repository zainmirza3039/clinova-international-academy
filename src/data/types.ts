export interface Department {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  overview: string;
  image: string;
  programmeCount: number;
  learningAreas: string[];
}

export interface Module {
  number: number;
  title: string;
  description: string;
  topics: string[];
}

export interface Programme {
  id: string;
  slug: string;
  title: string;
  department: string;
  departmentSlug: string;
  category: ProgrammeCategory;
  description: string;
  overview: string;
  duration: string;
  cpdHours: number | null;
  delivery: string;
  level: ProgrammeLevel;
  certificate: string;
  image: string;
  modules: Module[];
  learningOutcomes: string[];
  assessment: string;
  whoFor: string[];
  status: ProgrammeStatus;
  /** Publication state for catalogue safety; legacy status remains filter-compatible. */
  publicationStatus?: PublicationStatus;
  featured: boolean;
}

export type ProgrammeCategory = 'Learning Guide' | 'Certificate' | 'Diploma' | 'Professional Development' | 'CPD';
export type ProgrammeLevel = 'Foundation' | 'Intermediate' | 'Advanced';
export type ProgrammeStatus = 'Draft' | 'Published' | 'Open' | 'Coming Soon';
export type PublicationStatus = 'draft' | 'published';

export interface CPDCourse {
  id: string;
  slug: string;
  title: string;
  department: string;
  cpdHours: number | null;
  duration: string;
  level: ProgrammeLevel;
  description: string;
  image: string;
  /** Publication state for catalogue safety. */
  publicationStatus?: PublicationStatus;
}

export interface Testimonial {
  id: string;
  role: string;
  country: string;
  quote: string;
  isDemo: boolean;
}

export interface NewsItem {
  id: string;
  slug: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  holder: string;
  course: string;
  issueDate: string;
  cpdHours: number;
  status: 'verified' | 'not-found';
}
