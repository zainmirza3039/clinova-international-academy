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

export type PublicationStatus = 'draft' | 'review' | 'published' | 'archived';

export interface Programme {
  id: string;
  slug: string;
  publicationStatus: PublicationStatus;
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
  publicationStatus: PublicationStatus;
  slug: string;
  title: string;
  department: string;
  cpdHours: number;
  duration: string;
  level: ProgrammeLevel;
  description: string;
  learningOutcomes: string[];
  modules: string[];
  prerequisites: string;
  assessment: string;
  image: string;
}

export interface NewsItem {
  id: string;
  publicationStatus: PublicationStatus;
  slug: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  sections: ArticleSection[];
  takeaways: string[];
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
