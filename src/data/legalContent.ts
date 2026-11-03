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
  description: 'Accessibility information for Clinova International Academy, including the website’s accessibility approach and how to report an issue.',
  breadcrumb: [...home, { label: 'Accessibility Statement' }],
  publicationStatus: approved,
  sections: [
    {
      heading: 'Accessibility features and compatibility',
      content: 'Clinova International Academy aims to make its website usable by people with different access needs. The website is designed to support keyboard navigation, text resizing and assistive technologies. This statement does not claim independent certification or a completed WCAG conformance audit.',
    },
    {
      heading: 'Compliance and testing',
      content: 'The website is reviewed as part of ongoing maintenance. A formal independent WCAG 2.2 AA conformance assessment has not been published.',
    },
    {
      heading: 'Known gaps',
      content: 'Known gaps include older PDF and Office documents, videos without captions, some forms and services with keyboard-navigation or screen-reader barriers, and older mobile and tablet content.',
    },
    {
      heading: 'Contact and response',
      content: 'To report an accessibility issue, use the contact details published on the Clinova contact page. Please describe the page, the assistive technology or device used, and the barrier encountered. A response timeframe is not guaranteed.',
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
