import { Building2, Compass, Heart, MapPin, Maximize2, Minimize2, Star, Users, X } from 'lucide-react';
import { useState } from 'react';

const PIN_POSITIONS = [
  [140, 130], [340, 130], [490, 60], [630, 130],
  [85, 265], [185, 265], [490, 265], [750, 265],
];

const RANK_STYLES = {
  1: {
    wrap:   'ring-2 ring-terracotta bg-card-bg',
    badge:  'bg-terracotta border-terracotta/60 text-white',
    height: 'h-24',
  },
  2: {
    wrap:   'bg-card-bg',
    badge:  'bg-primary-softest border-edge text-primary-dark',
    height: 'h-20',
  },
  3: {
    wrap:   'bg-card-bg',
    badge:  'bg-primary-softest border-edge text-primary-dark',
    height: 'h-20',
  },
};

function PodiumCard({ business, rank, onSelect }) {
  const follows       = Number(business.followers_count ?? 0);
  const rating        = Number(business.average_rating ?? 0);
  const categoryLabel = business.category?.category ?? null;
  const logoUrl       = business.logo ?? null;
  const s             = RANK_STYLES[rank] ?? RANK_STYLES[3];

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
        <img
          src={logoUrl}
          alt={business.businessName}
          className={`w-full ${s.height} object-cover rounded-xl mb-3`}
        />
      ) : (
        <div className={`w-full ${s.height} rounded-xl bg-primary-softest flex items-center justify-center mb-3`}>
          <Building2 className="w-8 h-8 text-primary-mid" />
        </div>
      )}

      <p className="text-sm font-semibold text-heading line-clamp-1">{business.businessName}</p>

      {categoryLabel && (
        <span className="inline-block mt-1 px-2 py-0.5 rounded-full border border-edge bg-primary-softest text-primary-dark text-[10px] font-medium">
          {categoryLabel}
        </span>
      )}

      <div className="flex items-center justify-between mt-2.5 gap-2">
        <span className="flex items-center gap-1 text-xs font-semibold text-terracotta">
          <Heart className="w-3.5 h-3.5 fill-terracotta" />
          {follows.toLocaleString('es-ES')}
          <span className="text-muted font-normal">seguidores</span>
        </span>
        {rating > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-muted shrink-0">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MapSection({ businesses = [], communityFavorites = [], onViewDetail }) {
  const [expanded, setExpanded] = useState(false);
  const [activeBiz, setActiveBiz] = useState(null);

  const pins = businesses.slice(0, 8);

  const podiumOrder = [communityFavorites[1], communityFavorites[0], communityFavorites[2]].filter(Boolean);
  const podiumRanks = communityFavorites[1] ? [2, 1, 3] : communityFavorites[0] ? [1] : [];

  return (
    <section id="mapa" style={{ backgroundColor: '#e8e1d5' }} className="py-14 scroll-mt-20">
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

        <div className="relative mt-6 rounded-3xl overflow-hidden border border-edge shadow-warm">
          <div className={`transition-all duration-500 ease-in-out ${expanded ? 'h-[460px] sm:h-[520px]' : 'h-[300px] sm:h-[340px]'}`}>
            <svg
              viewBox="0 0 900 380"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
            >
              <rect width="900" height="380" fill="#d4ccba" />

              <line x1="0" y1="130" x2="900" y2="130" stroke="#f0ead8" strokeWidth={12} />
              <line x1="0" y1="265" x2="900" y2="265" stroke="#f0ead8" strokeWidth={12} />

              <line x1="0" y1="60" x2="900" y2="60" stroke="#e8e2d0" strokeWidth={6} />
              <line x1="0" y1="195" x2="900" y2="195" stroke="#e8e2d0" strokeWidth={6} />
              <line x1="0" y1="340" x2="900" y2="340" stroke="#e8e2d0" strokeWidth={6} />

              <line x1="185" y1="0" x2="185" y2="380" stroke="#f0ead8" strokeWidth={12} />
              <line x1="490" y1="0" x2="490" y2="380" stroke="#f0ead8" strokeWidth={12} />
              <line x1="750" y1="0" x2="750" y2="380" stroke="#f0ead8" strokeWidth={12} />

              <line x1="85" y1="0" x2="85" y2="380" stroke="#e8e2d0" strokeWidth={6} />
              <line x1="340" y1="0" x2="340" y2="380" stroke="#e8e2d0" strokeWidth={6} />
              <line x1="630" y1="0" x2="630" y2="380" stroke="#e8e2d0" strokeWidth={6} />
              <line x1="855" y1="0" x2="855" y2="380" stroke="#e8e2d0" strokeWidth={6} />

              <rect x={500} y={65} width={220} height={145} rx={20} fill="#b5cca4" stroke="#8fb07f" strokeWidth={1.5} opacity={0.7} />
              <text x="610" y="140" textAnchor="middle" fill="#5d8a55" fontSize="11" fontFamily="sans-serif" opacity={0.8}>
                Parque Central
              </text>

              <rect x={30} y={30} width={40} height={18} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={90} y={70} width={55} height={18} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={220} y={75} width={70} height={18} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={360} y={30} width={50} height={22} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={660} y={75} width={60} height={18} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={790} y={30} width={55} height={25} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={30} y={160} width={45} height={20} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={300} y={170} width={65} height={18} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={620} y={165} width={50} height={18} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={100} y={295} width={50} height={22} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={300} y={295} width={60} height={22} rx={3} fill="#cbc5b5" opacity={0.6} />
              <rect x={600} y={295} width={55} height={20} rx={3} fill="#cbc5b5" opacity={0.6} />

              {pins.map((biz, i) => {
                const [x, y] = PIN_POSITIONS[i];
                const isActive = activeBiz?.id_business === biz.id_business;
                const pillColor = isActive ? 'var(--color-terracotta)' : 'var(--color-primary-dark)';
                const name = (biz.businessName?.slice(0, 12) ?? '') + (biz.businessName?.length > 12 ? '…' : '');
                const pillW = Math.min(Math.max(name.length * 6.5 + 20, 65), 120);

                return (
                  <g
                    key={biz.id_business}
                    onClick={() => setActiveBiz((prev) => prev?.id_business === biz.id_business ? null : biz)}
                    style={{ cursor: 'pointer' }}
                  >
                    <title>{biz.businessName}</title>
                    <line x1={x} y1={y - 5} x2={x} y2={y - 18} stroke={pillColor} strokeWidth={2} />
                    <circle cx={x} cy={y} r={5} fill={pillColor} />
                    <rect x={x - pillW / 2} y={y - 46} width={pillW} height={28} rx={14} fill={pillColor} />
                    <text
                      x={x}
                      y={y - 32}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="sans-serif"
                    >
                      {name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute top-4 right-4 flex flex-col items-center bg-card-bg rounded-xl shadow border border-edge overflow-hidden">
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-app-bg text-body text-lg font-semibold transition-colors">
              +
            </button>
            <div className="w-5 h-px bg-edge" />
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-app-bg text-body text-lg font-semibold transition-colors">
              −
            </button>
            <div className="w-5 h-px bg-edge" />
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-app-bg text-body transition-colors">
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {activeBiz && (
            <div className="absolute bottom-4 left-4 bg-card-bg rounded-2xl shadow-warm border border-edge p-3 max-w-[250px]">
              <button
                onClick={() => setActiveBiz(null)}
                className="absolute top-1.5 right-1.5 p-0.5 rounded hover:bg-primary-softest transition-colors"
              >
                <X className="w-3 h-3 text-muted hover:text-body" />
              </button>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-softest flex items-center justify-center overflow-hidden">
                  {activeBiz.logo ? (
                    <img
                      src={activeBiz.logo}
                      alt={activeBiz.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-primary-mid" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="font-semibold text-heading text-xs line-clamp-1">{activeBiz.businessName}</p>
                  {activeBiz.category?.category && (
                    <span className="inline-block px-1.5 py-0.5 rounded-full bg-primary-softest text-primary-dark text-[10px] border border-edge">
                      {activeBiz.category.category}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3 h-3 ${n <= Math.round(Number(activeBiz.average_rating ?? 0)) ? 'text-amber-400 fill-amber-400' : 'text-edge'}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-muted" />
                    <span className="text-[10px] text-muted">~1.2 km</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-card-bg/90 backdrop-blur-sm rounded-xl border border-edge px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-dark" />
              <span className="text-[10px] text-body">Negocio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
              <span className="text-[10px] text-body">Seleccionado</span>
            </div>
          </div>
        </div>

        {podiumOrder.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50">
                <Users className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl text-heading tracking-tight">
                  Favoritos de la comunidad
                </h3>
                <p className="text-xs text-muted mt-0.5">Los negocios con más seguidores</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-end">
              {podiumOrder.map((biz, idx) => (
                <PodiumCard
                  key={biz.id_business}
                  business={biz}
                  rank={podiumRanks[idx]}
                  onSelect={onViewDetail}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
