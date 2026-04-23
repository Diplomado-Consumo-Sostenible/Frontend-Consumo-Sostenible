import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/storage';

export default function PublicRoute({ children }) {
  const session = getSession();
  if (!session) return children;

  return <Navigate to={session.rol?.toUpperCase() === 'ADMIN' ? '/adminDashboard' : '/dashboard'} replace />;
}
