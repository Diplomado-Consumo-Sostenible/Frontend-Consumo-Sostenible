import { AlertTriangle } from 'lucide-react';
import LandingBusinessCard from '../business/LandingBusinessCard';

function SkeletonCard() {
  return <div className="animate-pulse bg-edge rounded-2xl h-28" />;
}

export default function NearbySection({
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
    <section className="bg-card-bg py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-2xl font-serif text-heading">Cerca de ti</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-warn-bg border border-warn-text/20 text-warn-text font-medium">
              Próximamente: filtro por ubicación
            </span>
          </div>
          <p className="text-sm text-muted">Descubre comercios sostenibles en tu área.</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 bg-app-bg rounded-2xl border border-edge text-center">
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
          <p className="text-sm text-muted py-8 text-center">No hay negocios disponibles en este momento.</p>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {shown.map((biz) => (
              <LandingBusinessCard
                key={biz.id_business}
                business={biz}
                variant="nearby"
                isFavorite={followedIds.has(biz.id_business)}
                onToggleFavorite={onToggleFavorite}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
