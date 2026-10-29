import type { BreadcrumbItem } from '@/components/Breadcrumbs';

export interface LegalContent {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  sections: { heading: string; content: string }[];
}

const home = [{ label: 'Home', to: '/' }];

export const privacyPolicy: LegalContent = {
  title: 'Privacy Policy',
  description: 'How Clinova International Academy handles information submitted through this website and how to contact us about privacy.',
  breadcrumb: [...home, { label: 'Privacy Policy' }],
  sections: [
    { heading: 'Who this notice covers', content: 'This notice applies to visitors using the Clinova International Academy website. The public postal address shown on this site is 1 Unity St, Bristol BS1 5HH, United Kingdom. This website does not provide medical care and you must not submit patient records or other sensitive clinical information through its forms.' },
    { heading: 'Information you provide', content: 'Depending on which website features are enabled, you may be asked for contact details such as your name, email address, phone number, organisation and the contents of a message. Only provide information needed for your enquiry. If a form is disabled, it will not submit your information.' },
    { heading: 'How information is used', content: 'Information submitted through an enabled form is used to receive and manage the relevant enquiry or subscription request. It is not used to make clinical decisions. Do not send passwords, payment card details, medical records or confidential information about another person.' },
    { heading: 'Storage and service providers', content: 'Website forms may send information to the hosted database configured for the site. Technical service providers may process information as needed to operate, secure and maintain the website. Access should be limited to authorised purposes. No website can guarantee absolute security, so please avoid sending sensitive information.' },
    { heading: 'Retention and sharing', content: 'Information should be kept only for as long as reasonably needed to manage the request, maintain appropriate records and meet applicable legal obligations. It may be disclosed where required by law or where necessary to protect the website and its users. This site does not offer personal information for sale.' },
    { heading: 'Cookies and technical data', content: 'Your browser and hosting services may process technical information needed to deliver, protect and troubleshoot the website. You can manage cookies and site data through your browser settings. Blocking some site data may affect features that depend on it.' },
    { heading: 'Your choices and privacy requests', content: 'Depending on the law that applies to you, you may be able to request access to, correction of or deletion of personal information, or object to certain processing. Describe your request in writing and send it to the public postal address above. Do not include identity documents or sensitive information unless a secure method has first been agreed.' },
    { heading: 'Updates', content: 'This notice may be updated when website features or data practices change. The version published on this page describes the website’s general handling of information; any additional notice presented when a specific service is used also applies.' },
  ],
};

export const termsAndConditions: LegalContent = {
  title: 'Terms & Conditions',
  description: 'Terms for using Clinova International Academy’s website and educational resources.',
  breadcrumb: [...home, { label: 'Terms & Conditions' }],
  sections: [
    { heading: 'Using this website', content: 'You may use this website for lawful personal and professional learning. Do not interfere with its security, attempt unauthorised access, misuse its forms or submit information you are not entitled to share.' },
    { heading: 'Educational information only', content: 'Articles, topic guides and study resources are general educational information. They are not individual medical advice, diagnosis, treatment instructions, professional supervision or a substitute for current evidence, local protocols and the judgement of an appropriately qualified practitioner.' },
    { heading: 'Courses and qualifications', content: 'A topic, guide or programme title on this website does not by itself mean that a course is open for enrolment, accredited, recognised by a regulator, eligible for CPD credit or associated with a certificate. Rely only on explicit written terms published for a specific offering. Do not infer a qualification or permission to practise from reading website materials.' },
    { heading: 'Accuracy and availability', content: 'We aim to keep the website clear and useful, but educational information may become outdated and external resources may change. Check primary sources and applicable local guidance before acting on information. Website features may be changed, interrupted or withdrawn for maintenance, security or operational reasons.' },
    { heading: 'Intellectual property', content: 'Unless a page states otherwise, website text, visual design and original learning materials are provided by or for Clinova International Academy. You may read and share links to public pages. Do not republish substantial material, remove attribution or use content commercially without permission, except where the law permits.' },
    { heading: 'External links', content: 'Links to third-party resources are provided for further reading. Clinova does not control those websites and a link does not mean that the third party endorses Clinova or that Clinova endorses every statement on the linked page.' },
    { heading: 'Limitation and applicable law', content: 'To the extent permitted by applicable law, the website and its general educational materials are provided without a guarantee that every page will be uninterrupted, error-free or suitable for a particular purpose. Nothing in these terms excludes a right or liability that cannot lawfully be excluded. Applicable consumer and other mandatory legal rights remain unaffected.' },
    { heading: 'Contact', content: 'For written correspondence about these terms, use the public postal address listed on the Contact page: 1 Unity St, Bristol BS1 5HH, United Kingdom.' },
  ],
};

export const cookiePolicy: LegalContent = {
  title: 'Cookie Policy',
  description: 'Information about browser storage and cookie controls when using the Clinova website.',
  breadcrumb: [...home, { label: 'Cookie Policy' }],
  sections: [
    { heading: 'Browser storage', content: 'Websites may use cookies or similar browser storage for technical operation, security and remembering a user’s choices. Authentication or other interactive features may also use site storage when enabled.' },
    { heading: 'Analytics and advertising', content: 'This policy does not promise that analytics, advertising or other optional tracking tools are present. If optional tracking is added, the website information and any required consent choices should be updated before it is used.' },
    { heading: 'Managing preferences', content: 'You can review or clear cookies and site data in your browser settings. Restricting storage may affect features that depend on it. Clearing site data may sign you out or reset preferences.' },
    { heading: 'Changes', content: 'This policy will be updated if the website’s use of cookies or similar technologies changes.' },
  ],
};

export const refundPolicy: LegalContent = {
  title: 'Payments, Cancellations & Refunds',
  description: 'Information about payments and refunds for services offered through this website.',
  breadcrumb: [...home, { label: 'Payments & Refunds' }],
  sections: [
    { heading: 'Website purchases', content: 'This website does not currently provide an online checkout or payment facility for courses. Reading a learning guide does not create a paid enrolment, purchase or entitlement to a certificate.' },
    { heading: 'Before making a payment', content: 'Do not send payment card details or transfer money based solely on a course title or general website description. Before any paid service is offered, the provider, total price, delivery terms, cancellation rights and refund arrangements should be supplied in writing for that specific service.' },
    { heading: 'Existing agreements', content: 'If you have a separate written agreement with Clinova International Academy, the terms supplied for that transaction and any mandatory legal rights applicable to you govern cancellation and refund requests.' },
    { heading: 'Contact', content: 'For written correspondence about payments or an existing agreement, use the public postal address listed on the Contact page: 1 Unity St, Bristol BS1 5HH, United Kingdom. Do not include payment credentials in correspondence.' },
  ],
};
