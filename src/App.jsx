import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';
import UserLayout from './layouts/UserLayout';
import AdminDashboard from './pages/admin/admin_dashboard';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminUsers from './pages/admin/AdminUsers';
import DashboardBusiness from './pages/business/dashboardBusiness';
import BusinessProfile from './pages/business/BusinessProfile';
import BusinessCertifications from './pages/business/BusinessCertifications';
import BusinessProducts from './pages/business/BusinessProducts';
import BusinessStats from './pages/business/BusinessStats';
import CreateBusiness from './pages/business/CreateBusiness';
import Favoritos from './pages/user/Favoritos';
import MisResenas from './pages/user/MisResenas';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Profile from './pages/profile/Profile';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './Routes/protectedRoute';
import GoogleCallback from './pages/GoogleCallback';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
    <ToastProvider>
      <Routes>

        {/* ── Públicas ──────────────────────────────────────────── */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized"    element={<Unauthorized />} />
        <Route path="/auth/callback"   element={<GoogleCallback />} />

        {/* ── Usuario consumidor (UserLayout: LandingNavbar + Footer) */}
        <Route
          path="/favoritos"
          element={
            <ProtectedRoute roles={['USER']}>
              <UserLayout><Favoritos /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute roles={['USER']}>
              <UserLayout><Profile /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resenas"
          element={
            <ProtectedRoute roles={['USER']}>
              <UserLayout><MisResenas /></UserLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Owner (DashboardLayout: Sidebar + Navbar) ─────────── */}
        <Route
          path="/dashboardBusiness"
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardLayout><DashboardBusiness /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboardBusiness/estadisticas"
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardLayout><BusinessStats /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboardBusiness/certificaciones"
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardLayout><BusinessCertifications /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboardBusiness/crear-negocio"
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardLayout><CreateBusiness /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboardBusiness/productos"
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardLayout><BusinessProducts /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboardBusiness/perfil"
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardLayout><BusinessProfile /></DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Admin (DashboardLayout) ────────────────────────────── */}
        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminDashboard/usuarios"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout><AdminUsers /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminDashboard/negocios"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout><AdminBusinesses /></DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Perfil: owner y admin con DashboardLayout ──────────── */}
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute roles={['owner', 'ADMIN']}>
              <DashboardLayout><Profile /></DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Redirects de rutas antiguas del USER ───────────────── */}
        <Route path="/dashboard"           element={<Navigate to="/"          replace />} />
        <Route path="/dashboard/favoritos" element={<Navigate to="/favoritos" replace />} />
        <Route path="/dashboard/mapa"      element={<Navigate to="/"          replace />} />
        <Route path="/dashboard/explorar"  element={<Navigate to="/"          replace />} />

        {/* ── Catch-all ──────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
