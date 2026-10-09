import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:id" element={<PatientDetailPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="emr" element={<EmrConsultationPage />} />
            <Route path="pharmacy" element={<PharmacyPage />} />
            <Route path="laboratory" element={<LabPage />} />
            <Route path="inpatient" element={<InpatientPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
