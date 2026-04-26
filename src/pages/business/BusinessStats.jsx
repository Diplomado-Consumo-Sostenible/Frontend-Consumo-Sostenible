import { BarChart2, Eye, LayoutDashboard, Star, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const STAT_CARDS = [
  { label: 'Visitas este mes',    value: '—', icon: Eye,        color: 'bg-blue-50 text-blue-600'       },
  { label: 'Nuevos seguidores',   value: '—', icon: Users,      color: 'bg-violet-50 text-violet-600'  },
  { label: 'Valoración promedio', value: '—', icon: Star,       color: 'bg-sky-100 text-sky-600'        },
  { label: 'Tendencia semanal',   value: '—', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
];

export default function BusinessStats() {
  return (
    <div className="pl-14 pr-6 py-6 space-y-8 max-w-3xl">

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <Link to="/dashboardBusiness" className="hover:text-body transition-colors">Mi Negocio</Link>
          <span>/</span>
          <span className="text-body font-medium">Estadísticas</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-primary-dark" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-heading">Estadísticas</h1>
            <p className="text-sm text-muted mt-0.5">
              Métricas y rendimiento de tu negocio · Próximamente
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 bg-primary-softest border border-edge rounded-2xl">
        <BarChart2 className="w-4 h-4 text-primary-mid shrink-0 mt-0.5" />
        <p className="text-sm text-primary-dark">
          Esta sección está en desarrollo. Pronto podrás ver métricas detalladas de tu negocio.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Resumen
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="bg-card-bg rounded-2xl border border-edge shadow-sm p-4 space-y-3 opacity-60"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-heading">{card.value}</p>
                <p className="text-xs text-muted mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
