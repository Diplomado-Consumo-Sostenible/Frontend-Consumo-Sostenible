import { Navigate } from 'react-router-dom';
import { decodeToken } from '../utils/jwt.utils';
import { getToken } from '../utils/storage';

const ProtectedRoute = ({ children, roles = null }) => {
  const token = getToken();

  if (!token) return <Navigate to="/login" replace />;

  const decoded = decodeToken(token);

  if (!decoded) {
    return <Navigate to="/login" replace />;
  }

  // eslint-disable-next-line react-hooks/purity
  const isExpired = decoded?.exp ? Number(decoded.exp) * 1000 < Date.now() : true;
  if (isExpired) {
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
