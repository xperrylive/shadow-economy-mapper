import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BusinessProvider, useBusiness } from './hooks/useBusiness';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ReportPage } from './pages/ReportPage';
import { ReportsListPage } from './pages/ReportsListPage';
import { VerifyPage } from './pages/VerifyPage';
import { LedgerPage } from './pages/LedgerPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function RequireBusiness({ children }: { children: React.ReactNode }) {
  const { businesses, loading } = useBusiness();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }
  if (businesses.length === 0) return <Navigate to="/onboarding" />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify/:token" element={<VerifyPage />} />

            {/* Onboarding - auth required but no business needed */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected + business required routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RequireBusiness>
                    <Layout><DashboardPage /></Layout>
                  </RequireBusiness>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <RequireBusiness>
                    <Layout><UploadPage /></Layout>
                  </RequireBusiness>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <RequireBusiness>
                    <Layout><ReportsListPage /></Layout>
                  </RequireBusiness>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/:id"
              element={
                <ProtectedRoute>
                  <RequireBusiness>
                    <Layout><ReportPage /></Layout>
                  </RequireBusiness>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ledger"
              element={
                <ProtectedRoute>
                  <RequireBusiness>
                    <Layout><LedgerPage /></Layout>
                  </RequireBusiness>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
