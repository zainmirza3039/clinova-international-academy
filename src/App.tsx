import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import DepartmentDetailPage from '@/pages/DepartmentDetailPage';
import ProgrammesPage from '@/pages/ProgrammesPage';
import ProgrammeDetailPage from '@/pages/ProgrammeDetailPage';
import CPDCoursesPage from '@/pages/CPDCoursesPage';
import CPDCourseDetailPage from '@/pages/CPDCourseDetailPage';
import OnlineLearningPage from '@/pages/OnlineLearningPage';
import TrainingPartnersPage from '@/pages/TrainingPartnersPage';
import CertificateVerificationPage from '@/pages/CertificateVerificationPage';
import { ResourcesPage, ResourceDetailPage } from '@/pages/ResourcesPage';
import ContactPage from '@/pages/ContactPage';
import LegalPage from '@/pages/LegalPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { privacyPolicy, termsAndConditions, cookiePolicy, refundPolicy } from '@/data/legalContent';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/departments/:slug" element={<DepartmentDetailPage />} />
            <Route path="/programmes" element={<ProgrammesPage />} />
            <Route path="/programmes/:slug" element={<ProgrammeDetailPage />} />
            <Route path="/cpd-courses" element={<CPDCoursesPage />} />
            <Route path="/cpd-courses/:slug" element={<CPDCourseDetailPage />} />
            <Route path="/online-learning" element={<OnlineLearningPage />} />
            <Route path="/training-partners" element={<TrainingPartnersPage />} />
            <Route path="/verify" element={<CertificateVerificationPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:slug" element={<ResourceDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<LegalPage {...privacyPolicy} />} />
            <Route path="/terms-and-conditions" element={<LegalPage {...termsAndConditions} />} />
            <Route path="/cookie-policy" element={<LegalPage {...cookiePolicy} />} />
            <Route path="/refund-policy" element={<LegalPage {...refundPolicy} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
