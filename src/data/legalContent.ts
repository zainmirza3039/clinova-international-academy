import type { BreadcrumbItem } from '@/components/Breadcrumbs';

export type LegalPublicationStatus = 'approval-required' | 'approved';

export interface LegalContent {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  publicationStatus: LegalPublicationStatus;
  sections: { heading: string; content: string }[];
}

const home = [{ label: 'Home', to: '/' }];
const approvalRequired: LegalPublicationStatus = 'approval-required';
const approved: LegalPublicationStatus = 'approved';

export const privacyPolicy: LegalContent = {
  title: 'Privacy Policy',
  description: 'No approved privacy-policy text is available here; approval is required before publication.',
  breadcrumb: [...home, { label: 'Privacy Policy' }],
  publicationStatus: approvalRequired,
  sections: [],
};

export const termsAndConditions: LegalContent = {
  title: 'Terms and Conditions',
  description: 'No approved terms are available here; approval is required before publication.',
  breadcrumb: [...home, { label: 'Terms and Conditions' }],
  publicationStatus: approvalRequired,
  sections: [],
};

export const cookiePolicy: LegalContent = {
  title: 'Cookie Policy',
  description: 'No approved cookie-policy text is available here; approval is required before publication.',
  breadcrumb: [...home, { label: 'Cookie Policy' }],
  publicationStatus: approvalRequired,
  sections: [],
};

export const refundPolicy: LegalContent = {
  title: 'Refund Policy',
  description: 'No approved refund-policy text is available here; approval is required before publication.',
  breadcrumb: [...home, { label: 'Refund Policy' }],
  publicationStatus: approvalRequired,
  sections: [],
};

export const accessibilityStatement: LegalContent = {
  title: 'Accessibility Statement',
  description: 'Accessibility information for MyUniHub, including current capabilities, known gaps, and contact details.',
  breadcrumb: [...home, { label: 'Accessibility Statement' }],
  publicationStatus: approved,
  sections: [
    {
      heading: 'Accessibility features and compatibility',
      content: 'This statement relates to MyUniHub. The website can be zoomed to 400% without text overflow. It supports keyboard navigation and speech recognition and is compatible with JAWS, NVDA and VoiceOver.',
    },
    {
      heading: 'Compliance and testing',
      content: 'MyUniHub is partially compliant with WCAG 2.2 AA. We carry out regular accessibility testing and reviews and make improvements.',
    },
    {
      heading: 'Known gaps',
      content: 'Known gaps include older PDF and Office documents, videos without captions, some forms and services with keyboard-navigation or screen-reader barriers, and older mobile and tablet content.',
    },
    {
      heading: 'Contact and response',
      content: 'For accessibility issues, contact MyUniHub at info@clinovainternationalacademy.co.uk or call (+44) 7412 890634. Issues are typically addressed within three working days.',
    },
  ],
};

export const externalLinkingPolicy: LegalContent = {
  title: 'External Linking Policy',
  description: 'Clinova International Academy’s owner-approved policy for external links.',
  breadcrumb: [...home, { label: 'External Linking Policy' }],
  publicationStatus: approved,
  sections: [
    {
      heading: 'External linking policy',
      content: `At Clinova International Academy, we strive to ensure the accuracy and relevance of all external links provided on our website. However, please note that we do not have control over the content on external websites.

While we conduct thorough checks before publishing external links, we cannot guarantee the accuracy, completeness, or timeliness of content found on external websites. Therefore, Clinova International Academy cannot be held responsible for any content accessed through external links.

It’s important to understand that the presence of an external link on our website does not imply endorsement or approval of the linked website, its owners, products, or services. Visitors are encouraged to exercise their own discretion and judgment when accessing external websites.

Should you encounter any issues or concerns with external links provided on our website, please don’t hesitate to contact us.`,
    },
  ],
};
