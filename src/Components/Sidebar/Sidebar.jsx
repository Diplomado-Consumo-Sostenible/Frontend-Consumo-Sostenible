import {
  Award,
  BarChart2,
  Building2,
  Compass,
  Flag,
  Hash,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  Lock,
  Package,
  Store,
  Tag,
  User,
  Users,
  VenetianMask,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useOwnerBusinessStatus from '../../hooks/useOwnerBusinessStatus';
import { decodeToken } from '../../utils/jwt.utils';
import { getToken } from '../../utils/storage';

const NAV_CONFIG = {
  admin: {
    menu: [
      { label: 'Dashboard',           icon: LayoutDashboard, to: '/adminDashboard'                  },
      { label: 'Gestionar Usuarios',  icon: Users,           to: '/adminDashboard/usuarios'         },
      { label: 'Moderación Negocios', icon: Building2,       to: '/adminDashboard/negocios'         },
      { label: 'Certificaciones',     icon: Award,           to: '/adminDashboard/certificaciones'  },
      { label: 'Categorías',          icon: Tag,             to: '/adminDashboard/categorias'       },
      { label: 'Tags',                icon: Hash,            to: '/adminDashboard/tags'             },
      { label: 'Géneros',             icon: VenetianMask,    to: '/adminDashboard/generos'          },
      { label: 'Reportes Reseñas',    icon: Flag,            to: '/adminDashboard/reportes'         },
    ],
    explore: [
      { label: 'Explorar negocios', icon: Compass, to: '/' },
    ],
    account: [
      { label: 'Mi perfil', icon: User, to: '/dashboard/profile' },
    ],
  },
  owner: {
    menu: [
      { label: 'Perfil de Negocio', icon: Store,           to: '/dashboardBusiness/perfil',          alwaysAccessible: true  },
      { label: 'Productos',         icon: Package,         to: '/dashboardBusiness/productos',       alwaysAccessible: false },
      { label: 'Estadísticas',      icon: BarChart2,       to: '/dashboardBusiness/estadisticas',    alwaysAccessible: false },
      { label: 'Certificaciones',   icon: Award,           to: '/dashboardBusiness/certificaciones', alwaysAccessible: false },
    ],
    explore: [
      { label: 'Explorar negocios', icon: Compass, to: '/', alwaysAccessible: true },
    ],
    account: [
      { label: 'Mi perfil', icon: User, to: '/dashboard/profile' },
    ],
  },
};

function NavItem({ item, active, locked }) {
  if (locked) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed select-none">
        <item.icon className="w-4 h-4 shrink-0 text-on-dark" />
        <span className="flex-1 truncate text-on-dark">{item.label}</span>
        <Lock className="w-3.5 h-3.5 text-on-dark shrink-0" />
      </div>
    );
  }

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
  const role   = decoded?.rol?.toLowerCase() || 'owner';
  const config = NAV_CONFIG[role] ?? NAV_CONFIG.owner;

  const { isRejected, isPending } = useOwnerBusinessStatus();
  const isBlocked = isRejected || isPending;

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
            <NavItem
              key={item.to}
              item={item}
              active={location.pathname === item.to}
              locked={isBlocked && item.alwaysAccessible === false}
            />
          ))}
        </div>

        {config.explore?.length > 0 && (
          <div className="space-y-0.5">
            <p className="px-3 pb-2 text-xs font-semibold text-on-dark/60 uppercase tracking-wider">Explorar</p>
            {config.explore.map((item) => (
              <NavItem
                key={item.to}
                item={item}
                active={location.pathname === item.to}
                locked={false}
              />
            ))}
          </div>
        )}

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
            <div className="w-7 h-7 rounded-lg bg-primary-mid/20 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 text-on-dark" />
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
