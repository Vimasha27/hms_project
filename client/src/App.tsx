import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PatientsPage } from './pages/patients/PatientsPage';
import { PatientDetailPage } from './pages/patients/PatientDetailPage';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { EmrConsultationPage } from './pages/emr/EmrConsultationPage';
import { PharmacyPage } from './pages/pharmacy/PharmacyPage';
import { LabPage } from './pages/lab/LabPage';
import { InpatientPage } from './pages/inpatient/InpatientPage';
import { BillingPage } from './pages/billing/BillingPage';
import { StaffPage } from './pages/staff/StaffPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { Toaster } from '@/components/ui/sonner';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route
              path="patients"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT']}>
                  <PatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="patients/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT']}>
                  <PatientDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="appointments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="emr"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <EmrConsultationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="pharmacy"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'DOCTOR']}>
                  <PharmacyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="laboratory"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'LAB_STAFF', 'DOCTOR']}>
                  <LabPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="inpatient"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
                  <InpatientPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="billing"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <StaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT', 'DOCTOR']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
