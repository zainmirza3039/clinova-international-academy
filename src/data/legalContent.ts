import type { BreadcrumbItem } from '@/components/Breadcrumbs';

export interface LegalContent {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  sections: { heading: string; content: string }[];
}

export const privacyPolicy: LegalContent = {
  title: 'Privacy Policy',
  description: 'How Clinova International Academy handles personal information submitted through this website.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }],
  sections: [
    { heading: 'Introduction', content: 'This Privacy Policy explains how Clinova International Academy ("we", "us") collects, uses and protects personal information when you visit our website or use our services. By using our website, you agree to the practices described in this policy.' },
    { heading: 'Information We Collect', content: 'Information may include the name, email address, phone number, subject and message that you choose to submit through an enquiry form, and information needed for account features if enabled. Do not submit patient information, passwords or payment-card details through general enquiry forms.' },
    { heading: 'How We Use Your Information', content: 'Information submitted through forms is used to handle the request, operate the relevant feature, maintain security and meet applicable legal obligations. Newsletter messages are sent only through the relevant subscription feature. This website does not offer checkout for paid programmes.' },
    { heading: 'Data Storage and Security', content: 'The website uses technical controls intended to limit access and protect submitted information. No internet transmission or storage method can be guaranteed completely secure. Access and retention should be limited to what is necessary for the relevant purpose and applicable law.' },
    { heading: 'Your Rights', content: 'Depending on applicable law, you may have rights to access, correct, delete or restrict use of your personal information, and to withdraw consent where consent is the legal basis. Use the academy's published contact route to submit a request; identity verification may be required.' },
    { heading: 'Cookies', content: 'Technical storage or cookies may be used for essential website functionality. Refer to the Cookie Policy and your browser settings for more information. The site's actual cookie inventory should be checked whenever third-party services are enabled.' },
    { heading: 'Changes to This Policy', content: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.' },
  ],
};

export const termsAndConditions: LegalContent = {
  title: 'Terms & Conditions',
  description: 'Terms governing use of the Clinova International Academy website and educational information.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Terms & Conditions' }],
  sections: [
    { heading: 'Acceptance of Terms', content: 'By using this website, you agree to use it lawfully and not to interfere with its operation or security. If you do not agree with these terms, do not use the website.' },
    { heading: 'Programme Enrolment', content: 'A catalogue entry is informational and does not itself confirm availability, enrolment, payment, delivery dates or a place on a programme. Any future enrolment will be subject to the specific terms supplied before registration.' },
    { heading: 'Programme Content', content: 'All programme content is provided for educational purposes. While we strive to ensure accuracy, we do not guarantee that all content is error-free or current. Programme content may be updated without notice.' },
    { heading: 'Certification', content: 'No certificate, qualification, CPD credit or accreditation should be assumed from information on this website. Any credential or recognition will be described only in the confirmed terms for a specific offering.' },
    { heading: 'Intellectual Property', content: 'All content on this website, including text, images, logos and programme materials, is the property of Clinova International Academy or its licensors. You may not reproduce, distribute or use content without prior written permission.' },
    { heading: 'Limitation of Liability', content: 'Clinova International Academy shall not be liable for any indirect, incidental or consequential damages arising from the use of our website or services. Our liability is limited to the extent permitted by law.' },
    { heading: 'Governing Law', content: 'Applicable law and dispute-resolution arrangements depend on the legal entity operating the academy and the user's jurisdiction. Any mandatory rights under applicable law remain unaffected.' },
  ],
};

export const cookiePolicy: LegalContent = {
  title: 'Cookie Policy',
  description: 'Information about essential website storage and how to manage browser cookies.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Cookie Policy' }],
  sections: [
    { heading: 'What Are Cookies', content: 'Cookies are small text files placed on your device when you visit a website. They help the website remember your actions and preferences over a period of time, making your browsing experience more efficient.' },
    { heading: 'Types of Cookies We Use', content: 'Only technical storage necessary for a feature should be enabled by default. Analytics, advertising or other non-essential cookies should not be enabled without the required configuration and consent where applicable.' },
    { heading: 'Managing Cookies', content: 'You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. Please note that some parts of the website may not function properly if you disable cookies.' },
    { heading: 'Third-Party Cookies', content: 'We may use third-party services that place cookies on your device. These third parties have their own privacy policies governing the use of cookies they place.' },
    { heading: 'Updates to This Policy', content: 'We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.' },
  ],
};

export const refundPolicy: LegalContent = {
  title: 'Refund Policy',
  description: 'Information about cancellation and refund terms for any future paid offering.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Refund Policy' }],
  sections: [
    { heading: 'Cancellation by the Learner', content: 'This website does not currently provide a checkout for paid programme enrolment. If a paid offering becomes available, the applicable cancellation and refund terms must be presented before payment. Do not rely on this page as a promise of a refund for a separate agreement.' },
    { heading: 'Non-Refundable Circumstances', content: 'Any exceptions, cancellation rights and refund eligibility will be governed by the terms provided for the specific purchase and applicable law.' },
    { heading: 'Cancellation by Clinova', content: 'If an offering is introduced, cancellation and remedy arrangements will be stated in the terms supplied before purchase and will remain subject to applicable law.' },
    { heading: 'Refund Processing', content: 'No refund-processing timeframe is promised by this website. Any applicable timeframe will be provided in the terms for the relevant purchase.' },
    { heading: 'Contact', content: 'For any questions about our refund policy, please contact us at the academy through its confirmed contact route.' },
  ],
};
