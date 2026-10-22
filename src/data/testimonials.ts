import type { NewsItem, FAQ, Certificate } from './types';

/** Editorial placeholders only; no learner testimonials are published here. */
export const testimonials: never[] = [];

export const newsItems: NewsItem[] = [
  { id: 'draft-1', slug: 'draft-cpd-in-healthcare-practice', category: 'Draft editorial', date: 'Draft — publication date awaiting academy confirmation', title: 'DRAFT: The role of CPD in healthcare practice', excerpt: 'Editorial concept only. This article has not been published or endorsed by the academy; content and sources require review before publication.', image: 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 'draft-2', slug: 'draft-evidence-informed-pain-management', category: 'Draft editorial', date: 'Draft — publication date awaiting academy confirmation', title: 'DRAFT: Evidence-informed approaches to pain management', excerpt: 'Editorial concept only. Any clinical claims, references and publication status require academy review before use.', image: 'https://images.pexels.com/photos/4506169/pexels-photo-4506169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 'draft-3', slug: 'draft-clinical-communication', category: 'Draft editorial', date: 'Draft — publication date awaiting academy confirmation', title: 'DRAFT: Communication skills in clinical practice', excerpt: 'Editorial concept only. This is not an academy announcement and is not yet approved for publication.', image: 'https://images.pexels.com/photos/5934556/pexels-photo-5934556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
];

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
export const newsCategories = ['Draft editorial'];
