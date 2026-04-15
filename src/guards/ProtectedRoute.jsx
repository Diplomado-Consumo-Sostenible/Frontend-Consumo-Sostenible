import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { decodeToken, getToken } from "../models/auth.model";

const ProtectedRoute = ({ children, requiredRoleId = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const payload = decodeToken(token);
        if (!payload) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
        setUserRole(payload.rol);
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoleId && userRole !== requiredRoleId) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;