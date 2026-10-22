import assessmentAndPain from './articles/assessment-and-pain.json';
import rehabilitation from './articles/rehabilitation.json';
import clinicalPractice from './articles/clinical-practice.json';

export interface EducationalSection { heading: string; paragraphs: string[] }
export interface EducationalReference { title: string; url: string }
export interface EducationalArticle {
  id: string; slug: string; title: string; excerpt: string; category: string;
  status: string; seoTitle: string; seoDescription: string;
  sections: EducationalSection[]; takeaways: string[];
  references: EducationalReference[];
  relatedArticleSlugs: string[]; relatedProgrammeSlugs: string[];
}

export const educationalDisclaimer = 'For general educational discussion only. This material is not patient-specific medical advice, a clinical protocol or evidence of professional competency. Check current evidence, local guidance and scope of practice before applying information; seek urgent local medical help for new severe or rapidly worsening symptoms.';
export const draftDateLabel = 'Educational overview';

export const educationalArticles: EducationalArticle[] = [
  ...assessmentAndPain, ...rehabilitation, ...clinicalPractice,
].map(article => ({ ...article, status: 'published' }));

const legacyArticleSlugs: Record<string, string> = {
  'draft-cpd-in-healthcare-practice': 'evidence-based-practice-physiotherapy',
  'draft-evidence-informed-pain-management': 'musculoskeletal-pain-and-function',
  'draft-clinical-communication': 'clinical-documentation-communication',
};
export function getEducationalArticle(slug: string | undefined): EducationalArticle | undefined {
  if (!slug) return undefined;
  return educationalArticles.find(article => article.slug === (legacyArticleSlugs[slug] ?? slug));
}

export { newsItems as educationalArticleCards } from './testimonials';
