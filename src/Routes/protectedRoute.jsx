import { Navigate } from 'react-router-dom';
import { decodeToken } from '../utils/jwt.utils';
import { getToken, removeToken } from '../utils/storage';

const ROLE_HOME = {
  ADMIN:  '/adminDashboard',
  owner:  '/dashboardBusiness/perfil',
  USER:   '/',
};

const ProtectedRoute = ({ children, roles = null }) => {
  const token = getToken();

  if (!token) return <Navigate to="/login" replace />;

  const decoded = decodeToken(token);

  if (!decoded) {
    removeToken();
    return <Navigate to="/login" replace />;
  }

  const isExpired = decoded?.exp ? Number(decoded.exp) * 1000 < Date.now() : true;
  if (isExpired) {
    removeToken();
    return <Navigate to="/login" replace />;
  }

  const userRole = decoded?.rol;

  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(userRole)) {
      const home = ROLE_HOME[userRole] ?? '/';
      return <Navigate to={home} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
