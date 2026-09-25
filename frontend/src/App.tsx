import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { JobBoard } from './pages/JobBoard';
import { JobDetails } from './pages/JobDetails';
import { FindTutor } from './pages/FindTutor';
import { TutorDetails } from './pages/TutorDetails';
import { CategoryDetails } from './pages/CategoryDetails';
import { TuitionCategories } from './pages/TuitionCategories';
import { BecomeATutor } from './pages/BecomeATutor';
import { AppointATutor } from './pages/AppointATutor';
import { AffiliateProgram } from './pages/AffiliateProgram';
import { OurTeam } from './pages/OurTeam';
import { Careers } from './pages/Careers';
import { Blog } from './pages/Blog';
import { BlogDetails } from './pages/BlogDetails';
import { Gallery } from './pages/Gallery';
import { FAQ } from './pages/FAQ';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { DashboardPage } from './pages/DashboardPage';
import { DashboardProfilePage } from './pages/DashboardProfilePage';
import { DashboardApplicationsPage } from './pages/DashboardApplicationsPage';

// Scroll to top automatically on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main Public Layout with Header and Footer
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
          {/* Dashboard Standalone Routes (Internal Layout) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/profile" element={<DashboardProfilePage />} />
          <Route path="/dashboard/applications" element={<DashboardApplicationsPage />} />
          <Route path="/dashboard/requirements" element={<DashboardApplicationsPage />} />
          <Route path="/dashboard/notifications" element={<DashboardApplicationsPage />} />

          {/* Public Pages with Header & Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/job-board" element={<JobBoard />} />
            <Route path="/job-board/:jobId" element={<JobDetails />} />
            <Route path="/find-tutor" element={<FindTutor />} />
            <Route path="/tuition-categories" element={<TuitionCategories />} />
            <Route path="/hub/tutor-details/:tutorId" element={<TutorDetails />} />
            <Route path="/category-details/:id/:slug" element={<CategoryDetails />} />
            <Route path="/category-details/:slug" element={<CategoryDetails />} />
            <Route path="/become-a-tutor" element={<BecomeATutor />} />
            <Route path="/appoint-a-tutor" element={<AppointATutor />} />
            <Route path="/affiliate-program" element={<AffiliateProgram />} />
            <Route path="/our-team" element={<OurTeam />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetails />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
