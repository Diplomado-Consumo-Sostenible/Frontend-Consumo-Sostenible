import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Leaf, Building2 } from 'lucide-react';
import { decodeToken } from '../../utils/jwt.utils';
import { getToken, removeToken } from '../../utils/storage';
import { useToastContext } from '../../context/ToastContext';

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/adminDashboard' },
    { label: 'Gestionar Usuarios', icon: Users, to: '/adminDashboard/usuarios' },
    { label: 'Moderación de Negocios', icon: Building2, to: '/adminDashboard/negocios' },
  ],
  user: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' }],
  owner: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboardBusiness' }],
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const decoded = decodeToken(token);
  const role = decoded?.rol?.toLowerCase() || 'user';
  const toast = useToastContext();

  const navItems = NAV_ITEMS[role] || NAV_ITEMS.user;

  const handleLogout = () => {
    removeToken();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const initials = decoded?.email ? decoded.email.slice(0, 2).toUpperCase() : '??';

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-stone-200 flex flex-col shrink-0">
      <div className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-stone-800 text-sm leading-tight">
            Consumo
            <br />
            Sostenible
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 pb-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">Menú</p>
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-emerald-50 text-emerald-700' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}>
              <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-600' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-stone-100 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 shrink-0">{initials}</div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-stone-600 capitalize">{role}</p>
            <p className="text-xs text-stone-400 truncate">{decoded?.email || ''}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
