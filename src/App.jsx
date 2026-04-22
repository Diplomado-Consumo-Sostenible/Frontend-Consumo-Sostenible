import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import AdminDashboard from "./pages/admin/admin_dashboard";
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*"                 element={<Login />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/adminDashboard"   element={<AdminDashboard />} />
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
