import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Business User Pages
import BusinessDashboard from './pages/dashboards/BusinessDashboard';
import BusinessProfilePage from './pages/business/BusinessProfilePage';
import ApprovalChecklistPage from './pages/business/ApprovalChecklistPage';
import ComplianceRoadmapPage from './pages/business/ComplianceRoadmapPage';
import MyApplicationsPage from './pages/business/MyApplicationsPage';
import ApplicationDetailPage from './pages/business/ApplicationDetailPage';
import DigitalCertificatesPage from './pages/business/DigitalCertificatesPage';
import SchemesPage from './pages/business/SchemesPage';
import GrievancePage from './pages/business/GrievancePage';

// Officer Pages
import OfficerDashboard from './pages/dashboards/OfficerDashboard';
import OfficerReviewPage from './pages/officer/OfficerReviewPage';
import OfficerInspectionsPage from './pages/officer/OfficerInspectionsPage';
import OfficerAnalyticsPage from './pages/officer/OfficerAnalyticsPage';
import OfficerGrievancesPage from './pages/officer/OfficerGrievancesPage';

// Admin Pages
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminRuleEnginePage from './pages/admin/AdminRuleEnginePage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Business User Routes */}
              <Route
                path="/business/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['business_user']}>
                    <BusinessDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/profile"
                element={
                  <ProtectedRoute allowedRoles={['business_user']}>
                    <BusinessProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/checklist"
                element={
                  <ProtectedRoute allowedRoles={['business_user']}>
                    <ApprovalChecklistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/roadmap"
                element={
                  <ProtectedRoute allowedRoles={['business_user']}>
                    <ComplianceRoadmapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/applications"
                element={
                  <ProtectedRoute allowedRoles={['business_user']}>
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/applications/:id"
                element={
                  <ProtectedRoute allowedRoles={['business_user']}>
                    <ApplicationDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/licences"
                element={
                  <ProtectedRoute allowedRoles={['business_user']}>
                    <DigitalCertificatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/schemes"
                element={
                  <ProtectedRoute allowedRoles={['business_user']}>
                    <SchemesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/grievances"
                element={
                  <ProtectedRoute allowedRoles={['business_user']}>
                    <GrievancePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Government Officer Routes */}
              <Route
                path="/officer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['officer', 'admin']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/review/:id"
                element={
                  <ProtectedRoute allowedRoles={['officer', 'admin']}>
                    <OfficerReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/inspections"
                element={
                  <ProtectedRoute allowedRoles={['officer', 'admin']}>
                    <OfficerInspectionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/analytics"
                element={
                  <ProtectedRoute allowedRoles={['officer', 'admin']}>
                    <OfficerAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/grievances"
                element={
                  <ProtectedRoute allowedRoles={['officer', 'admin']}>
                    <OfficerGrievancesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDepartmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rules"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRuleEnginePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
