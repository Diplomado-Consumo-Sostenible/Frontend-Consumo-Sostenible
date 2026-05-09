import {
  Award,
  BarChart2,
  Building2,
  Compass,
  Heart,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  Map as MapIcon,
  Package,
  Store,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPublicBusinesses } from '../../services/business/explore.service';
import { decodeToken } from '../../utils/jwt.utils';
import { getToken } from '../../utils/storage';

const NAV_CONFIG = {
  admin: {
    menu: [
      { label: 'Dashboard',           icon: LayoutDashboard, to: '/adminDashboard'          },
      { label: 'Gestionar Usuarios',  icon: Users,           to: '/adminDashboard/usuarios' },
      { label: 'Moderación Negocios', icon: Building2,       to: '/adminDashboard/negocios' },
    ],
    account: [
      { label: 'Mi perfil', icon: User, to: '/dashboard/profile' },
    ],
  },
  user: {
    menu: [
      { label: 'Inicio',    icon: LayoutDashboard, to: '/dashboard'            },
      { label: 'Explorar',  icon: Compass,         to: '/dashboard/explorar', showBizCount: true },
      { label: 'Favoritos', icon: Heart,            to: '/dashboard/favoritos' },
      { label: 'Mapa',      icon: MapIcon,          to: '/dashboard/mapa'      },
    ],
    account: [
      { label: 'Mi perfil', icon: User, to: '/dashboard/profile' },
    ],
  },
  owner: {
    menu: [
      { label: 'Dashboard',       icon: LayoutDashboard, to: '/dashboardBusiness'                  },
      { label: 'Perfil de Negocio', icon: Store,            to: '/dashboardBusiness/perfil' },
      { label: 'Productos',       icon: Package,          to: '/dashboardBusiness/productos'       },
      { label: 'Estadísticas',    icon: BarChart2,        to: '/dashboardBusiness/estadisticas'    },
      { label: 'Certificaciones', icon: Award,            to: '/dashboardBusiness/certificaciones' },
    ],
    account: [
      { label: 'Mi perfil', icon: User, to: '/dashboard/profile' },
    ],
  },
};

function NavItem({ item, active, bizCount }) {
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-dark text-on-dark-active'
          : 'text-on-dark hover:text-on-dark-active hover:bg-primary-mid/30'
      }`}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.showBizCount && bizCount !== null && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          active ? 'bg-white/20 text-on-dark-active' : 'bg-primary-mid/30 text-on-dark'
        }`}>
          {bizCount}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const token    = getToken();
  const decoded  = decodeToken(token);
  const role     = decoded?.rol?.toLowerCase() || 'user';
  const config   = NAV_CONFIG[role] || NAV_CONFIG.user;

  const [bizCount, setBizCount] = useState(null);

  useEffect(() => {
    if (role !== 'user') return;
    getPublicBusinesses()
      .then((data) => setBizCount(Array.isArray(data) ? data.length : null))
      .catch(() => setBizCount(null));
  }, [role]);

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
            Consumo<br />Sostenible
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
        <div className="space-y-0.5">
          <p className="px-3 pb-2 text-xs font-semibold text-on-dark/60 uppercase tracking-wider">Menú</p>
          {config.menu.map((item) => (
            <NavItem key={item.to} item={item} active={location.pathname === item.to} bizCount={bizCount} />
          ))}
        </div>

        {config.account.length > 0 && (
          <div className="space-y-0.5">
            <p className="px-3 pb-2 text-xs font-semibold text-on-dark/60 uppercase tracking-wider">Mi cuenta</p>
            {config.account.map((item) => (
              <NavItem key={item.to} item={item} active={location.pathname === item.to} bizCount={null} />
            ))}
          </div>
        )}
      </nav>

      <div className="px-3 pb-3">
        <div className="rounded-2xl bg-primary-mid/25 border border-primary-light/30 px-4 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 text-green-300" />
            </div>
            <p className="text-sm font-semibold text-on-dark-active leading-tight">
              Gracias por hacer la diferencia
            </p>
          </div>
          <p className="text-xs text-on-dark/75 leading-snug pl-9">
            Cada elección cuenta para un futuro más verde 🌱
          </p>
        </div>
      </div>

      <div className="px-3 py-4 border-t border-primary-light/20">
        <div className="flex items-center gap-2 px-3 py-1">
          <HelpCircle className="w-3.5 h-3.5 text-on-dark/50 shrink-0" />
          <a
            href="mailto:soporte@consumosostenible.co"
            className="text-xs text-on-dark/60 hover:text-on-dark-active transition-colors"
          >
            ¿Necesitas ayuda?
          </a>
        </div>
      </div>
    </aside>
  );
}
