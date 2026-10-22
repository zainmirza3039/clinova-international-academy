import type { EducationalReference, EducationalSection } from './educationalArticles';
export interface LearningResource {
  slug: string; title: string; kind: string; summary: string;
  sections: EducationalSection[]; prompts: string[];
  relatedArticleSlugs: string[]; references: EducationalReference[];
}
const professionalStandards = { title: 'HCPC: Standards of proficiency — physiotherapists', url: 'https://www.hcpc-uk.org/standards/standards-of-proficiency/physiotherapists/' };
const sharedDecisions = { title: 'NICE NG197: Shared decision making — recommendations', url: 'https://www.nice.org.uk/guidance/ng197/chapter/Recommendations' };

export const learningResources: LearningResource[] = [
  {
    slug: 'assessment-reflection-checklist', title: 'Assessment Reflection Checklist', kind: 'Study checklist',
    summary: 'A discussion aid for reviewing the reasoning behind an assessment, not a diagnostic screen or permission to practise.',
    sections: [
      { heading: 'Before reviewing a case', paragraphs: ['Use a fictional vignette or an appropriately de-identified case in an approved teaching setting. Do not put real names, dates of birth, contact details or identifiable clinical narratives into this website. The checklist is not exhaustive and must not replace local emergency or safeguarding procedures.', 'Establish the learner’s role, competence and supervision. Ask what the person wants help with, what decisions are being considered and whether consent, communication support or capacity considerations change the assessment approach. A checklist cannot demonstrate that valid consent has been obtained.'] },
      { heading: 'Connect information to decisions', paragraphs: ['Separate reported experience, observed findings and your interpretation. For each proposed examination, identify the question it could answer, whether it is safe and within scope, and how a result would change the next step. Avoid collecting tests simply because they are familiar.', 'Finish with a provisional explanation that acknowledges uncertainty, a decision about supervision or referral, and a plan for reviewing meaningful function. Record why alternative explanations remain plausible. When reviewing a real clinical encounter, use the organisation’s approved records and privacy controls instead of an educational worksheet.'] },
    ],
    prompts: ['What matters most to the person, and how was this established?', 'What requires urgent escalation before routine examination?', 'Which findings support the working explanation, and which do not fit?', 'What is outside the learner’s competence or authority?', 'What would make the plan change, and who will review it?'],
    relatedArticleSlugs: ['physiotherapy-assessment-structured-approach', 'patient-safety-red-flags-referral'], references: [professionalStandards],
  },
  {
    slug: 'rehabilitation-planning-reflection', title: 'Rehabilitation Planning and Case Reflection', kind: 'Planning template',
    summary: 'A blank reasoning structure and fictional discussion task; not an exercise prescription or patient-management record.',
    sections: [
      { heading: 'Build a person-centred planning outline', paragraphs: ['Start with a meaningful activity rather than a list of impairments: what would the person like to do more comfortably, confidently or independently? Identify the context, baseline description and an appropriate outcome measure. Agree how a change will be recognised rather than assuming a test score captures everything that matters.', 'List options to discuss, expected burdens, uncertainty, access barriers and the possibility of no change in treatment. Progression, frequency and intensity require individual assessment and appropriate supervision; this resource intentionally gives no universal dosage or return-to-sport threshold.'] },
      { heading: 'Fictional learning exercise', paragraphs: ['A fictional adult wants to return to a community walking group but describes variable knee discomfort and worry about falling. No diagnosis, examination, medication history or red-flag assessment is supplied. Explain why prescribing a fixed programme from this description would be premature.', 'Write three questions that clarify the person’s priorities, three missing pieces of safety or contextual information, and a way to discuss options without promising a result. Compare answers with a qualified supervisor. This is an invented educational scenario, not an academy student or patient record, and it has no single diagnostic answer.'] },
    ],
    prompts: ['Priority activity and personal goal: ___', 'Baseline and agreed way to evaluate change: ___', 'Options, preferences and practical barriers: ___', 'Safety considerations and supervision/referral needs: ___', 'Review plan, responsible clinician and reasons to revise: ___'],
    relatedArticleSlugs: ['therapeutic-exercise-safe-progression', 'knee-osteoarthritis-rehabilitation'], references: [professionalStandards, sharedDecisions],
  },
  {
    slug: 'clinical-documentation-study-template', title: 'Clinical Documentation Study Template', kind: 'Documentation worksheet',
    summary: 'Practise separating reports, observations, reasoning and an agreed plan without entering personal information.',
    sections: [
      { heading: 'Use structure without confusing it with completeness', paragraphs: ['SOAP is one possible teaching structure: Subjective information, Objective findings, Assessment or interpretation, and Plan. It is not a mandatory universal record format, nor does completing four headings ensure that professional or legal requirements are met. Follow the organisation’s approved system and the rules that apply to the jurisdiction and setting.', 'For a fictional vignette, record the source of information, consent considerations, what was actually assessed, the limits of the examination, reasoning behind a decision and communication of the next step. Distinguish an observation from an inference. Do not document that something was normal, discussed or performed unless that is supported by the scenario.'] },
      { heading: 'Review clarity and confidentiality', paragraphs: ['Read the note as a colleague receiving a handover. Can you understand what changed, what remains uncertain, who owns the next action and when review is needed? Replace vague shorthand with clear language, avoid judgemental labels and identify corrections transparently through the approved record process.', 'Do not save a real note here. This site has no clinical record-storage service, approved retention policy or patient-data workflow. The fields below are reading prompts, not submission inputs.'] },
    ],
    prompts: ['S — Person’s account, priorities and relevant context: ___', 'O — What was observed or measured, including method and limitations: ___', 'A — Reasoning, uncertainty and escalation considerations: ___', 'P — Agreed next actions, communication and review arrangements: ___', 'Quality check — consent, privacy, accuracy and accountability: ___'],
    relatedArticleSlugs: ['clinical-documentation-communication', 'physiotherapy-assessment-structured-approach'], references: [professionalStandards],
  },
  {
    slug: 'evidence-appraisal-study-guide', title: 'Evidence Appraisal Study Guide', kind: 'Evidence-based practice worksheet',
    summary: 'A reusable way to turn a question into a source search, critical appraisal and a cautious application discussion.',
    sections: [
      { heading: 'Ask a focused question', paragraphs: ['Describe the population or problem, the option under consideration, a relevant comparator and an outcome that matters. A focused question helps narrow a search, but not every experience or qualitative question fits an intervention framework. Choose the question structure that serves the learning need.', 'Start with relevant current guidelines and systematic reviews when appropriate, then inspect how recommendations were developed and which populations were studied. A recent publication date or prestigious journal does not by itself establish applicability. Record the source, version and important uncertainties so another learner can follow your reasoning.'] },
      { heading: 'From appraisal to a reasoned discussion', paragraphs: ['Consider study design, risk of bias, consistency, size and precision of effects, harms and missing outcomes. Ask whether the participants, setting and resources resemble the situation under discussion. Distinguish absence of evidence from evidence that an option has no effect.', 'Combine research with clinical expertise and the person’s values. Discuss absolute risks when suitable numerical information is available, include the relevant timeframe and make uncertainty explicit. This worksheet supports reflection; it does not license a learner to change clinical care independently or make a new treatment recommendation.'] },
    ],
    prompts: ['Question and meaningful outcomes: ___', 'Search terms, sources and source versions: ___', 'Design, strengths and important limitations: ___', 'Benefits, harms and uncertainty: ___', 'Applicability, preferences and supervisory discussion: ___'],
    relatedArticleSlugs: ['evidence-based-practice-physiotherapy', 'clinical-documentation-communication'], references: [professionalStandards, sharedDecisions],
  },
  {
    slug: 'shared-decision-conversation-guide', title: 'Shared Decision-Making Conversation Guide', kind: 'Patient-education planning aid',
    summary: 'Prepare a supervised conversation that makes options, understanding and personal priorities visible.',
    sections: [
      { heading: 'Prepare an accessible discussion', paragraphs: ['Ask what the person wants to understand and how they prefer information to be shared. Consider language support, sensory needs, health literacy, capacity and whether the person wants someone involved. Do not assume that difficulty with professional terminology means lack of decision-making capacity.', 'Explain the decision and the aims of available options, including no treatment or no change where relevant. Discuss benefits, risks, burdens and uncertainty in the context of the person’s life. Use approved, quality-assured decision aids when appropriate; this resource is not a validated patient decision aid.'] },
      { heading: 'Check understanding and agree next steps', paragraphs: ['Offer information in manageable sections and invite the person to explain their understanding in their own words. Frame this as a check of your explanation, not a test of the person. Where figures are available, use consistent denominators, an explicit timeframe and balanced framing rather than isolated relative-risk claims.', 'Allow questions and time for reflection. Summarise what is agreed, what remains undecided, who is responsible for the next action and how the decision will be reviewed. A useful learning exercise is to rewrite an unexplained instruction as a choice-sensitive conversation, then review it with a qualified colleague.'] },
    ],
    prompts: ['What matters to you about this decision?', 'Would it help to talk through the alternatives, including no change?', 'What are you most unsure or concerned about?', 'How would you describe the options in your own words?', 'What shall we agree now, and when should we review it?'],
    relatedArticleSlugs: ['clinical-documentation-communication', 'evidence-based-practice-physiotherapy'], references: [sharedDecisions],
  },
  {
    slug: 'clinical-reasoning-glossary', title: 'Clinical Reasoning Glossary and Revision Notes', kind: 'Glossary',
    summary: 'Short working definitions for discussion, with reminders about measurement, uncertainty and scope.',
    sections: [
      { heading: 'Assessment and measurement', paragraphs: ['Impairment: a problem in body function or structure; it is not the same as the person’s difficulty doing an activity. Activity limitation: difficulty carrying out a task. Participation restriction: difficulty engaging in a life situation. These related perspectives encourage a broader discussion than a single joint measurement.', 'Reliability concerns consistency of measurement under specified conditions. Validity concerns whether evidence supports the interpretation and intended use of a measurement. Responsiveness concerns detecting change in the construct of interest. A reliable measurement may still be unsuitable for the question or population.'] },
      { heading: 'Reasoning and professional judgement', paragraphs: ['Working hypothesis: a provisional explanation to test and revise, not a certainty. Differential considerations: alternative explanations that influence assessment and safety decisions. Red flag: a feature that may raise concern for serious pathology in context; neither one isolated sign nor a negative checklist proves safety.', 'Shared decision making: a collaborative process that considers evidence, options and the person’s priorities. Scope of practice: the area in which a professional has the knowledge, skills and authority to practise safely. Reading an educational article does not expand that scope. Reflective practice means examining decisions and their consequences to identify learning needs, not merely recording that an activity occurred.'] },
    ],
    prompts: ['Explain the difference between an impairment and a meaningful activity goal.', 'Give an example of a reliable measure that might not answer a particular question.', 'Which findings would challenge a working hypothesis?', 'What supervision would be needed before applying a new skill?'],
    relatedArticleSlugs: ['range-of-motion-strength-functional-assessment', 'gait-assessment-clinical-reasoning', 'patient-safety-red-flags-referral'], references: [professionalStandards, sharedDecisions],
  },
];
