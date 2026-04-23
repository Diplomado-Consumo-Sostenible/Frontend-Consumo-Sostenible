import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/storage';

/**
 * @param {string|string[]} [roles] - roles permitidos. Si se omite, solo exige sesión activa.
 */
export default function ProtectedRoute({ children, roles }) {
  const session = getSession();

  if (!session) return <Navigate to="/login" replace />;

  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(session.rol?.toUpperCase())) {
      const fallback = session.rol?.toUpperCase() === 'ADMIN' ? '/adminDashboard' : '/dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  return children;
}
