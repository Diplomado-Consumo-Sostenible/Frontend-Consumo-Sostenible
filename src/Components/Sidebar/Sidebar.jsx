import { Award, BarChart2, Building2, LayoutDashboard, LogOut, User, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToastContext } from '../../context/ToastContext';
import { decodeToken } from '../../utils/jwt.utils';
import { getToken, removeToken } from '../../utils/storage';

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard',             icon: LayoutDashboard, to: '/adminDashboard'          },
    { label: 'Gestionar Usuarios',     icon: Users,           to: '/adminDashboard/usuarios' },
    { label: 'Moderación de Negocios', icon: Building2,       to: '/adminDashboard/negocios' },
    { label: 'Mi perfil',              icon: User,            to: '/dashboard/profile'       },
  ],
  user: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard'        },
    { label: 'Mi perfil', icon: User,            to: '/dashboard/profile' },
  ],
  owner: [
    { label: 'Dashboard',       icon: LayoutDashboard, to: '/dashboardBusiness'                  },
    { label: 'Estadísticas',    icon: BarChart2,        to: '/dashboardBusiness/estadisticas'    },
    { label: 'Certificaciones', icon: Award,            to: '/dashboardBusiness/certificaciones' },
    { label: 'Mi perfil',       icon: User,             to: '/dashboard/profile'                },
  ],
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token    = getToken();
  const decoded  = decodeToken(token);
  const role     = decoded?.rol?.toLowerCase() || 'user';
  const toast    = useToastContext();
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.user;
  const initials = decoded?.email ? decoded.email.slice(0, 2).toUpperCase() : '??';

  const handleLogout = () => {
    removeToken();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  return (
    <aside className="w-60 h-screen sticky top-0 overflow-hidden bg-primary-darkest border-r border-primary-light/20 flex flex-col shrink-0">

      <div className="px-5 py-4 border-b border-primary-light/20">
        <div className="flex items-center gap-2.5">
          <img
            src="https://res.cloudinary.com/dhhlvuzqa/image/upload/v1777184416/ecovida_perfiles/dns8fzkguprwuca0ydgv.webp"
            alt="Consumo Sostenible"
            className="w-8 h-8 rounded-lg object-contain shrink-0"
          />
          <span className="font-semibold text-on-dark-active text-sm leading-tight">
            Consumo
            <br />
            Sostenible
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-hidden">
        <p className="px-3 pb-2 text-xs font-semibold text-on-dark/60 uppercase tracking-wider">Menú</p>
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-dark text-on-dark-active'
                  : 'text-on-dark hover:text-on-dark-active hover:bg-primary-mid/30'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-primary-light/20 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-on-dark-active shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-on-dark-active capitalize">{role}</p>
            <p className="text-xs text-on-dark truncate">{decoded?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-on-dark hover:text-red-300 hover:bg-primary-mid/20 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
