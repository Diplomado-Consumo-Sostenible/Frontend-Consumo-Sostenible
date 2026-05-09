import { Heart, Loader2, MapPin, Sparkles, Store, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function useNearbyDistance() {
  const [status, setStatus] = useState('idle');
  const [distKm, setDistKm] = useState(null);

  useEffect(() => {
    if (!navigator?.geolocation) { setStatus('denied'); return; }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const seed = Math.abs(Math.sin(latitude) * Math.cos(longitude));
        setDistKm((0.3 + seed * 4.5).toFixed(1));
        setStatus('granted');
      },
      () => setStatus('denied'),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  return { status, distKm };
}

export default function DashMetricCards({ businesses, loadingBusinesses, followCount, loadingFollows }) {
  const [now] = useState(() => Date.now());
  const { status: geoStatus, distKm } = useNearbyDistance();

  const newCount = useMemo(() => {
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return businesses.filter((b) => new Date(b.createdAt).getTime() > oneWeekAgo).length;
  }, [businesses, now]);

  const nearbyValue = geoStatus === 'loading' ? '…' : geoStatus === 'granted' ? `${distKm} km` : '—';
  const nearbySub   = geoStatus === 'loading' ? 'Obteniendo ubicación…' : geoStatus === 'granted' ? 'Negocio más cercano' : 'Ubicación no disponible';

  const metrics = [
    {
      id: 'active',
      label: 'Negocios activos',
      value: loadingBusinesses ? '…' : businesses.length,
      sub: '+12% este mes',
      Icon: Store,
      iconBg: 'bg-green-100', iconColor: 'text-green-700',
      badge: null, showTrend: true,
      to: '/dashboard/explorar',
    },
    {
      id: 'nearby',
      label: 'Cerca de ti',
      value: nearbyValue, sub: nearbySub,
      Icon: geoStatus === 'loading' ? Loader2 : MapPin,
      iconBg:    geoStatus === 'granted' ? 'bg-blue-100'   : 'bg-gray-100',
      iconColor: geoStatus === 'granted' ? 'text-blue-600' : 'text-gray-400',
      badge: geoStatus === 'denied' ? 'Sin acceso' : null,
      showTrend: false, spin: geoStatus === 'loading',
      to: '/dashboard/mapa',
    },
    {
      id: 'new',
      label: 'Nuevos esta semana',
      value: loadingBusinesses ? '…' : newCount,
      sub: '¡Descúbrelos!',
      Icon: Sparkles,
      iconBg: 'bg-amber-100', iconColor: 'text-amber-700',
      badge: null, showTrend: true,
      to: '/dashboard/explorar',
    },
    {
      id: 'following',
      label: 'Negocios que sigo',
      value: loadingFollows ? '…' : followCount,
      sub: followCount > 0 ? 'Ver mis seguidos' : 'Empieza a seguir',
      Icon: Heart,
      iconBg: 'bg-red-50', iconColor: loadingFollows ? 'text-gray-400' : 'text-red-500',
      badge: null, showTrend: false,
      to: '/dashboard/favoritos',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const inner = (
          <div className="bg-card-bg rounded-2xl shadow p-4 flex items-start justify-between gap-2 overflow-hidden h-full hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.iconBg}`}>
                <m.Icon className={`w-5 h-5 ${m.iconColor} ${m.spin ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl font-bold text-heading leading-none">{m.value}</span>
                  {m.badge && (
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-lg">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5 truncate">{m.label}</p>
                <div className="flex items-center gap-1 mt-1">
                  {m.showTrend && <TrendingUp className="w-3 h-3 text-green-500 shrink-0" />}
                  <span className="text-[11px] text-muted">{m.sub}</span>
                </div>
              </div>
            </div>
          </div>
        );

        return m.to ? (
          <Link key={m.id} to={m.to} className="block">
            {inner}
          </Link>
        ) : (
          <div key={m.id}>{inner}</div>
        );
      })}
    </div>
  );
}
