import {
  ChevronRight,
  Compass,
  LayoutDashboard,
  Map as MapIcon,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../../Components/map/MapView';
import { getPublicBusinesses } from '../../services/business/explore.service';

const PIN_LEGEND = [
  { color: 'bg-primary-dark', border: 'border-primary-dark', label: 'Certificación Verde', desc: 'Negocios con prácticas de sostenibilidad verificadas' },
  { color: 'bg-amber-700',    border: 'border-amber-700',    label: 'Eco-amigable',        desc: 'Negocios con iniciativas ambientales' },
  { color: 'bg-blue-600',     border: 'border-blue-600',     label: 'Artesanal',           desc: 'Producción local y comercio justo' },
  { color: 'bg-muted',        border: 'border-edge',         label: 'Sin certificación',   desc: 'Negocios activos sin categoría específica' },
];

export default function Mapa() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading]       = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getPublicBusinesses()
      .then((data) => setBusinesses(Array.isArray(data) ? data : []))
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const init = async () => {
      await load();
    };

    init();
  }, [load]);

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:pl-10 lg:pr-8 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="text-body font-medium">Inicio</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-body font-medium">Mapa</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
              <MapIcon className="w-5 h-5 text-primary-dark" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-heading">Mapa de negocios</h1>
              <p className="text-xs sm:text-sm text-muted mt-0.5">
                Encuentra negocios sostenibles en tu área
              </p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-edge rounded-xl text-body hover:border-primary-light transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="bg-card-bg rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="min-h-[480px] bg-edge animate-pulse rounded-2xl" />
        ) : (
          <MapView
            businesses={businesses}
            className="min-h-[480px] rounded-2xl border-0"
            showLegend={false}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-card-bg rounded-2xl shadow p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary-mid" />
            <h3 className="text-sm font-semibold text-heading">Leyenda del mapa</h3>
          </div>
          <ul className="space-y-3">
            {PIN_LEGEND.map(({ color, border, label, desc }) => (
              <li key={label} className="flex items-start gap-3">
                <span className={`mt-0.5 w-3.5 h-3.5 rounded-full shrink-0 ${color} border ${border}`} />
                <div>
                  <p className="text-xs font-semibold text-body">{label}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card-bg rounded-2xl shadow p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-primary-mid" />
            <h3 className="text-sm font-semibold text-heading">Funcionalidades</h3>
          </div>
          <ul className="space-y-2.5">
            {[
              { label: 'Ver negocios en el mapa',           soon: false },
              { label: 'Filtrar por tipo de certificación', soon: false },
              { label: 'Tarjeta de resumen al seleccionar', soon: true  },
              { label: 'Mi ubicación actual',               soon: true  },
              { label: 'Ruta al negocio (Google Maps)',      soon: true  },
              { label: 'Radio de búsqueda ajustable',       soon: true  },
            ].map(({ label, soon }) => (
              <li key={label} className="flex items-center gap-2.5 text-xs">
                <span
                  className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    soon ? 'bg-warn-bg text-warn-text' : 'bg-ok-bg text-ok-text'
                  }`}
                >
                  {soon ? '·' : '✓'}
                </span>
                <span className={soon ? 'text-muted' : 'text-body'}>{label}</span>
                {soon && (
                  <span className="ml-auto text-[10px] text-warn-text bg-warn-bg px-1.5 py-0.5 rounded-full border border-warn-text/20">
                    Próximamente
                  </span>
                )}
              </li>
            ))}
          </ul>
          <Link
            to="/dashboard/explorar"
            className="block w-full text-center text-xs font-medium py-2 px-4 border border-dashed border-edge text-muted rounded-xl hover:border-primary-mid hover:text-primary-dark transition-colors"
          >
            Ver negocios en lista →
          </Link>
        </div>
      </div>
    </div>
  );
}
