import { LayoutDashboard, Users, Building2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getToken } from '../../utils/storage';
import { decodeToken } from '../../utils/jwt.utils';

const now = new Date();
const hour = now.getHours();
const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

const QUICK_LINKS = [
  { label: 'Gestionar Usuarios', desc: 'Crear, editar y controlar acceso de usuarios', icon: Users, to: '/adminDashboard/usuarios', color: 'bg-blue-50 text-blue-600' },
  { label: 'Moderación de Negocios', desc: 'Aprobar, rechazar y gestionar negocios', icon: Building2, to: '/adminDashboard/negocios', color: 'bg-emerald-50 text-emerald-600' },
];

export default function AdminDashboard() {
  const decoded = decodeToken(getToken());
  const email = decoded?.email || 'Administrador';

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="text-stone-600 font-medium">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-stone-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-800">{greeting}, {email.split('@')[0]}</h1>
            <p className="text-sm text-stone-400 mt-0.5">Panel de administración · Consumo Sostenible</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Accesos rápidos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map(item => (
            <Link key={item.to} to={item.to} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">{item.label}</p>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
