import type { BreadcrumbItem } from '@/components/Breadcrumbs';

export interface LegalContent {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  sections: { heading: string; content: string }[];
}

export const privacyPolicy: LegalContent = {
  title: 'Privacy Policy',
  description: 'How Clinova International Academy collects, uses and protects your personal information.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }],
  sections: [
    { heading: 'Introduction', content: 'This Privacy Policy explains how Clinova International Academy ("we", "us") collects, uses and protects personal information when you visit our website or use our services. By using our website, you agree to the practices described in this policy.' },
    { heading: 'Information We Collect', content: 'We may collect personal information including your name, email address, phone number, country and professional details when you complete forms, subscribe to our newsletter or enrol in programmes. We also collect usage data such as pages visited and time spent on our website.' },
    { heading: 'How We Use Your Information', content: 'We use your information to respond to enquiries, process programme enrolments, send updates about our services, improve our website and comply with legal obligations. We do not sell your personal information to third parties.' },
    { heading: 'Data Storage and Security', content: 'We take reasonable measures to protect your personal information using appropriate technical and organisational safeguards. Your data is stored securely and access is restricted to authorised personnel only.' },
    { heading: 'Your Rights', content: 'You have the right to access, correct or delete your personal information. You may also withdraw consent for processing at any time. To exercise these rights, please contact us at info@clinovaacademy.co.uk.' },
    { heading: 'Cookies', content: 'Our website uses cookies to improve your browsing experience. Please refer to our Cookie Policy for detailed information about the cookies we use and how to manage them.' },
    { heading: 'Changes to This Policy', content: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.' },
  ],
};

export const termsAndConditions: LegalContent = {
  title: 'Terms & Conditions',
  description: 'The terms and conditions for using Clinova International Academy services and website.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Terms & Conditions' }],
  sections: [
    { heading: 'Acceptance of Terms', content: 'By accessing and using the Clinova International Academy website and services, you accept and agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.' },
    { heading: 'Programme Enrolment', content: 'Enrolment in our programmes is subject to availability and any applicable entry requirements. We reserve the right to refuse enrolment or terminate access to a programme if terms are violated.' },
    { heading: 'Programme Content', content: 'All programme content is provided for educational purposes. While we strive to ensure accuracy, we do not guarantee that all content is error-free or current. Programme content may be updated without notice.' },
    { heading: 'Certification', content: 'Certificates of Completion are issued upon successful completion of programme requirements. Our certificates indicate completion of educational programmes and do not constitute formal qualifications or accreditation unless explicitly stated.' },
    { heading: 'Intellectual Property', content: 'All content on this website, including text, images, logos and programme materials, is the property of Clinova International Academy or its licensors. You may not reproduce, distribute or use content without prior written permission.' },
    { heading: 'Limitation of Liability', content: 'Clinova International Academy shall not be liable for any indirect, incidental or consequential damages arising from the use of our website or services. Our liability is limited to the extent permitted by law.' },
    { heading: 'Governing Law', content: 'These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be subject to the jurisdiction of the relevant courts.' },
  ],
};

export const cookiePolicy: LegalContent = {
  title: 'Cookie Policy',
  description: 'Information about how Clinova International Academy uses cookies on this website.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Cookie Policy' }],
  sections: [
    { heading: 'What Are Cookies', content: 'Cookies are small text files placed on your device when you visit a website. They help the website remember your actions and preferences over a period of time, making your browsing experience more efficient.' },
    { heading: 'Types of Cookies We Use', content: 'We use essential cookies that are necessary for the website to function properly. We may also use analytics cookies to understand how visitors use our website, helping us improve the user experience.' },
    { heading: 'Managing Cookies', content: 'You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. Please note that some parts of the website may not function properly if you disable cookies.' },
    { heading: 'Third-Party Cookies', content: 'We may use third-party services that place cookies on your device. These third parties have their own privacy policies governing the use of cookies they place.' },
    { heading: 'Updates to This Policy', content: 'We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.' },
  ],
};

export const refundPolicy: LegalContent = {
  title: 'Refund Policy',
  description: 'Clinova International Academy refund and cancellation policy for programmes and services.',
  breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Refund Policy' }],
  sections: [
    { heading: 'Cancellation by the Learner', content: 'Learners may request a cancellation and refund within 14 days of enrolment, provided that no more than 25% of the programme content has been accessed. Requests should be sent to info@clinovaacademy.co.uk.' },
    { heading: 'Non-Refundable Circumstances', content: 'Refunds will not be issued after the 14-day cancellation period, or if more than 25% of programme content has been accessed, or if a certificate has already been issued for the programme.' },
    { heading: 'Cancellation by Clinova', content: 'If Clinova International Academy cancels a programme, learners will receive a full refund or the option to transfer to an alternative programme. We are not liable for any incidental costs incurred by learners.' },
    { heading: 'Refund Processing', content: 'Approved refunds will be processed using the original payment method within 14 working days of approval. The time taken for the refund to appear in your account may vary depending on your payment provider.' },
    { heading: 'Contact', content: 'For any questions about our refund policy, please contact us at info@clinovaacademy.co.uk.' },
  ],
};
