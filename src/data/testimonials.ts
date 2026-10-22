import educationalArticleCards from './articleIndex.json';
import type { NewsItem, FAQ, Certificate } from './types';

/** Editorial placeholders only; no learner testimonials are published here. */
export const testimonials: never[] = [];

export const newsItems: NewsItem[] = educationalArticleCards;

export const generalFAQs: FAQ[] = [
  { id: 'f1', question: 'Are the listed programmes accredited?', answer: 'Accreditation status is not confirmed in this draft catalogue. Please contact the academy for current confirmation before relying on any programme for professional or regulatory requirements.' },
  { id: 'f2', question: 'How will programmes be delivered?', answer: 'Delivery format, platform and access arrangements are awaiting academy confirmation. The catalogue is not an enrolment or availability confirmation.' },
  { id: 'f3', question: 'Can I study while working?', answer: 'The suitability of each programme for working professionals, including schedule and workload, requires academy confirmation for the specific offering.' },
  { id: 'f4', question: 'Will I receive a certificate?', answer: 'Certificate type and eligibility are awaiting academy confirmation for each offering. Do not treat this draft catalogue as a promise of certification.' },
  { id: 'f5', question: 'What are the entry requirements?', answer: 'Entry requirements vary and are awaiting academy confirmation. Please request the current requirements before applying.' },
  { id: 'f6', question: 'How long will I have access to materials?', answer: 'Access periods and platform arrangements are awaiting academy confirmation and are not currently guaranteed.' },
];

/** Empty until a connected, academy-authorised verification service exists. */
export const certificateDatabase: Certificate[] = [];
export const newsCategories = [...new Set(newsItems.map(item => item.category))];
