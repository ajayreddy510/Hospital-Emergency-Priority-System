import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppShell } from './layouts/AppShell';
import { Role } from './types';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { QueuePage } from './pages/QueuePage';
import { EmergencyNewPage } from './pages/EmergencyNewPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientRegistrationPage } from './pages/PatientRegistrationPage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { DoctorsPage } from './pages/DoctorsPage';
import { TreatmentsPage } from './pages/TreatmentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SearchPage } from './pages/SearchPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const RoleDashboard: React.FC = () => {
  const { user } = useAuth();
  const titleByRole: Record<Role, string> = {
    ADMIN: 'Hospital Operations Dashboard',
    DOCTOR: 'Clinical Worklist',
    NURSE: 'Triage & Intake Station',
    RECEPTIONIST: 'Admissions Desk',
  };

  return (
    <AppShell title={titleByRole[user?.role ?? 'RECEPTIONIST']}>
      <DashboardPage />
    </AppShell>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-cyan-400 font-mono">
        Authenticating HEPS Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/patient-register" element={<PatientRegistrationPage />} />

      {/* Protected Command Center Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue"
        element={
          <ProtectedRoute>
            <AppShell title="Emergency Priority Queue Command Center">
              <QueuePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency/new"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'NURSE', 'RECEPTIONIST']}>
            <AppShell title="New Emergency Intake">
              <EmergencyNewPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
            <AppShell title="Patient Management Dashboard">
              <PatientsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/register"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
            <AppShell title="Patient Registration & Triage Intake">
              <PatientRegistrationPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
            <AppShell title="Patient Profile & Clinical History">
              <PatientProfilePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE']}>
            <AppShell title="Physicians Roster & Workload">
              <DoctorsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/treatments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
            <AppShell title="Clinical Treatment Records">
              <TreatmentsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
            <AppShell title="Analytics & Reports">
              <ReportsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <AppShell title="Global Search">
              <SearchPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppShell title="System Audit Logs">
              <AuditLogsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppShell title="System Settings">
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" theme="dark" richColors />
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
