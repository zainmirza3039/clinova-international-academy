import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollPosition } from '@/hooks/useScrollAnimation';
import { departments } from '@/data/departments';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Departments', to: '/departments', hasMegaMenu: true },
  { label: 'Courses', to: '/cpd-courses', hasMegaMenu: true },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Training Partners', to: '/training-partners' },
  { label: 'Resources', to: '/resources' },
  { label: 'Contact', to: '/contact' },
];

const programmeMenuItems = [
  { label: 'MSK Assessment & Clinical Reasoning', to: '/cpd-courses/musculoskeletal-assessment-and-clinical-reasoning', desc: 'History, examination and clinical reasoning' },
  { label: 'Low Back Pain Assessment', to: '/cpd-courses/clinical-assessment-of-low-back-pain', desc: 'Assessment, safety and evidence-informed management' },
  { label: 'Knee Osteoarthritis Rehabilitation', to: '/cpd-courses/knee-osteoarthritis-rehabilitation', desc: 'Exercise, function and review' },
  { label: 'Stroke Rehabilitation', to: '/cpd-courses/stroke-rehabilitation-functional-goals', desc: 'Functional goals and task-specific practice' },
  { label: 'Sports Rehabilitation', to: '/cpd-courses/introduction-to-sports-rehabilitation', desc: 'Progressive loading and return to sport' },
  { label: 'Pain Management', to: '/cpd-courses/pain-management-fundamentals', desc: 'Pain science and function-led care' },
  { label: 'Motor Control & Neurorehabilitation', to: '/cpd-courses/motor-control-relearning-in-neurorehabilitation', desc: 'Task-specific practice and motor learning' },
  { label: 'Balance & Falls Prevention', to: '/cpd-courses/balance-training-fall-prevention', desc: 'Falls assessment and progressive exercise' },
  { label: 'View All Courses', to: '/cpd-courses', desc: 'Browse all open self-study courses' },
];

const mobileSubmenuId = (label: string) => `mobile-submenu-${label.toLowerCase().replace(/\s+/g, '-')}`;

export default function Header() {
  const isScrolled = useScrollPosition();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const [mobileMegaMenu, setMobileMegaMenu] = useState<string | null>(null);
  useEffect(() => { setMobileOpen(false); setMegaMenu(null); setMobileMegaMenu(null); }, [pathname]);
  useEffect(() => { if (!mobileOpen) setMobileMegaMenu(null); }, [mobileOpen]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false); setMegaMenu(null);
        if (mobileOpen) mobileToggleRef.current?.focus();
      }
      if (e.key === 'Tab' && mobileOpen) {
        const links = Array.from(mobilePanelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
        const targets = [mobileToggleRef.current, ...links].filter((item): item is HTMLElement => Boolean(item));
        const first = targets[0]; const last = targets[targets.length - 1];
        if (e.shiftKey && (document.activeElement === first || !targets.includes(document.activeElement as HTMLElement))) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || !targets.includes(document.activeElement as HTMLElement))) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [mobileOpen]);
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
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${pathname === link.to || (link.to !== '/' && pathname.startsWith(link.to)) ? 'bg-surface-50 text-navy-900' : 'text-navy-600 hover:bg-surface-50 hover:text-navy-900'}`}
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

                {/* Mega Menu - Courses */}
                {link.hasMegaMenu && megaMenu === link.label && link.label === 'Courses' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[420px]">
                    <div className="bg-white shadow-2xl border border-navy-100">
                      <div className="p-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4 pb-3 border-b border-navy-100">
                          Courses
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
              to="/student"
              className="hidden lg:inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-clinical-600 transition-colors"
            >
              Student access
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              ref={mobileToggleRef}
              aria-controls="mobile-navigation"
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
        <div ref={mobilePanelRef} id="mobile-navigation" className="xl:hidden fixed inset-x-0 top-16 lg:top-20 bottom-0 bg-white overflow-y-auto border-t border-navy-100">
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
                      type="button"
                      className="p-3 text-navy-600"
                      onClick={() => setMobileMegaMenu(mobileMegaMenu === link.label ? null : link.label)}
                      aria-controls={mobileSubmenuId(link.label)}
                      aria-label={`${mobileMegaMenu === link.label ? 'Collapse' : 'Expand'} ${link.label} submenu`}
                      aria-expanded={mobileMegaMenu === link.label}
                    >
                      <ChevronDown className={`w-5 h-5 transition-transform ${mobileMegaMenu === link.label ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {/* Mobile submenu - Departments */}
                {link.hasMegaMenu && mobileMegaMenu === link.label && link.label === 'Departments' && (
                  <div id={mobileSubmenuId(link.label)} className="pl-4 py-1 space-y-0.5">
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
                {/* Mobile submenu - Courses */}
                {link.hasMegaMenu && mobileMegaMenu === link.label && link.label === 'Courses' && (
                  <div id={mobileSubmenuId(link.label)} className="pl-4 py-1 space-y-0.5">
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
              to="/student"
              className="block mt-4 py-3 bg-navy-800 text-white text-center font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Student access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
