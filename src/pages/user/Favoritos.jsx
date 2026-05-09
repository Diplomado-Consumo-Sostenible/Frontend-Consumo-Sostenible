import {
  Award,
  Building2,
  ChevronRight,
  Compass,
  Heart,
  HeartOff,
  LayoutDashboard,
  MapPin,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFollows } from '../../hooks/useFollows';
import { useToastContext } from '../../context/ToastContext';

function FavoriteCard({ business, onUnfollow }) {
  const hasCerts = business.certifications?.length > 0;

  return (
    <div className="relative flex gap-4 p-4 sm:p-5 bg-card-bg rounded-2xl shadow border border-edge hover:border-primary-light hover:shadow-md transition-all">
      <button
        onClick={() => onUnfollow(business.id_business)}
        title="Dejar de seguir"
        className="absolute top-3 right-3 p-1 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Heart className="w-4 h-4 fill-red-400 text-red-400 hover:fill-none hover:text-red-500 transition-all" />
      </button>

      <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden bg-primary-softest flex items-center justify-center">
        {business.logo ? (
          <img src={business.logo} alt={business.businessName} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-7 h-7 text-muted" />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-6 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-heading leading-tight">{business.businessName}</h3>
          {hasCerts && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-ok-bg border border-ok-text/30 rounded-full text-ok-text">
              <Award className="w-3 h-3" />
              Certificado
            </span>
          )}
        </div>

        {business.category?.category && (
          <span className="inline-block text-xs px-2 py-0.5 bg-primary-softest border border-edge rounded-full text-body">
            {business.category.category}
          </span>
        )}

        {business.description && (
          <p className="text-xs text-muted leading-snug line-clamp-2">{business.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted pt-0.5">
          {business.address && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{business.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto shrink-0 opacity-50" title="Valoración — Próximamente">
            <Star className="w-3 h-3" />
            <span>—</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyFavorites() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] bg-card-bg rounded-2xl shadow p-8 text-center">
      <div className="w-16 h-16 bg-primary-softest rounded-2xl flex items-center justify-center mb-4">
        <HeartOff className="w-8 h-8 text-muted" />
      </div>
      <h2 className="text-base font-semibold text-body">Aún no sigues ningún negocio</h2>
      <p className="text-sm text-muted mt-1.5 max-w-xs leading-relaxed">
        Explora negocios y toca el corazón para seguirlos.
      </p>
      <Link
        to="/dashboard/explorar"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary-dark hover:text-primary-darkest transition-colors"
      >
        <Compass className="w-4 h-4" />
        Explorar negocios
      </Link>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-edge rounded-2xl" />)}
    </div>
  );
}

export default function Favoritos() {
  const { followedBusinesses, loading, toggleFollow } = useFollows();
  const { error: showError } = useToastContext();

  const handleUnfollow = (id) => {
    toggleFollow(id, { onError: showError });
  };

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:pl-10 lg:pr-8 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="text-body font-medium">Inicio</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-body font-medium">Siguiendo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-primary-dark" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-heading">Negocios que sigo</h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              {loading
                ? 'Cargando…'
                : `${followedBusinesses.length} negocio${followedBusinesses.length !== 1 ? 's' : ''} seguido${followedBusinesses.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : followedBusinesses.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {followedBusinesses.map((biz) => (
              <FavoriteCard
                key={biz.id_business}
                business={biz}
                onUnfollow={handleUnfollow}
              />
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Link
              to="/dashboard/explorar"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-dark hover:text-primary-darkest transition-colors"
            >
              <Compass className="w-4 h-4" />
              Seguir explorando
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
