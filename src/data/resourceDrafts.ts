import articleCards from './articleIndex.json';

/** Proposed educational drafts, not testimonials or confirmed academy publications. */
export const newsItems = articleCards;
export const newsCategories = [...new Set(newsItems.map(item => item.category))];
