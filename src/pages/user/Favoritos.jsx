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
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicBusinesses } from '../../services/business/explore.service';

function FavoriteCard({ business, onRemove }) {
  const hasCerts = business.certifications?.length > 0;

  return (
    <div className="relative flex gap-4 p-4 sm:p-5 bg-card-bg rounded-2xl shadow border border-edge hover:border-primary-light hover:shadow-md transition-all">
      <button
        onClick={() => onRemove(business.id_business)}
        title="Quitar de favoritos"
        className="absolute top-3 right-3 p-1 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <X className="w-4 h-4" />
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
      <h2 className="text-base font-semibold text-body">Aún no tienes favoritos</h2>
      <p className="text-sm text-muted mt-1.5 max-w-xs leading-relaxed">
        Explora negocios y toca el corazón para guardarlos aquí.
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

export default function Favoritos() {
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [favoriteIds, setFavoriteIds]     = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('cs_favorites') || '[]'));
    } catch {
      return new Set();
    }
  });

  const fetchBusinesses = useCallback(() => {
    getPublicBusinesses()
      .then((data) => setAllBusinesses(Array.isArray(data) ? data : []))
      .catch(() => setAllBusinesses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBusinesses(); }, [fetchBusinesses]);

  const removeFromFavorites = (id) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem('cs_favorites', JSON.stringify([...next]));
      return next;
    });
  };

  const favorites = useMemo(
    () => allBusinesses.filter((b) => favoriteIds.has(b.id_business)),
    [allBusinesses, favoriteIds],
  );

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:pl-10 lg:pr-8 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="text-body font-medium">Inicio</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-body font-medium">Favoritos</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-primary-dark" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-heading">Mis favoritos</h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              {loading
                ? 'Cargando…'
                : `${favorites.length} negocio${favorites.length !== 1 ? 's' : ''} guardado${favorites.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-edge rounded-2xl" />)}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {favorites.map((biz) => (
              <FavoriteCard
                key={biz.id_business}
                business={biz}
                onRemove={removeFromFavorites}
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
