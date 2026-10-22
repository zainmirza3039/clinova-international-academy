import BrandLogo from '@/components/BrandLogo';
import { Link } from 'react-router-dom';
import { academyPublicAddress } from '@/data/publicContact';

const academyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Departments', to: '/departments' },
  { label: 'Programmes', to: '/programmes' },
  { label: 'CPD Courses', to: '/cpd-courses' },
  { label: 'Online Learning', to: '/online-learning' },
];

const professionalLinks = [
  { label: 'Training Partners', to: '/training-partners' },
  { label: 'Resources', to: '/resources' },
  { label: 'Study Tools', to: '/learning-resources' },
  { label: 'Certificate Verification', to: '/verify' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Events', to: '/events' },
  { label: 'Faculty', to: '/faculty' },
];

const supportLinks = [
  { label: 'Contact', to: '/contact' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Administration', to: '/admin' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Cookie Policy', to: '/cookie-policy' },
  { label: 'Refund Policy', to: '/refund-policy' },
];

export default function Footer() {
  return (
    <footer className="bg-navy-800 text-navy-100">
      <div className="max-w-editorial mx-auto px-6 lg:px-10">
        {/* Top — brand + link columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 py-14 lg:py-20">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-block mb-6">
              <BrandLogo variant="white" className="w-[240px] max-w-full" />
            </Link>
            <p className="text-sm text-navy-100/60 leading-[1.65] mb-6 max-w-md">
              Explore proposed healthcare learning pathways and educational reading awaiting qualified review.
              Courses and learning services await confirmation; no enrolment is available here.
            </p>
            <div className="space-y-2.5">
              <address className="not-italic text-sm text-navy-100/80">{academyPublicAddress}</address>
              <p className="text-xs text-navy-100/80">Phone, email and visiting arrangements await confirmation.</p>
            </div>
          </div>

          {/* Academy Links */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-white text-xs uppercase tracking-[0.18em] mb-5">Academy</h3>
            <ul className="space-y-3">
              {academyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-navy-100/60 hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Professional Links */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-white text-xs uppercase tracking-[0.18em] mb-5">Professional</h3>
            <ul className="space-y-3">
              {professionalLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-navy-100/60 hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links + Social */}
          <div className="lg:col-span-3">
            <h3 className="font-heading font-bold text-white text-xs uppercase tracking-[0.18em] mb-5">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-navy-100/60 hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-navy-100/40 text-center sm:text-left">
            &copy; 2026 Clinova International Academy. All rights reserved.
          </p>
          <p className="text-xs text-navy-100/40 text-center sm:text-right">
            Online Healthcare Education &bull; CPD &bull; Professional Development
          </p>
        </div>
      </div>
    </footer>
  );
}
