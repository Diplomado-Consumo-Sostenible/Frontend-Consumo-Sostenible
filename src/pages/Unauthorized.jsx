import { ArrowLeftToLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../utils/jwt.utils';
import { getToken } from '../utils/storage';

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleBack = () => {
    const token = getToken();
    if (!token) return navigate('/login');

    const decoded = decodeToken(token);
    const rol = decoded?.rol;

    if (rol === 'admin') return navigate('/adminDashboard');
    if (rol === 'owner') return navigate('/dashboardBusiness/perfil');
    if (rol === 'user') return navigate('/dashboard');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-app-bg text-center px-4">
      <h1 className="text-7xl md:text-8xl font-bold font-serif text-heading">403</h1>

      <h2 className="text-3xl md:text-4xl font-semibold font-serif text-heading mt-4">Acceso no permitido</h2>

      <p className="text-muted mt-3 max-w-md leading-relaxed">
        No tienes permisos para acceder a esta página.
        <br />
        Serás redirigido a tu panel correspondiente.
      </p>

      <button
        onClick={handleBack}
        className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl
                bg-primary-dark text-on-dark-active font-medium
                shadow-warm
                hover:bg-primary-darkest
                transition-all duration-200"
      >
        <ArrowLeftToLine />
        Volver a mi panel
      </button>
    </div>
  );
}
