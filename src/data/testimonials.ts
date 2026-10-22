import educationalArticleCards from './articleIndex.json';
import type { NewsItem, FAQ, Certificate } from './types';

/** Learner testimonials are omitted; no testimonial is published without consent and verification. */
export const testimonials: never[] = [];

export const newsItems: NewsItem[] = educationalArticleCards;

export const generalFAQs: FAQ[] = [
  { id: 'f1', question: 'Are the listed programmes accredited?', answer: 'The articles and study guides on this website do not themselves constitute accredited programmes. No accredited status or CPD credit should be inferred unless it is explicitly documented for a specific offering.' },
  { id: 'f2', question: 'How will programmes be delivered?', answer: 'Public articles and study guides are accessed through this website for independent reading. Live teaching or course delivery is not included unless a specific offering explicitly says so.' },
  { id: 'f3', question: 'Can I study while working?', answer: 'The public learning library can be explored independently. Any schedule or workload for a separate course should be stated in that course’s published terms.' },
  { id: 'f4', question: 'Will I receive a certificate?', answer: 'Reading public articles and study guides does not award a certificate. Any separate certificate arrangement must be explicitly described for the relevant offering.' },
  { id: 'f5', question: 'What are the entry requirements?', answer: 'No admission is required to read public learning resources. A separate course may have entry requirements stated in its published terms.' },
  { id: 'f6', question: 'How long will I have access to materials?', answer: 'Public resources can be read while they remain available on the website. Any separate learner account or course access period would be described in its own terms.' },
];

/** Empty until a connected, academy-authorised verification service exists. */
export const certificateDatabase: Certificate[] = [];
export const newsCategories = [...new Set(newsItems.map(item => item.category))];
