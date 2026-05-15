import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingBusinessCard from '../business/LandingBusinessCard';
import MapView from '../map/MapView';

function SkeletonCard() {
  return <div className="animate-pulse bg-edge rounded-2xl h-64" />;
}

export default function FeaturedSection({
  businesses = [],
  loading = false,
  error = null,
  onRetry,
  followedIds = new Set(),
  onToggleFavorite,
  onViewDetail,
}) {
  const shown = businesses.slice(0, 3);

  return (
    <section className="bg-app-bg py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-serif text-heading">Negocios Destacados</h2>
            <p className="text-sm text-muted mt-1">Comercios con el mayor impacto y mejor valoración.</p>
          </div>
          <Link
            to="/dashboard/explorar"
            className="text-sm font-medium text-primary-dark hover:text-primary-darkest transition-colors shrink-0"
          >
            Ver todos los destacados <ArrowRight className="w-3.5 h-3.5 inline-block" />
          </Link>
        </div>

        {/* Layout: cards + mapa */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Cards */}
          <div className="md:col-span-2">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8 bg-card-bg rounded-2xl border border-edge text-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-body font-medium">No se pudieron cargar los negocios</p>
                <button
                  onClick={onRetry}
                  className="text-xs font-medium py-1.5 px-4 bg-primary-dark text-on-dark-active rounded-xl hover:bg-primary-darkest transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : shown.length === 0 ? (
              <p className="text-sm text-muted py-8 text-center">No hay negocios destacados disponibles.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shown.map((biz) => (
                  <LandingBusinessCard
                    key={biz.id_business}
                    business={biz}
                    variant="featured"
                    isFavorite={followedIds.has(biz.id_business)}
                    onToggleFavorite={onToggleFavorite}
                    onViewDetail={onViewDetail}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mapa */}
          <div className="md:col-span-1">
            <MapView
              businesses={businesses}
              className="h-full min-h-[320px]"
              compact
            />
          </div>
        </div>
      </div>
    </section>
  );
}
