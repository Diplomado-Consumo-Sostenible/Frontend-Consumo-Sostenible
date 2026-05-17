import { Navigate } from 'react-router-dom';
import { decodeToken } from '../utils/jwt.utils';
import { getToken, removeToken } from '../utils/storage';

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
    removeToken(); // limpiar el token vencido para que el usuario quede como invitado
    return <Navigate to="/login" replace />;
  }

  const userRole = decoded?.rol;

  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
