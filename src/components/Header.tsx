import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useScrollPosition } from '@/hooks/useScrollAnimation';
import { departments } from '@/data/departments';
import { publishedCPDCourses } from '@/data/cpdCourses';

type NavigationItem = { label: string; to: string; description: string };
type NavigationLink = { label: string; to: string; menuTitle?: string; items?: NavigationItem[] };

const featuredCourseSlugs = [
  'musculoskeletal-assessment-and-clinical-reasoning',
  'clinical-assessment-of-low-back-pain',
  'knee-osteoarthritis-rehabilitation',
  'stroke-rehabilitation-functional-goals',
  'introduction-to-sports-rehabilitation',
  'pain-management-fundamentals',
  'motor-control-relearning-in-neurorehabilitation',
  'balance-training-fall-prevention',
];

const departmentItems: NavigationItem[] = departments.map((department) => ({
  label: department.name,
  to: `/departments/${department.slug}`,
  description: department.description,
}));

const courseItems: NavigationItem[] = [
  { label: 'All self-study courses', to: '/cpd-courses', description: 'Search the current independent-study catalogue.' },
  { label: 'Programme learning guides', to: '/programmes', description: 'Browse informational learning guides; no award or enrolment is implied.' },
  { label: 'Articles and resources', to: '/resources', description: 'Explore educational reading and source-linked articles.' },
  { label: 'Study tools', to: '/learning-resources', description: 'Read reflection prompts, checklists and other study tools.' },
  ...featuredCourseSlugs.flatMap((slug) => {
    const course = publishedCPDCourses.find((item) => item.slug === slug);
    return course ? [{ label: course.title, to: `/cpd-courses/${course.slug}`, description: course.description }] : [];
  }),
];

const navLinks: NavigationLink[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Departments', to: '/departments', menuTitle: 'Healthcare subject areas', items: departmentItems },
  { label: 'Courses', to: '/cpd-courses', menuTitle: 'Courses and learning resources', items: courseItems },
  {
    label: 'Learners',
    to: '/admissions',
    menuTitle: 'Learner information',
    items: [
      { label: 'Admissions information', to: '/admissions', description: 'Review current learning routes and admissions status.' },
      { label: 'Online learning resources', to: '/online-learning', description: 'Self-guided reading only; live teaching and learner enrolment are unavailable.' },
      { label: 'Application information', to: '/application', description: 'Online applications and payment processing are unavailable.' },
      { label: 'Student access — currently unavailable', to: '/student', description: 'Learner sign-in and protected student services are not available in this build.' },
    ],
  },
  {
    label: 'Faculty',
    to: '/faculty',
    menuTitle: 'Faculty and educator information',
    items: [
      { label: 'Faculty directory', to: '/faculty', description: 'No verified faculty profiles are currently published.' },
      { label: 'Instructor information', to: '/become-an-instructor', description: 'Instructor applications and credential submissions are not open.' },
    ],
  },
  {
    label: 'Institutions',
    to: '/training-partners',
    menuTitle: 'Institutional information',
    items: [
      { label: 'Partnership information', to: '/training-partners', description: 'Discussion areas only; proposals and application submissions are not available.' },
      { label: 'Clinical internship status', to: '/clinical-internships', description: 'No verified placements or application workflow are currently listed.' },
    ],
  },
  { label: 'Resources', to: '/resources' },
  { label: 'Contact', to: '/contact' },
];

const normalizeRoutePath = (path: string) => path.length > 1 ? path.replace(/\/+$/, '') : path;
const getNavCurrentState = (pathname: string, to: string): 'page' | 'location' | undefined => {
  const currentPath = normalizeRoutePath(pathname);
  const targetPath = normalizeRoutePath(to);
  if (currentPath === targetPath) return 'page';
  if (targetPath !== '/' && currentPath.startsWith(`${targetPath}/`)) return 'location';
  return undefined;
};
const submenuId = (prefix: string, label: string) => `${prefix}-submenu-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setMegaMenu(null);
        if (mobileOpen) mobileToggleRef.current?.focus();
      }
      if (event.key === 'Tab' && mobileOpen) {
        const links = Array.from(mobilePanelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
        const targets = [mobileToggleRef.current, ...links].filter((item): item is HTMLElement => Boolean(item));
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (event.shiftKey && (document.activeElement === first || !targets.includes(document.activeElement as HTMLElement))) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !targets.includes(document.activeElement as HTMLElement))) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleMegaMenuEnter = (label: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setMegaMenu(label);
  };
  const handleMegaMenuLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setMegaMenu(null), 150);
  };

  return (
    <header className={`site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm border-b border-navy-100' : 'bg-white border-b border-navy-100'}`}>
      <div className="max-w-editorial mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center shrink-0" onClick={() => setMobileOpen(false)}>
            <img src="/clinova-logo.svg" alt="Clinova International Academy" className="w-[160px] sm:w-[180px] lg:w-[200px] h-auto" />
          </Link>

          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isOpen = megaMenu === link.label;
              const currentState = getNavCurrentState(pathname, link.to);
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.items && handleMegaMenuEnter(link.label)}
                  onMouseLeave={link.items ? handleMegaMenuLeave : undefined}
                  onFocus={() => link.items && handleMegaMenuEnter(link.label)}
                  onBlur={(event) => {
                    if (link.items && (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget))) handleMegaMenuLeave();
                  }}
                >
                  <Link
                    to={link.to}
                    className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${currentState ? 'bg-surface-50 text-navy-900' : 'text-navy-600 hover:bg-surface-50 hover:text-navy-900'}`}
                    aria-current={currentState}
                    aria-haspopup={link.items ? 'true' : undefined}
                    aria-expanded={link.items ? isOpen : undefined}
                    aria-controls={link.items ? submenuId('desktop', link.label) : undefined}
                  >
                    {link.label}
                    {link.items && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />}
                  </Link>

                  {link.items && isOpen && (
                    <div id={submenuId('desktop', link.label)} className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[min(42rem,calc(100vw-2rem))]">
                      <div className="bg-white shadow-2xl border border-navy-100">
                        <div className="p-5">
                          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-clinical-500 mb-4 pb-3 border-b border-navy-100">{link.menuTitle}</h2>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {link.items.map((item) => (
                              <li key={item.to}>
                                <Link
                                  to={item.to}
                                  className="flex h-full flex-col rounded-sm p-3 hover:bg-surface-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clinical-600"
                                  aria-current={getNavCurrentState(pathname, item.to)}
                                  onClick={() => setMegaMenu(null)}
                                >
                                  <span className="text-sm font-semibold text-navy-800">{item.label}</span>
                                  <span className="mt-1 text-xs leading-relaxed text-navy-500">{item.description}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button
              ref={mobileToggleRef}
              type="button"
              aria-controls="mobile-navigation"
              className="xl:hidden p-2 text-navy-700 hover:bg-surface-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div ref={mobilePanelRef} id="mobile-navigation" tabIndex={-1} className="xl:hidden fixed inset-x-0 top-16 lg:top-20 bottom-0 bg-white overflow-y-auto border-t border-navy-100">
          <nav className="px-6 py-6 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isOpen = mobileMegaMenu === link.label;
              return (
                <div key={link.label}>
                  <div className="flex items-center justify-between">
                    <Link
                      to={link.to}
                      className="flex-1 block py-3 text-base font-medium text-navy-800 hover:text-clinical-600 transition-colors"
                      aria-current={getNavCurrentState(pathname, link.to)}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {link.items && (
                      <button
                        type="button"
                        className="p-3 text-navy-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
                        onClick={() => setMobileMegaMenu(isOpen ? null : link.label)}
                        aria-controls={submenuId('mobile', link.label)}
                        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${link.label} submenu`}
                        aria-expanded={isOpen}
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  {link.items && isOpen && (
                    <ul id={submenuId('mobile', link.label)} className="pl-4 py-1 space-y-0.5 border-l border-navy-100 ml-2">
                      {link.items.map((item) => (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            className="block rounded-sm py-2.5 px-3 text-sm text-navy-700 hover:bg-surface-50 hover:text-clinical-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
                            aria-current={getNavCurrentState(pathname, item.to)}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="block font-semibold">{item.label}</span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-navy-500">{item.description}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
