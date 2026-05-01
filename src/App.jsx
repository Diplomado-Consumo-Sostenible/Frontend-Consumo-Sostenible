import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/admin/admin_dashboard';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminUsers from './pages/admin/AdminUsers';
import DashboardBusiness from './pages/business/dashboardBusiness';
import BusinessCertifications from './pages/business/BusinessCertifications';
import BusinessStats from './pages/business/BusinessStats';
import Dashboard from './pages/dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Profile from './pages/profile/Profile';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './Routes/protectedRoute';
import GoogleCallback from './pages/GoogleCallback';

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['USER']}>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboardBusiness"
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardLayout>
                <DashboardBusiness />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboardBusiness/estadisticas"
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardLayout>
                <BusinessStats />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboardBusiness/certificaciones"
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardLayout>
                <BusinessCertifications />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/adminDashboard/usuarios"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout>
                <AdminUsers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/adminDashboard/negocios"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout>
                <AdminBusinesses />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute roles={['USER', 'owner', 'ADMIN']}>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
