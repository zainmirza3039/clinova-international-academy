import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';
import { privacyPolicy, termsAndConditions, cookiePolicy, refundPolicy, accessibilityStatement, externalLinkingPolicy } from '@/data/legalContent';

import { AuthProvider, ProtectedStudentRoute } from '@/auth/AuthProvider';

const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const DepartmentsPage = lazy(() => import('@/pages/DepartmentsPage'));
const DepartmentDetailPage = lazy(() => import('@/pages/DepartmentDetailPage'));
const ProgrammesPage = lazy(() => import('@/pages/ProgrammesPage'));
const CPDCoursesPage = lazy(() => import('@/pages/CPDCoursesPage'));
const OnlineLearningPage = lazy(() => import('@/pages/OnlineLearningPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AdmissionsPage = lazy(() => import('@/pages/AdmissionsPage'));
const ApplicationPage = lazy(() => import('@/pages/ApplicationPage'));
const CommunityPage = lazy(() => import('@/pages/CommunityPage'));
const EventsPage = lazy(() => import('@/pages/CommunityPage').then(module => ({ default: module.EventsPage })));
const FacultyPage = lazy(() => import('@/pages/CommunityPage').then(module => ({ default: module.FacultyPage })));
const FAQsPage = lazy(() => import('@/pages/FAQsPage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const StudentDashboardPage = lazy(() => import('@/pages/StudentDashboardPage'));
const ProgrammeDetailPage = lazy(() => import('@/pages/ProgrammeDetailPage'));
const CPDCourseDetailPage = lazy(() => import('@/pages/CPDCourseDetailPage'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage').then(module => ({ default: module.ResourcesPage })));
const ResourceDetailPage = lazy(() => import('@/pages/ResourcesPage').then(module => ({ default: module.ResourceDetailPage })));
const LearningResourcesPage = lazy(() => import('@/pages/LearningResourcesPage'));
const LearningResourceDetailPage = lazy(() => import('@/pages/LearningResourcesPage').then(module => ({ default: module.LearningResourceDetailPage })));
const TrainingPartnersPage = lazy(() => import('@/pages/TrainingPartnersPage'));
const CertificateVerificationPage = lazy(() => import('@/pages/CertificateVerificationPage'));
const CertificationPage = lazy(() => import('@/pages/CertificationPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const CmsPublishedContentDetailPage = lazy(() => import('@/components/CmsPublishedContent').then(module => ({ default: module.CmsPublishedContentDetailPage })));
const ClinicalInternshipsPage = lazy(() => import('@/pages/ClinicalInternshipsPage'));
const InstructorRecruitmentPage = lazy(() => import('@/pages/InstructorRecruitmentPage'));
const UnavailableRoleWorkspacePage = lazy(() => import('@/pages/UnavailableRoleWorkspacePage'));
const CertificationAndCpdPolicyPage = lazy(() => import('@/pages/CertificationAndCpdPolicyPage'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1">
          <ErrorBoundary>
          <Suspense fallback={<p role="status" aria-live="polite" className="px-6 py-20 text-center text-navy-700">Loading page…</p>}>
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
            <Route path="/instructor/*" element={<UnavailableRoleWorkspacePage role="Instructor" />} />
            <Route path="/institution/*" element={<UnavailableRoleWorkspacePage role="Institution" />} />
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
            <Route path="/clinical-internships" element={<ClinicalInternshipsPage />} />
            <Route path="/become-an-instructor" element={<InstructorRecruitmentPage />} />
            <Route path="/training-partners" element={<TrainingPartnersPage />} />
            <Route path="/certification" element={<CertificationPage />} />
            <Route path="/certification-and-cpd-policy" element={<CertificationAndCpdPolicyPage />} />
            <Route path="/verify" element={<CertificateVerificationPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/cms/:kind/:slug" element={<CmsPublishedContentDetailPage />} />
            <Route path="/learning-resources" element={<LearningResourcesPage />} />
            <Route path="/learning-resources/:slug" element={<LearningResourceDetailPage />} />
            <Route path="/resources/:slug" element={<ResourceDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<LegalPage {...privacyPolicy} />} />
            <Route path="/terms-and-conditions" element={<LegalPage {...termsAndConditions} />} />
            <Route path="/cookie-policy" element={<LegalPage {...cookiePolicy} />} />
            <Route path="/refund-policy" element={<LegalPage {...refundPolicy} />} />
            <Route path="/accessibility-statement" element={<LegalPage {...accessibilityStatement} />} />
            <Route path="/external-linking-policy" element={<LegalPage {...externalLinkingPolicy} />} />
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
