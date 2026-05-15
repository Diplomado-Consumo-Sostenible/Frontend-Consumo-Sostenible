import { Building2, LayoutDashboard, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile } from '../../services/user/profile.service';

const now = new Date();
const hour = now.getHours();
const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

const QUICK_LINKS = [
  { label: 'Gestionar Usuarios', desc: 'Crear, editar y controlar acceso de usuarios', icon: Users, to: '/adminDashboard/usuarios', color: 'bg-blue-50 text-blue-600' },
  { label: 'Moderación de Negocios', desc: 'Aprobar, rechazar y gestionar negocios', icon: Building2, to: '/adminDashboard/negocios', color: 'bg-primary-softest text-primary-dark' },
];

export default function AdminDashboard() {
  const [nombre, setNombre] = useState('Administrador');

  useEffect(() => {
    getMyProfile()
      .then((perfil) => {
        if (perfil?.nombre) setNombre(perfil.nombre);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="text-body font-medium">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary-dark" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-heading">
              {greeting}, {nombre}
            </h1>
            <p className="text-sm text-muted mt-0.5">Panel de administración · Consumo Sostenible</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Accesos rápidos</p>
        <div className="flex flex-wrap gap-3">
          {QUICK_LINKS.map((item) => (
            <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-8 bg-card-bg rounded-2xl border border-edge hover:border-primary-light hover:shadow-warm-sm transition-all group w-fit">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-body group-hover:text-heading transition-colors whitespace-nowrap">{item.label}</p>
                <p className="text-xs text-muted mt-0.5 whitespace-nowrap">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
