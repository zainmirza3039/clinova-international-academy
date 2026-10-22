import type { Testimonial, NewsItem, FAQ } from './types';

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    role: 'Physiotherapist',
    country: 'United Kingdom',
    quote:
      'The musculoskeletal assessment programme strengthened my clinical reasoning and gave me a systematic framework I use daily in practice. The online format made it easy to study alongside work.',
    isDemo: true,
  },
  {
    id: 't2',
    role: 'Registered Nurse',
    country: 'Australia',
    quote:
      'A well-structured learning experience. The patient-centred care programme provided practical communication strategies I could apply immediately in my clinical setting.',
    isDemo: true,
  },
  {
    id: 't3',
    role: 'Sports Therapist',
    country: 'United Arab Emirates',
    quote:
      'The sports rehabilitation programme covered rehabilitation principles comprehensively. The return-to-play testing module was particularly valuable for my work with athletes.',
    isDemo: true,
  },
  {
    id: 't4',
    role: 'Healthcare Manager',
    country: 'Nigeria',
    quote:
      'The healthcare leadership programme equipped me with practical change management tools. The quality improvement module helped me implement meaningful changes in our department.',
    isDemo: true,
  },
];

export const newsItems: NewsItem[] = [
  {
    id: 'n1',
    slug: 'the-importance-of-cpd-in-healthcare-practice',
    category: 'Professional Development',
    date: '2026-09-15',
    title: 'The Importance of CPD in Healthcare Practice',
    excerpt:
      'Continuing professional development is essential for healthcare practitioners. We explore why structured learning matters and how online education is making it more accessible.',
    image: 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'n2',
    slug: 'evidence-based-approaches-to-pain-management',
    category: 'Clinical Education',
    date: '2026-09-08',
    title: 'Evidence-Based Approaches to Pain Management',
    excerpt:
      'A look at the biopsychosocial model of pain and how healthcare professionals can integrate evidence-informed strategies into their clinical practice.',
    image: 'https://images.pexels.com/photos/4506169/pexels-photo-4506169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'n3',
    slug: 'advancing-online-healthcare-education',
    category: 'Academy News',
    date: '2026-08-28',
    title: 'Advancing Online Healthcare Education',
    excerpt:
      'Clinova International Academy expands its programme offerings with new CPD-focused courses across multiple healthcare departments.',
    image: 'https://images.pexels.com/photos/5934556/pexels-photo-5934556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'n4',
    slug: 'communication-skills-in-clinical-practice',
    category: 'Healthcare Insights',
    date: '2026-08-20',
    title: 'Communication Skills in Clinical Practice',
    excerpt:
      'Effective communication is a core clinical skill. We discuss frameworks that help healthcare professionals navigate difficult conversations with patients.',
    image: 'https://images.pexels.com/photos/7447058/pexels-photo-7447058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'n5',
    slug: 'study-resources-for-healthcare-professionals',
    category: 'Learning Resources',
    date: '2026-08-10',
    title: 'Study Resources for Healthcare Professionals',
    excerpt:
      'A curated guide to evidence-based resources, journals and learning tools that support ongoing professional development in healthcare.',
    image: 'https://images.pexels.com/photos/6770532/pexels-photo-6770532.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'n6',
    slug: 'rehabilitation-science-recent-developments',
    category: 'Clinical Education',
    date: '2026-07-30',
    title: 'Rehabilitation Science: Recent Developments',
    excerpt:
      'An overview of current developments in rehabilitation science, including motor learning principles and their application in clinical practice.',
    image: 'https://images.pexels.com/photos/20860596/pexels-photo-20860596.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export const generalFAQs: FAQ[] = [
  {
    id: 'f1',
    question: 'Are Clinova programmes accredited?',
    answer:
      'Clinova programmes are CPD-focused educational courses. We do not currently claim formal accreditation from any regulatory body. All programmes offer a Certificate of Completion. Accreditation status may change in the future, and we will communicate any updates.',
  },
  {
    id: 'f2',
    question: 'How are programmes delivered?',
    answer:
      'All Clinova programmes are delivered entirely online. You can access learning materials, video lessons, reading resources and assessments through our online learning platform at any time that suits your schedule.',
  },
  {
    id: 'f3',
    question: 'Can I study while working full-time?',
    answer:
      'Yes. Our programmes are designed for working healthcare professionals. The online, self-paced format allows you to study around your professional commitments. Most programmes can be completed in 8-24 weeks depending on the level.',
  },
  {
    id: 'f4',
    question: 'Will I receive a certificate?',
    answer:
      'Yes. Upon successful completion of a programme, you will receive a digital Certificate of Completion. Certificates can be verified through our online certificate verification system.',
  },
  {
    id: 'f5',
    question: 'What are the entry requirements?',
    answer:
      'Entry requirements vary by programme. Most programmes are designed for qualified healthcare professionals or students in relevant fields. Individual programme pages specify any recommended background knowledge.',
  },
  {
    id: 'f6',
    question: 'How long do I have access to course materials?',
    answer:
      'You will have access to programme materials for the duration of your enrolment period, plus an additional period to complete any outstanding assessments. Specific access periods are noted on each programme page.',
  },
];

export const newsCategories = [
  'Clinical Education',
  'Professional Development',
  'Healthcare Insights',
  'Academy News',
  'Learning Resources',
];
