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
  cpdHours: number;
  delivery: string;
  level: ProgrammeLevel;
  certificate: string;
  image: string;
  modules: Module[];
  learningOutcomes: string[];
  assessment: string;
  whoFor: string[];
  status: ProgrammeStatus;
  featured: boolean;
}

export type ProgrammeCategory = 'Certificate' | 'Diploma' | 'Professional Development' | 'CPD';
export type ProgrammeLevel = 'Foundation' | 'Intermediate' | 'Advanced';
export type ProgrammeStatus = 'Open' | 'Coming Soon';

export interface CPDCourse {
  id: string;
  slug: string;
  title: string;
  department: string;
  cpdHours: number;
  duration: string;
  level: ProgrammeLevel;
  description: string;
  image: string;
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
