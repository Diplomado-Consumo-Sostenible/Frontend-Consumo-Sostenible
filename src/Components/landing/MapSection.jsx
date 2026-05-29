import { Building2, Heart, MapPin, Maximize2, Minimize2, Star, Users } from 'lucide-react';
import { useState } from 'react';
import MapView from '../map/MapView';

const RANK_STYLES = {
  1: {
    wrap: 'ring-2 ring-terracotta bg-card-bg',
    badge: 'bg-terracotta border-terracotta/60 text-white',
    height: 'h-24',
  },
  2: {
    wrap: 'bg-card-bg',
    badge: 'bg-primary-softest border-edge text-primary-dark',
    height: 'h-20',
  },
  3: {
    wrap: 'bg-card-bg',
    badge: 'bg-primary-softest border-edge text-primary-dark',
    height: 'h-20',
  },
};

function PodiumCard({ business, rank, onSelect }) {
  const follows = Number(business.followers_count ?? 0);
  const rating = Number(business.average_rating ?? 0);
  const categoryLabel = business.category?.category ?? null;
  const logoUrl = business.logo ?? null;
  const s = RANK_STYLES[rank] ?? RANK_STYLES[3];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(business)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(business)}
      className={`rounded-2xl border border-edge p-4 relative cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-warm ${s.wrap}`}
    >
      <div className={`absolute -top-3 left-4 w-7 h-7 rounded-full border-2 flex items-center justify-center ${s.badge}`}>
        <span className="text-xs font-bold leading-none">{rank}</span>
      </div>

      {logoUrl ? (
        <img src={logoUrl} alt={business.businessName} className={`w-full ${s.height} object-cover rounded-xl mb-3`} />
      ) : (
        <div className={`w-full ${s.height} rounded-xl bg-primary-softest flex items-center justify-center mb-3`}>
          <Building2 className="w-8 h-8 text-primary-mid" />
        </div>
      )}

      <p className="text-base font-semibold text-heading line-clamp-1">{business.businessName}</p>

      {categoryLabel && (
        <span className="inline-block mt-1 px-2.5 py-1 rounded-full border border-edge bg-primary-softest text-primary-dark text-sm font-medium">
          {categoryLabel}
        </span>
      )}

      <div className="flex items-center justify-between mt-2.5 gap-2">
        <span className="flex items-center gap-1 text-base font-semibold text-terracotta">
          <Heart className="w-4 h-4 fill-terracotta" />
          {follows.toLocaleString('es-ES')}
          <span className="text-gray-600 font-normal">seguidores</span>
        </span>
        {rating > 0 && (
          <span className="flex items-center gap-1 text-base text-gray-600 shrink-0">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MapSection({ communityFavorites = [], onViewDetail }) {
  const [expanded, setExpanded] = useState(false);

  const podiumOrder = [communityFavorites[1], communityFavorites[0], communityFavorites[2]].filter(Boolean);
  const podiumRanks = communityFavorites[1] ? [2, 1, 3] : communityFavorites[0] ? [1] : [];

  return (
    <section id="mapa" style={{ backgroundColor: '#e8e1d5' }} className="py-14 scroll-mt-20 isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-softest">
              <MapPin className="w-5 h-5 text-primary-dark" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-heading tracking-tight">Explora el mapa</h2>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card-bg border border-edge text-sm text-body hover:bg-app-bg transition-colors"
          >
            {expanded ? (
              <>
                <Minimize2 className="w-4 h-4" />
                Reducir mapa
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                Ampliar mapa
              </>
            )}
          </button>
        </div>

        <div
          className={`transition-all duration-500 ease-in-out rounded-3xl overflow-hidden border border-edge shadow-warm ${
            expanded ? 'h-[560px] sm:h-[600px]' : 'h-[460px] sm:h-[440px]'
          }`}
        >
          <MapView />
        </div>

        {podiumOrder.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50">
                <Users className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl text-heading tracking-tight">Favoritos de la comunidad</h3>
                <p className="text-sm text-muted mt-0.5">Los negocios con más seguidores</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-end">
              {podiumOrder.map((biz, idx) => (
                <PodiumCard key={biz.id_business} business={biz} rank={podiumRanks[idx]} onSelect={onViewDetail} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
