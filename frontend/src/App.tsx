import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { Feed } from './pages/Feed';
import { JobBoard } from './pages/JobBoard';
import { JobDetails } from './pages/JobDetails';
import { FindTutor } from './pages/FindTutor';
import { TutorDetails } from './pages/TutorDetails';
import { CategoryDetails } from './pages/CategoryDetails';
import { TuitionCategories } from './pages/TuitionCategories';
import { AppointATutor } from './pages/AppointATutor';
import { FAQ } from './pages/FAQ';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { DashboardPage } from './pages/DashboardPage';
import { DashboardProfilePage } from './pages/DashboardProfilePage';
import { DashboardApplicationsPage } from './pages/DashboardApplicationsPage';
import { DashboardJobsPage } from './pages/DashboardJobsPage';
import { DashboardUsersPage } from './pages/DashboardUsersPage';
import { DashboardTutorsPage } from './pages/DashboardTutorsPage';
import { DashboardMessagesPage } from './pages/DashboardMessagesPage';

import { ProtectedRoute } from './components/common/ProtectedRoute';
import { FloatingChat } from './components/chat/FloatingChat';

// Scroll to top automatically on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Preserve query parameters when redirecting /messages to /dashboard/messages
const MessagesRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to={`/dashboard/messages${location.search}`} replace />;
};

// Main App Layout with Authenticated Header and Footer
const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Auth-Only Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Standalone Dashboard Routes (Guarded Behind Authentication) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/messages" element={<DashboardMessagesPage />} />
            <Route path="/dashboard/users" element={<DashboardUsersPage />} />
            <Route path="/dashboard/tutors" element={<DashboardTutorsPage />} />
            <Route path="/dashboard/profile" element={<DashboardProfilePage />} />
            <Route path="/dashboard/jobs" element={<DashboardJobsPage />} />
            <Route path="/dashboard/applications" element={<DashboardApplicationsPage />} />
            <Route path="/dashboard/requirements" element={<DashboardApplicationsPage />} />
            <Route path="/dashboard/notifications" element={<DashboardApplicationsPage />} />
          </Route>

          {/* Authenticated Platform App Routes with Header & Footer */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/messages" element={<MessagesRedirect />} />
            <Route path="/find-tutor" element={<FindTutor />} />
            <Route path="/hub/tutor-details/:tutorId" element={<TutorDetails />} />
            <Route path="/job-board" element={<JobBoard />} />
            <Route path="/job-board/:jobId" element={<JobDetails />} />
            <Route path="/appoint-a-tutor" element={<AppointATutor />} />
            <Route path="/post-job" element={<AppointATutor />} />
            <Route path="/tuition-categories" element={<TuitionCategories />} />
            <Route path="/category-details/:id/:slug" element={<CategoryDetails />} />
            <Route path="/category-details/:slug" element={<CategoryDetails />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <FloatingChat />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
