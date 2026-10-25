import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import FAQsPage from '@/pages/FAQsPage';
import LegalPage from '@/pages/LegalPage';
import ProgrammesPage from '@/pages/ProgrammesPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cookiePolicy, privacyPolicy, refundPolicy, termsAndConditions } from '@/data/legalContent';

vi.mock('@/hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
  useScrollPosition: () => false,
}));
vi.mock('@/components/Reveal', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

afterEach(cleanup);

function renderPage(page: React.ReactNode) {
  return render(<MemoryRouter>{page}</MemoryRouter>);
}

const unsupportedPublicClaims = [
  /\b12\+\s*(?:CPD\s+)?courses?\s+(?:available|offered)\b/i,
  /\b100%\s+online(?:\s+delivery)?\b/i,
  /\bdigital\s+certification\b/i,
  /eligible learners may receive a certificate of completion/i,
  /\b(?:14\s*days?|25\s*%)(?:\s+of\s+course\s+access)?\b/i,
  /\b(?:flexible study|global access|self-paced)\b/i,
  /start your professional development journey today/i,
  /Explore Online Programmes/i,
  /Online Healthcare Education/i,
  /Phone, email and visiting arrangements await confirmation/i,
  /Confirmed (?:CPD )?Programmes|Confirmed CPD Courses/i,
  /Contact our team to discuss your professional development needs and find the right programme/i,
  /\bCertificate Courses\b|\bFeatured Programmes\b/i,
];

describe('rendered public copy safeguards', () => {
  it('keeps the homepage honest about availability and delivery, including its FAQ accordion', () => {
    const { container } = renderPage(<HomePage />);
    const copy = container.textContent ?? '';
    expect(copy).toMatch(/Course availability, delivery, recognition and enrolment are not yet confirmed/i);
    expect(copy).toMatch(/No programmes are currently approved for publication/i);
    expect(copy).toMatch(/No CPD courses are currently approved for publication/i);
    expect(container.querySelector('img[alt="Healthcare professional studying online"]')).toBeNull();
    for (const claim of unsupportedPublicClaims) expect(copy).not.toMatch(claim);

    const certificateQuestion = screen.getByRole('button', { name: 'Will I receive a certificate?' });
    fireEvent.click(certificateQuestion);
    const answer = screen.getByRole('region', { name: 'Will I receive a certificate?' });
    expect(answer.textContent).toMatch(/No Certificate of Completion.*currently confirmed/i);
    expect(answer.textContent).not.toMatch(/eligible learners may receive/i);
  });

  it('renders FAQs with unconfirmed fees, delivery, enrolment and contact clearly disclosed', () => {
    const { container } = renderPage(<FAQsPage />);
    const copy = container.textContent ?? '';
    expect(copy).toMatch(/Fees and funding arrangements have not been confirmed/i);
    expect(copy).toMatch(/Fee questions are welcome for discussion/i);
    expect(copy).toMatch(/email details are unconfirmed/i);
    expect(copy).toMatch(/online form submissions are disabled/i);
    for (const claim of unsupportedPublicClaims) expect(copy).not.toMatch(claim);
  });

  it('keeps catalogue, menu and footer labels consistent with proposed-only services', () => {
    const programmes = renderPage(<ProgrammesPage />);
    const programmeCopy = programmes.container.textContent ?? '';
    expect(programmeCopy).toMatch(/No programmes are currently approved for publication/i);
    expect(programmeCopy).not.toMatch(/Contact our team to discuss your professional development needs/i);
    expect(document.title).not.toMatch(/Confirmed Programmes/i);
    for (const claim of unsupportedPublicClaims) expect(programmeCopy).not.toMatch(claim);
    programmes.unmount();

    const cpd = renderPage(<CPDCoursesPage />);
    const cpdCopy = cpd.container.textContent ?? '';
    expect(cpdCopy).toMatch(/No CPD courses are currently approved for publication/i);
    expect(document.title).not.toMatch(/Confirmed CPD Courses/i);
    for (const claim of unsupportedPublicClaims) expect(cpdCopy).not.toMatch(claim);
    cpd.unmount();

    const header = renderPage(<Header />);
    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Programmes' }));
    const menuCopy = header.container.textContent ?? '';
    expect(menuCopy).toMatch(/Proposed programme areas/i);
    expect(menuCopy).toMatch(/No programme is approved or open for enrolment/i);
    expect(menuCopy).not.toMatch(/Certificate Courses|Featured Programmes/i);
    header.unmount();

    const footer = renderPage(<Footer />);
    const footerCopy = footer.container.textContent ?? '';
    expect(footerCopy).toMatch(/optional secondary local-agent call for Pakistan enquiries/i);
    expect(footerCopy).toMatch(/Student access status/i);
    expect(footerCopy).not.toMatch(/Online Healthcare Education/i);
    for (const claim of unsupportedPublicClaims) expect(footerCopy).not.toMatch(claim);
  });

  it('renders every legal route as unavailable rather than publishing draft terms', () => {
    for (const policy of [privacyPolicy, termsAndConditions, cookiePolicy, refundPolicy]) {
      const { container, unmount } = renderPage(<LegalPage {...policy} />);
      const copy = container.textContent ?? '';
      expect(copy).toMatch(/Policy not yet available/i);
      expect(copy).toMatch(/has not yet been published/i);
      for (const claim of unsupportedPublicClaims) expect(copy).not.toMatch(claim);
      unmount();
    }
  });
});
