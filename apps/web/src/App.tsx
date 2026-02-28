import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BusinessProvider, useBusiness } from './hooks/useBusiness';
import { Layout } from './components/Layout';

class RouteErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
          <p className="text-gray-700 font-medium">This page failed to load.</p>
          <p className="text-gray-400 text-sm">{(this.state.error as Error).message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="text-sm text-primary-600 underline"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const VerifyPage = lazy(() => import('./pages/VerifyPage').then(m => ({ default: m.VerifyPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const UploadPage = lazy(() => import('./pages/UploadPage').then(m => ({ default: m.UploadPage })));
const ReportsListPage = lazy(() => import('./pages/ReportsListPage').then(m => ({ default: m.ReportsListPage })));
const ReportPage = lazy(() => import('./pages/ReportPage').then(m => ({ default: m.ReportPage })));
const LedgerPage = lazy(() => import('./pages/LedgerPage').then(m => ({ default: m.LedgerPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );
}

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
          <RouteErrorBoundary>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
          </RouteErrorBoundary>
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
