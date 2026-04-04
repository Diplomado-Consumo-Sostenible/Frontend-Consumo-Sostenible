import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/admin_dashboard';
import Dashboard from './pages/dashboard';

function App() {
  return (
        <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
