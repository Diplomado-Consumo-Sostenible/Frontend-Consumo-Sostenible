// El dashboard de usuario fue eliminado.
// Los usuarios autenticados aterrizan en el landing page (/).
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  return <Navigate to="/" replace />;
}
