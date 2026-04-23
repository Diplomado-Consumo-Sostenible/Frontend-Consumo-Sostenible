import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import AdminDashboard from './pages/admin/admin_dashboard';
import AdminUsuarios from './pages/admin/usuarios';
import Dashboard from './pages/dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Rutas públicas — redirigen al dash si ya hay sesión */}
        <Route path="/*"               element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Rutas autenticadas — cualquier rol */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        {/* Rutas solo ADMIN */}
        <Route path="/adminDashboard" element={
          <ProtectedRoute roles="ADMIN"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/adminDashboard/usuarios" element={
          <ProtectedRoute roles="ADMIN"><AdminUsuarios /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
