import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import './App.css';
import AdminDashboard from "./pages/admin/admin_dashboard";
import Dashboard from './pages/dashboard';
import DashboardBusiness from './pages/dashboardBusiness';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from "./Routes/protectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized"    element={<Unauthorized />} />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={["user"]}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/dashboardBusiness" element={
          <ProtectedRoute roles={["owner"]}>
            <DashboardBusiness />
          </ProtectedRoute>
        } />

        <Route path="/adminDashboard" element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
