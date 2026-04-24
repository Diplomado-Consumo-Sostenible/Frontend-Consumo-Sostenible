import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AdminDashboard from './pages/admin/admin_dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import Dashboard from './pages/dashboard';
import DashboardBusiness from './pages/dashboardBusiness';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './Routes/protectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

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
            <ProtectedRoute roles={['OWNER']}>
              <DashboardLayout>
                <DashboardBusiness />
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
