import { ChevronDown, Heart, LogOut, Settings, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToastContext } from '../../context/ToastContext';
import { decodeToken } from '../../utils/jwt.utils';
import { getToken, removeToken } from '../../utils/storage';

const MENU_ITEMS = [
  { label: 'Mi perfil',     Icon: User,     to: '/dashboard/profile'   },
  { label: 'Favoritos',     Icon: Heart,    to: '/dashboard/favoritos' },
  { label: 'Configuración', Icon: Settings, to: null, soon: true       },
];

export default function UserMenu({ profile }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const navigate        = useNavigate();
  const toast           = useToastContext();

  const token     = getToken();
  const decoded   = decodeToken(token);
  const email     = decoded?.email ?? profile?._user?.email ?? '';
  const firstName = (profile?._profile?.nombre ?? profile?.nombre ?? '').split(' ')[0] || 'Usuario';
  const photo     = profile?._profile?.foto_perfil ?? null;
  const initial   = firstName.charAt(0).toUpperCase();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    removeToken();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-edge/60 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-primary-softest flex items-center justify-center ring-2 ring-edge">
          {photo
            ? <img src={photo} alt={firstName} className="w-full h-full object-cover" />
            : <span className="text-sm font-bold text-primary-dark">{initial}</span>}
        </div>
        <span className="hidden sm:block text-sm font-medium text-heading leading-none">{firstName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card-bg rounded-2xl shadow-2xl border border-edge z-50 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-edge/50">
            <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden bg-primary-softest flex items-center justify-center ring-2 ring-edge">
              {photo
                ? <img src={photo} alt={firstName} className="w-full h-full object-cover" />
                : <span className="text-sm font-bold text-primary-dark">{initial}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-heading truncate">{firstName}</p>
              <p className="text-xs text-muted truncate">{email}</p>
            </div>
          </div>

          <div className="py-1.5">
            {MENU_ITEMS.map(({ label, Icon, to, soon }) =>
              soon ? (
                <div key={label} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted opacity-50 cursor-not-allowed select-none">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  <span className="text-[10px] italic">Próximamente</span>
                </div>
              ) : (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-body hover:bg-edge/60 hover:text-heading transition-colors"
                >
                  <Icon className="w-4 h-4 shrink-0 text-muted" />
                  <span>{label}</span>
                </Link>
              ),
            )}
          </div>

          <div className="border-t border-edge/50 py-1.5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted hover:text-red-500 hover:bg-red-50/60 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
