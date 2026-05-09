import { useState, useMemo } from 'react';
import { Users, Star, FileText, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import useBusinessStats from '../../hooks/useBusinessStats';
import StatsMetricCard from '../../Components/business/stats/StatsMetricCard';
import StatsLineChart from '../../Components/business/stats/StatsLineChart';
import RecentFollowersList from '../../Components/business/stats/RecentFollowersList';
import ReviewsSection from '../../Components/business/stats/ReviewsSection';
import RecentReviewsPanel from '../../Components/business/stats/RecentReviewsPanel';
import OptimizationCard from '../../Components/business/stats/OptimizationCard';

const PERIODS = [
  { label: '7 días', value: '7d' },
  { label: '30 días', value: '30d' },
  { label: 'Año', value: 'year' },
];

const PERIOD_LABELS = { '7d': 'Últimos 7 días', '30d': 'Últimos 30 días', year: 'Último año' };

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-primary-mid" />
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-body text-sm">No se pudieron cargar las estadísticas</p>
      <button onClick={onRetry} className="text-sm text-primary-dark underline cursor-pointer">
        Reintentar
      </button>
    </div>
  );
}

function periodTotal(chartData) {
  return chartData.reduce((sum, b) => sum + b.valor, 0);
}

function ChartSection({ title, subtitle, data, color, periodLabel, loading }) {
  const total = useMemo(() => periodTotal(data), [data]);

  return (
    <div className="bg-card-bg rounded-2xl border border-edge p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-heading">{title}</h2>
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-heading leading-none">
            {loading ? '—' : total > 0 ? `+${total}` : total}
          </p>
          <p className="text-xs text-muted mt-1 flex items-center gap-1 justify-end">
            <TrendingUp className="w-3 h-3" />
            {periodLabel}
          </p>
        </div>
      </div>
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary-mid" />
        </div>
      ) : (
        <StatsLineChart data={data} yKey="valor" color={color} height={160} />
      )}
    </div>
  );
}

export default function BusinessStats() {
  const [period, setPeriod] = useState('30d');
  const { business, chartData, rawFollowers, loading, chartLoading, error, retry } =
    useBusinessStats(period);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={retry} />;
  if (!business) return null;

  const metrics = [
    {
      icon: Users,
      label: 'Seguidores Totales',
      value: business.followers_count != null
        ? Number(business.followers_count).toLocaleString('es-ES')
        : '—',
    },
    {
      icon: Star,
      label: 'Calificación Promedio',
      value: business.average_rating
        ? `${Number(business.average_rating).toFixed(1)} / 5`
        : '—',
    },
    {
      icon: FileText,
      label: 'Total de Reseñas',
      value: business.total_reviews != null
        ? Number(business.total_reviews).toLocaleString('es-ES')
        : '—',
    },
  ];

  return (
    <div className="pl-14 pr-4 py-6 flex gap-5 items-start w-full">

      {/* Contenido principal */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Encabezado + filtros de período */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-heading">Estadísticas de Negocio</h1>
            <p className="text-sm text-muted mt-0.5">
              Monitorea el crecimiento y compromiso de tu comunidad sostenible.
            </p>
          </div>
          <div className="flex gap-1 bg-primary-softest rounded-xl p-1 shrink-0">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  period === p.value
                    ? 'bg-primary-dark text-on-dark-active shadow-sm'
                    : 'text-primary-dark hover:bg-primary-light'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {metrics.map(m => (
            <StatsMetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Gráfica seguidores + lista de seguidores (contenedores separados) */}
        <div className="flex gap-4 items-start">
          {/* Gráfica */}
          <div className="flex-1 min-w-0 bg-card-bg rounded-2xl border border-edge p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-semibold text-heading">Nuevos seguidores</h2>
                <p className="text-xs text-muted mt-0.5">Seguidores ganados en el período seleccionado</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-heading leading-none">
                  {chartLoading
                    ? '—'
                    : (() => { const t = periodTotal(chartData.followers); return t > 0 ? `+${t}` : t; })()
                  }
                </p>
                <p className="text-xs text-muted mt-1 flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3 h-3" />
                  {PERIOD_LABELS[period]}
                </p>
              </div>
            </div>
            {chartLoading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary-mid" />
              </div>
            ) : (
              <StatsLineChart data={chartData.followers} yKey="valor" height={160} />
            )}
          </div>

          {/* Lista de últimos seguidores */}
          <div className="w-72 shrink-0 bg-card-bg rounded-2xl border border-edge p-5">
            <RecentFollowersList followers={rawFollowers} />
          </div>
        </div>

        {/* Gráfica: Nuevas reseñas */}
        <ChartSection
          title="Nuevas reseñas"
          subtitle="Reseñas recibidas en el período seleccionado"
          data={chartData.reviews}
          color="#4A9C6D"
          periodLabel={PERIOD_LABELS[period]}
          loading={chartLoading}
        />

        {/* Sección completa de reseñas */}
        <ReviewsSection businessId={business.id_business} />
      </div>

      {/* Panel lateral */}
      <aside className="w-80 shrink-0 space-y-4 sticky top-6">
        <RecentReviewsPanel
          businessId={business.id_business}
          total={business.total_reviews}
        />
        <OptimizationCard />
      </aside>
    </div>
  );
}
