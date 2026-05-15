import { ArrowRight, Award, Building2, Clock, Heart, MapPin, ShieldCheck, Star, Store } from 'lucide-react';

const tagName = (t) => t.name ?? t.tagName ?? t.tag ?? '';

const BRAND_COLORS = [
  '#4a7c59', '#7a5c3e', '#5b7fa6', '#8b6060',
  '#6b8f71', '#7a7045', '#6b6b8b', '#7a6b5a',
];

const getBrandColor = (str = '') => {
  const hash = str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return BRAND_COLORS[hash % BRAND_COLORS.length];
};

function FeaturedCard({ business, isFavorite, onToggleFavorite, onViewDetail }) {
  const rating        = Number(business.average_rating ?? 0);
  const tags          = business.tags?.slice(0, 3) ?? [];
  const hasCerts      = business.certifications?.length > 0;
  const isBCorp       = business.certifications?.some((c) =>
    (c.certificationName ?? c.name ?? '').toLowerCase().includes('b-corp'),
  );
  const initials      = (business.businessName || '??').slice(0, 2).toUpperCase();
  const brandColor    = getBrandColor(business.businessName);
  const categoryLabel = business.category?.category ?? null;

  return (
    <div
      onClick={() => onViewDetail?.(business)}
      className="group flex flex-col rounded-2xl border border-edge bg-card-bg overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-warm h-full"
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '4 / 3', backgroundColor: brandColor }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 60%), radial-gradient(circle at 70% 75%, rgba(255,255,255,0.08) 0%, transparent 50%)',
          }}
        />

        {business.logo ? (
          <img
            src={business.logo}
            alt={business.businessName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
            <span
              className="font-serif text-white/25 leading-none"
              style={{ fontSize: 'clamp(3rem, 8cqi, 5rem)' }}
            >
              {initials}
            </span>
          </div>
        )}

        {categoryLabel && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card-bg/90 backdrop-blur-sm text-xs font-medium text-heading shadow-sm">
              <Store className="w-3 h-3 shrink-0" />
              {categoryLabel}
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(business.id_business); }}
            className="w-8 h-8 rounded-full bg-card-bg/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-card-bg transition-colors"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-terracotta text-terracotta' : 'text-muted group-hover:text-terracotta'
              }`}
            />
          </button>
        </div>

        {isBCorp && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-heading/65 backdrop-blur-sm text-xs font-medium text-on-dark-active shadow-sm">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              B-Corp certificada
            </span>
          </div>
        )}

        {hasCerts && !isBCorp && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ok-bg/90 backdrop-blur-sm text-xs font-medium text-ok-text shadow-sm border border-ok-text/20">
              <Award className="w-3 h-3 shrink-0" />
              Certificado
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-heading leading-tight line-clamp-1 flex-1">
            {business.businessName}
          </h4>
          {rating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-heading">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted leading-snug line-clamp-2 min-h-[2.5rem]">
          {business.description ?? ''}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted flex-wrap min-h-[1.25rem]">
          {business.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[110px]">{business.address}</span>
            </span>
          )}
          {business.schedule && (
            <span className="flex items-center gap-1 text-ok-text">
              <Clock className="w-3 h-3 shrink-0" />
              <span>Abierto</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap min-h-[1.375rem]">
          {tags.map((t) => (
            <span
              key={t.id_tags ?? tagName(t)}
              className="px-2 py-0.5 bg-primary-softest text-primary-dark text-[10px] rounded-full border border-edge"
            >
              {tagName(t)}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onViewDetail?.(business); }}
          className="mt-auto w-full py-2 text-xs font-semibold rounded-xl bg-primary-dark text-on-dark-active hover:bg-primary-darkest transition-colors"
        >
          Ver perfil completo
        </button>
      </div>
    </div>
  );
}

function NearbyCard({ business, isFavorite, onToggleFavorite, onViewDetail }) {
  const hasCerts = business.certifications?.length > 0;
  const rating   = Number(business.average_rating ?? 0);

  return (
    <div
      onClick={() => onViewDetail?.(business)}
      className="flex gap-3 p-3.5 rounded-2xl border border-edge bg-card-bg hover:border-primary-light hover:shadow-warm hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-primary-softest flex items-center justify-center">
        {business.logo ? (
          <img src={business.logo} alt={business.businessName} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-6 h-6 text-muted" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-heading leading-tight truncate">
            {business.businessName}
          </h4>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(business.id_business); }}
            className="shrink-0 p-0.5 rounded-lg hover:bg-primary-softest transition-colors"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-terracotta text-terracotta' : 'text-muted hover:text-terracotta'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {business.category?.category && (
            <span className="text-xs px-2 py-0.5 bg-primary-softest border border-edge rounded-full text-body">
              {business.category.category}
            </span>
          )}
          {hasCerts && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-ok-bg border border-ok-text/30 rounded-full text-ok-text">
              <Award className="w-3 h-3" />
              Certificado
            </span>
          )}
        </div>

        {business.description && (
          <p className="text-xs text-muted leading-snug line-clamp-2">{business.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted pt-0.5">
          {business.address && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[160px]">{business.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto shrink-0">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{rating > 0 ? rating.toFixed(1) : '—'}</span>
          </span>
        </div>

        {business.tags?.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            {business.tags.slice(0, 3).map((t) => (
              <span key={t.id_tags} className="text-[10px] px-1.5 py-0.5 bg-edge/60 rounded-full text-muted">
                {tagName(t)}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onViewDetail?.(business); }}
          className="text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors pt-0.5"
        >
          Ver perfil completo <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function LandingBusinessCard({
  business,
  isFavorite = false,
  onToggleFavorite,
  onViewDetail,
  variant = 'nearby',
}) {
  if (variant === 'featured') {
    return (
      <FeaturedCard
        business={business}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onViewDetail={onViewDetail}
      />
    );
  }
  return (
    <NearbyCard
      business={business}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onViewDetail={onViewDetail}
    />
  );
}
