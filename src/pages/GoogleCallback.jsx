import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { decodeToken } from '../utils/jwt.utils';
import { saveToken } from '../utils/storage';

const redirectByRole = (rol, navigate) => {
  switch (rol?.toLowerCase()) {
    case 'admin': return navigate('/adminDashboard', { replace: true });
    case 'owner': return navigate('/dashboardBusiness', { replace: true });
    case 'user':
    default:      return navigate('/dashboard', { replace: true });
  }
};

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');

    if (!token) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    try {
      saveToken(token);
      const payload = decodeToken(token);
      redirectByRole(payload?.rol, navigate);
    } catch {
      navigate('/login?error=google_failed', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
        <p className="text-sm text-muted">Iniciando sesión con Google…</p>
      </div>
    </div>
  );
}
