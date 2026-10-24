import assessmentAndPain from './articles/assessment-and-pain.json';
import rehabilitation from './articles/rehabilitation.json';
import clinicalPractice from './articles/clinical-practice.json';
import { newsItems as articleCards } from './testimonials';

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
export const draftDateLabel = 'Educational article · Source links provided for further reading';

export const educationalArticles: EducationalArticle[] = [
  ...assessmentAndPain, ...rehabilitation, ...clinicalPractice,
];
const sourceReviewedArticleSlugs = new Set([
  'low-back-pain-rehabilitation',
  'knee-osteoarthritis-rehabilitation',
  'stroke-rehabilitation-functional-goals',
  'balance-training-fall-prevention',
  'evidence-based-practice-physiotherapy',
]);
for (const article of educationalArticles) {
  article.status = sourceReviewedArticleSlugs.has(article.slug) ? 'published' : 'draft';
}

const legacyArticleSlugs: Record<string, string> = {
  'draft-cpd-in-healthcare-practice': 'evidence-based-practice-physiotherapy',
  'draft-evidence-informed-pain-management': 'musculoskeletal-pain-and-function',
  'draft-clinical-communication': 'clinical-documentation-communication',
};
export function getEducationalArticle(slug: string | undefined): EducationalArticle | undefined {
  if (!slug) return undefined;
  return educationalArticles.find(article => article.slug === (legacyArticleSlugs[slug] ?? slug));
}

export const publishedEducationalArticles = educationalArticles.filter(article => article.status === 'published');

export function getPublishedEducationalArticle(slug: string | undefined): EducationalArticle | undefined {
  const article = getEducationalArticle(slug);
  return article?.status === 'published' ? article : undefined;
}

export const educationalArticleCards = articleCards;
export const publishedEducationalArticleCards = articleCards.filter(card => getPublishedEducationalArticle(card.slug) !== undefined);
