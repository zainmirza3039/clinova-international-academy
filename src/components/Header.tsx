import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useScrollPosition } from '@/hooks/useScrollAnimation';
import { departments } from '@/data/departments';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Departments', to: '/departments', hasMegaMenu: true },
  { label: 'Programmes', to: '/programmes', hasMegaMenu: true },
  { label: 'CPD Courses', to: '/cpd-courses' },
  { label: 'Online Learning', to: '/online-learning' },
  { label: 'Training Partners', to: '/training-partners' },
  { label: 'Resources', to: '/resources' },
  { label: 'Contact', to: '/contact' },
];

const programmeMenuItems = [
  { label: 'Certificate Courses', to: '/programmes?type=Certificate', desc: 'Short focused programmes' },
  { label: 'Diploma Programmes', to: '/programmes?type=Diploma', desc: 'Comprehensive study programmes' },
  { label: 'Professional Development', to: '/programmes?type=Professional Development', desc: 'Career-focused learning' },
  { label: 'CPD Courses', to: '/cpd-courses', desc: 'Continuing professional development' },
  { label: 'Featured Programmes', to: '/programmes?featured=true', desc: 'Explore our highlights' },
];

export default function Header() {
  const isScrolled = useScrollPosition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const [mobileMegaMenu, setMobileMegaMenu] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleMegaMenuEnter = (label: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setMegaMenu(label);
  };

  const handleMegaMenuLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setMegaMenu(null), 150);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-sm border-b border-navy-100'
          : 'bg-white border-b border-navy-100'
      }`}
    >
      <div className="max-w-editorial mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" onClick={() => setMobileOpen(false)}>
            <img src="/clinova-logo.svg" alt="Clinova International Academy" className="w-[160px] sm:w-[180px] lg:w-[200px] h-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Main navigation">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.hasMegaMenu && handleMegaMenuEnter(link.label)}
                onMouseLeave={link.hasMegaMenu ? handleMegaMenuLeave : undefined}
                onFocus={() => link.hasMegaMenu && handleMegaMenuEnter(link.label)}
                onBlur={(event) => {
                  if (link.hasMegaMenu && (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget))) {
                    handleMegaMenuLeave();
                  }
                }}
              >
                <Link
                  to={link.to}
                  className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-navy-700 hover:text-clinical-600 transition-colors"
                  aria-haspopup={link.hasMegaMenu ? 'true' : undefined}
                  aria-expanded={link.hasMegaMenu ? megaMenu === link.label : undefined}
                >
                  {link.label}
                  {link.hasMegaMenu && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>

                {/* Mega Menu - Departments */}
                {link.hasMegaMenu && megaMenu === link.label && link.label === 'Departments' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[640px]">
                    <div className="bg-white shadow-2xl border border-navy-100">
                      <div className="p-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4 pb-3 border-b border-navy-100">
                          Departments
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {departments.map((dept) => (
                            <Link
                              key={dept.id}
                              to={`/departments/${dept.slug}`}
                              className="flex items-start gap-2.5 p-2.5 hover:bg-surface-50 transition-colors"
                              onClick={() => setMegaMenu(null)}
                            >
                              <div className="w-0.5 h-full bg-teal-500 self-stretch shrink-0 min-h-[32px]" />
                              <div>
                                <div className="text-sm font-semibold text-navy-800">{dept.name}</div>
                                <div className="text-xs text-navy-500 mt-0.5 line-clamp-2">{dept.description}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mega Menu - Programmes */}
                {link.hasMegaMenu && megaMenu === link.label && link.label === 'Programmes' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[420px]">
                    <div className="bg-white shadow-2xl border border-navy-100">
                      <div className="p-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4 pb-3 border-b border-navy-100">
                          Programmes
                        </div>
                        <div className="space-y-1">
                          {programmeMenuItems.map((item) => (
                            <Link
                              key={item.label}
                              to={item.to}
                              className="flex flex-col p-2.5 hover:bg-surface-50 transition-colors"
                              onClick={() => setMegaMenu(null)}
                            >
                              <div className="text-sm font-semibold text-navy-800">{item.label}</div>
                              <div className="text-xs text-navy-500">{item.desc}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/programmes"
              className="hidden lg:inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-clinical-600 transition-colors"
            >
              Explore Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              className="xl:hidden p-2 text-navy-700 hover:bg-surface-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-x-0 top-16 bottom-0 bg-white overflow-y-auto border-t border-navy-100">
          <nav className="px-6 py-6 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <div key={link.label}>
                <div className="flex items-center justify-between">
                  <Link
                    to={link.to}
                    className="flex-1 block py-3 text-base font-medium text-navy-800 hover:text-clinical-600 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                  {link.hasMegaMenu && (
                    <button
                      className="p-3 text-navy-600"
                      onClick={() => setMobileMegaMenu(mobileMegaMenu === link.label ? null : link.label)}
                      aria-label={`Expand ${link.label} submenu`}
                    >
                      <ChevronDown className={`w-5 h-5 transition-transform ${mobileMegaMenu === link.label ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {/* Mobile submenu - Departments */}
                {link.hasMegaMenu && mobileMegaMenu === link.label && link.label === 'Departments' && (
                  <div className="pl-4 py-1 space-y-0.5">
                    {departments.map((dept) => (
                      <Link
                        key={dept.id}
                        to={`/departments/${dept.slug}`}
                        className="block py-2.5 text-sm text-navy-600 hover:text-clinical-600 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {dept.name}
                      </Link>
                    ))}
                  </div>
                )}
                {/* Mobile submenu - Programmes */}
                {link.hasMegaMenu && mobileMegaMenu === link.label && link.label === 'Programmes' && (
                  <div className="pl-4 py-1 space-y-0.5">
                    {programmeMenuItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="block py-2.5 text-sm text-navy-600 hover:text-clinical-600 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/programmes"
              className="block mt-4 py-3 bg-navy-800 text-white text-center font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Explore Courses
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
