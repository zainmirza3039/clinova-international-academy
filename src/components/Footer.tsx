import { Link } from 'react-router-dom';
import { academyLegalIdentity } from '@/data/publicContact';

const copyrightNotice = `This website and its content are copyright of Clinova International Academy – © Clinova International Academy 2024. All rights reserved.
Any redistribution or reproduction of part or all of the contents in any form is prohibited other than the following:
You may print or download extracts to a local hard disk for your personal and non-commercial use only.
You may copy the content to individual third parties for their personal use, provided that you acknowledge clinova International Academy as the source of the material.
You may not, except with our express written permission, distribute or commercially exploit the content. Nor may you transmit it or store it in any other website or other form of electronic retrieval system.`;

type FooterLink = { label: string; to: string };

const exploreLinks: FooterLink[] = [
  { label: 'About Clinova', to: '/about' },
  { label: 'Healthcare subject areas', to: '/departments' },
  { label: 'Online learning resources — no enrolment', to: '/online-learning' },
  { label: 'Self-study course catalogue', to: '/cpd-courses' },
  { label: 'Programme learning guides', to: '/programmes' },
  { label: 'Articles and resources', to: '/resources' },
  { label: 'Study tools', to: '/learning-resources' },
];

const learnerLinks: FooterLink[] = [
  { label: 'Admissions information', to: '/admissions' },
  { label: 'Application information — online applications unavailable', to: '/application' },
  { label: 'Student access — currently unavailable', to: '/student' },
];

const facultyInstitutionLinks: FooterLink[] = [
  { label: 'Faculty directory', to: '/faculty' },
  { label: 'Community events — none currently listed', to: '/events' },
  { label: 'Instructor information — applications not open', to: '/become-an-instructor' },
  { label: 'Partnership information — applications unavailable', to: '/training-partners' },
  { label: 'Clinical internship status — no listings', to: '/clinical-internships' },
];

const supportLinks: FooterLink[] = [
  { label: 'Contact details', to: '/contact' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Certificate information', to: '/certification' },
  { label: 'Certification and CPD policy', to: '/certification-and-cpd-policy' },
  { label: 'Certificate verification — unavailable', to: '/verify' },
  { label: 'Accessibility Statement', to: '/accessibility-statement' },
  { label: 'External Linking Policy', to: '/external-linking-policy' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Cookie Policy', to: '/cookie-policy' },
  { label: 'Refund Policy', to: '/refund-policy' },
];

function FooterLinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className="text-sm leading-relaxed text-navy-100/70 hover:text-teal-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 transition-colors">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer bg-navy-800 text-navy-100">
      <div className="max-w-editorial mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-20">
          <div className="lg:col-span-3">
            <Link to="/" className="mb-6 inline-block">
              <img src="/clinova-logo-white.png" alt="Clinova International Academy" className="w-[200px] h-auto" />
            </Link>
            <p className="mb-6 max-w-md text-sm leading-[1.65] text-navy-100/70">
              Explore healthcare subject guides, educational articles and structured resources for independent professional learning.
            </p>
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-100/80">{academyLegalIdentity.registeredOfficeLabel}</p>
              <address className="not-italic text-sm text-navy-100/85">{academyLegalIdentity.registeredOfficeAddress}</address>
              <p className="text-xs leading-relaxed text-navy-100/70">{academyLegalIdentity.registeredOfficeNotice} Visiting arrangements are not provided.</p>
            </div>
          </div>

          <nav className="lg:col-span-2" aria-label="Explore links">
            <h2 className="mb-5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">Explore</h2>
            <FooterLinkList links={exploreLinks} />
          </nav>

          <nav className="lg:col-span-2" aria-label="Learner links">
            <h2 className="mb-5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">Learners</h2>
            <FooterLinkList links={learnerLinks} />
          </nav>

          <nav className="lg:col-span-2" aria-label="Faculty and institution links">
            <h2 className="mb-5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">Faculty &amp; institutions</h2>
            <FooterLinkList links={facultyInstitutionLinks} />
          </nav>

          <nav className="lg:col-span-3" aria-label="Contact, certificates, and legal links">
            <h2 className="mb-5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">Contact &amp; information</h2>
            <FooterLinkList links={supportLinks} />
            <p className="mt-5 text-xs leading-relaxed text-navy-100/60">Privacy, Terms and Conditions, Cookie, and Refund Policy pages are placeholders pending approval. Certificate issuance and live verification are not available.</p>
          </nav>
        </div>

        <div className="border-t border-white/10 py-6">
          <p className="max-w-5xl whitespace-pre-line text-xs leading-relaxed text-navy-100/70">{copyrightNotice}</p>
          <p className="mt-4 text-xs text-navy-100/45">Healthcare learning resources &bull; Self-study guides &bull; Professional development</p>
        </div>
      </div>
    </footer>
  );
}
