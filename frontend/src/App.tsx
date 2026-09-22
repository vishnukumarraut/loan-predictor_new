import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminSidebar } from './components/layout/AdminSidebar';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyMobilePage } from './pages/VerifyMobilePage';
import { LoanEligibilityPage } from './pages/LoanEligibilityPage';
import { ResultsPage } from './pages/ResultsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { PrivacyTermsPage } from './pages/PrivacyTermsPage';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBanksPage } from './pages/admin/AdminBanksPage';
import { AdminLoanProductsPage } from './pages/admin/AdminLoanProductsPage';
import { AdminCriteriaPage } from './pages/admin/AdminCriteriaPage';
import { AdminMLModelPage } from './pages/admin/AdminMLModelPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  const handleLoginSuccess = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex">
        {isAdminRoute && <AdminSidebar />}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/verify-mobile" element={<VerifyMobilePage />} />
            <Route path="/privacy" element={<PrivacyTermsPage />} />
            <Route path="/terms" element={<PrivacyTermsPage />} />

            {/* User Assessment & Tracking Routes */}
            <Route path="/loan-eligibility" element={<LoanEligibilityPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/application/:id" element={<ApplicationDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage onAdminLoginSuccess={handleLoginSuccess} />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/banks" element={<AdminBanksPage />} />
            <Route path="/admin/loan-products" element={<AdminLoanProductsPage />} />
            <Route path="/admin/criteria" element={<AdminCriteriaPage />} />
            <Route path="/admin/ml-model" element={<AdminMLModelPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
