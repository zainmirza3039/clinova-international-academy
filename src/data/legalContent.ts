import type { BreadcrumbItem } from '@/components/Breadcrumbs';

export interface LegalContent {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  sections: { heading: string; content: string }[];
}

const draftNotice = 'Not approved for publication. This section is a drafting placeholder and must be completed from the academy\'s confirmed practices and reviewed by a qualified legal professional.';

export const privacyPolicy: LegalContent = {
  title: 'Privacy Policy',
  description: 'DRAFT POLICY — the academy has not confirmed its data controller details, processing purposes, lawful bases, retention periods or rights-handling process.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }],
  sections: [
    { heading: 'Draft status', content: 'This is not a published privacy notice. Do not rely on it as a statement of the academy\'s current data practices. ' + draftNotice },
    { heading: 'Controller identity and contact', content: draftNotice },
    { heading: 'Information collected and purposes', content: 'The categories of personal information collected, the purposes for each use, and whether any information is collected automatically have not been confirmed. ' + draftNotice },
    { heading: 'Lawful basis and consent', content: 'Applicable lawful bases, consent requirements and withdrawal arrangements have not been confirmed. ' + draftNotice },
    { heading: 'Recipients and international transfers', content: 'Processors, recipients, hosting locations and any international data transfers must be inventoried and reviewed before this section is completed. ' + draftNotice },
    { heading: 'Retention and security', content: 'Retention periods, deletion schedules, security controls and any statutory record-keeping requirements must be documented from actual operations. No specific retention or security claim is made by this draft. ' + draftNotice },
    { heading: 'Individual rights and complaints', content: 'Applicable rights, identity-verification steps, response times and complaint routes must be confirmed for the academy\'s controller status and jurisdiction. ' + draftNotice },
    { heading: 'Cookies and analytics', content: 'The live cookie/storage inventory and any analytics or third-party tracking have not been verified. This draft does not claim that particular cookies or analytics services are used. ' + draftNotice },
  ],
};

export const termsAndConditions: LegalContent = {
  title: 'Terms & Conditions',
  description: 'DRAFT TERMS — provider identity, service terms, fees, cancellation, liability and governing law have not been approved.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Terms & Conditions' }],
  sections: [
    { heading: 'Draft status', content: 'These terms are not approved and do not establish a contract for any programme or service. ' + draftNotice },
    { heading: 'Provider identity and service availability', content: 'The legal entity providing each service, its registered details and the services actually available must be confirmed before publication. ' + draftNotice },
    { heading: 'Eligibility and enrolment', content: 'Entry criteria, enrolment acceptance, cancellation and access rules have not been approved. No enrolment offer is made by this draft. ' + draftNotice },
    { heading: 'Fees, payments and refunds', content: 'No price, payment method, refund entitlement, cancellation deadline or processing time is confirmed. Do not infer any specific refund policy from this draft. ' + draftNotice },
    { heading: 'Educational content and assessment', content: 'Course availability, assessment rules, completion requirements and any educational disclaimers require academy approval. ' + draftNotice },
    { heading: 'Certificates and recognition', content: 'No certificate, qualification, CPD credit, accreditation or professional recognition is promised by this draft. Each claim requires evidence and explicit academy approval. ' + draftNotice },
    { heading: 'Intellectual property and acceptable use', content: draftNotice },
    { heading: 'Liability, governing law and disputes', content: 'Applicable liability terms, governing law, dispute process and jurisdiction must be determined by qualified legal review. ' + draftNotice },
  ],
};

export const cookiePolicy: LegalContent = {
  title: 'Cookie Policy',
  description: 'DRAFT COOKIE NOTICE — the production cookie, local-storage and tracking inventory has not been verified.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Cookie Policy' }],
  sections: [
    { heading: 'Draft status', content: 'This is not a published cookie notice. ' + draftNotice },
    { heading: 'Technologies in use', content: 'A production audit must identify cookies, local storage, pixels, analytics and third-party resources before this section can state what is used. ' + draftNotice },
    { heading: 'Purposes and controls', content: 'The purposes, legal basis, consent controls and withdrawal mechanism for any non-essential technologies have not been confirmed. ' + draftNotice },
    { heading: 'Third-party services', content: 'Any third-party technologies and related privacy notices must be identified from the actual production configuration. ' + draftNotice },
  ],
};

export const refundPolicy: LegalContent = {
  title: 'Refund Policy',
  description: 'DRAFT REFUND POLICY — no cancellation window, refund eligibility, deductions or processing timeline has been approved.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Refund Policy' }],
  sections: [
    { heading: 'Draft status', content: 'No refund policy is currently approved for publication. This draft creates no refund entitlement or deadline. ' + draftNotice },
    { heading: 'Eligibility and cancellation', content: 'Eligibility, cancellation rights, exceptions and any interaction with applicable consumer law must be confirmed for each service before publication. ' + draftNotice },
    { heading: 'Programme cancellation by the academy', content: 'The academy must approve the remedy and communication process for any cancelled, postponed or materially changed programme. ' + draftNotice },
    { heading: 'Refund method and timing', content: 'No refund method or processing timeline is confirmed. Do not publish a specific number of days or promise a payment outcome until the operational process is verified. ' + draftNotice },
    { heading: 'Contact and disputes', content: 'A monitored contact channel and escalation process must be confirmed before publication. ' + draftNotice },
  ],
};
