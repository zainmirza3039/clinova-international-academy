import { lazy, Suspense } from 'react';
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

import ContactPage from '@/pages/ContactPage';
import LegalPage from '@/pages/LegalPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ErrorBoundary from '@/components/ErrorBoundary';
import { siteSettings } from '@/lib/siteConfig';
import AdmissionsPage from '@/pages/AdmissionsPage';
import ApplicationPage from '@/pages/ApplicationPage';
import AdminPage from '@/pages/AdminPage';
import CommunityPage, { EventsPage, FacultyPage } from '@/pages/CommunityPage';
import FAQsPage from '@/pages/FAQsPage';
import { privacyPolicy, termsAndConditions, cookiePolicy, refundPolicy } from '@/data/legalContent';

import { AuthProvider, ProtectedStudentRoute } from '@/auth/AuthProvider';
import AuthPage from '@/pages/AuthPage';
import StudentDashboardPage from '@/pages/StudentDashboardPage';

const ResourcesPage = lazy(() => import('@/pages/ResourcesPage').then(module => ({ default: module.ResourcesPage })));
const ResourceDetailPage = lazy(() => import('@/pages/ResourcesPage').then(module => ({ default: module.ResourceDetailPage })));
const LearningResourcesPage = lazy(() => import('@/pages/LearningResourcesPage'));
const LearningResourceDetailPage = lazy(() => import('@/pages/LearningResourcesPage').then(module => ({ default: module.LearningResourceDetailPage })));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1">
          <div className="preview-notice">{siteSettings.contentStatus}</div>
          <ErrorBoundary>
          <Suspense fallback={<p role="status" aria-live="polite" className="px-6 py-20 text-center text-navy-700">Loading educational resources…</p>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<AuthPage mode="sign-in" />} />
            <Route path="/sign-up" element={<AuthPage mode="sign-up" />} />
            <Route path="/forgot-password" element={<AuthPage mode="forgot-password" />} />
            <Route path="/reset-password" element={<AuthPage mode="reset-password" />} />
            <Route path="/student/*" element={<ProtectedStudentRoute><StudentDashboardPage /></ProtectedStudentRoute>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/apply" element={<ApplicationPage />} />
            <Route path="/application" element={<ApplicationPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/faculty" element={<FacultyPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/courses" element={<ProgrammesPage />} />
            <Route path="/courses/:slug" element={<ProgrammeDetailPage />} />
            <Route path="/blog" element={<ResourcesPage />} />
            <Route path="/blog/:slug" element={<ResourceDetailPage />} />
            <Route path="/announcements" element={<ResourcesPage />} />
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
            <Route path="/learning-resources" element={<LearningResourcesPage />} />
            <Route path="/learning-resources/:slug" element={<LearningResourceDetailPage />} />
            <Route path="/resources/:slug" element={<ResourceDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<LegalPage {...privacyPolicy} />} />
            <Route path="/terms-and-conditions" element={<LegalPage {...termsAndConditions} />} />
            <Route path="/cookie-policy" element={<LegalPage {...cookiePolicy} />} />
            <Route path="/refund-policy" element={<LegalPage {...refundPolicy} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </AuthProvider>
    </BrowserRouter>
  );
}
