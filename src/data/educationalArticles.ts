import { newsItems as mainArticleSnapshots } from './content';
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

export const educationalDisclaimer = 'Educational draft for professional discussion, not patient-specific medical advice, a clinical protocol or evidence of competency. Qualified clinical and editorial review is required before publication or clinical use. Follow local guidance, scope of practice and individual assessment; seek urgent local medical help for new severe or rapidly worsening symptoms.';
export const draftDateLabel = 'Draft — publication date awaiting academy confirmation';

export const educationalArticles: EducationalArticle[] = [
  ...assessmentAndPain, ...rehabilitation, ...clinicalPractice,
].map(article => ({ ...article, status: 'draft' }));

const legacyArticleSlugs: Record<string, string> = {
  'draft-cpd-in-healthcare-practice': 'evidence-based-practice-physiotherapy',
  'draft-evidence-informed-pain-management': 'musculoskeletal-pain-and-function',
  'draft-clinical-communication': 'clinical-documentation-communication',
};
export function getEducationalArticle(slug: string | undefined): EducationalArticle | undefined {
  if (!slug) return undefined;
  const draft = educationalArticles.find(article => article.slug === (legacyArticleSlugs[slug] ?? slug));
  if (draft) return draft;
  const existing = mainArticleSnapshots.find(article => article.slug === slug);
  return existing ? { ...existing, status: 'draft', seoTitle: existing.title, seoDescription: existing.excerpt, references: [], relatedArticleSlugs: [], relatedProgrammeSlugs: [] } : undefined;
}

export { newsItems as educationalArticleCards } from './resourceDrafts';
