import { Award, Building2, Heart, MapPin, Star } from 'lucide-react';

const tagName = (t) => t.name ?? t.tagName ?? t.tag ?? '';

export default function LandingBusinessCard({
  business,
  isFavorite = false,
  onToggleFavorite,
  onViewDetail,
  variant = 'nearby',
}) {
  const hasCerts = business.certifications?.length > 0;
  const rating   = business.average_rating ?? null;

  if (variant === 'featured') {
    return (
      <div className="flex flex-col rounded-2xl border border-edge bg-card-bg overflow-hidden hover:shadow-warm transition-shadow">
        {/* Imagen superior */}
        <div className="relative h-40 bg-primary-softest flex items-center justify-center shrink-0">
          {business.logo ? (
            <img
              src={business.logo}
              alt={business.businessName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-12 h-12 text-muted" />
          )}

          {/* Badge de categoría */}
          {business.category?.category && (
            <span className="absolute top-3 left-3 text-xs px-2 py-0.5 bg-card-bg border border-edge rounded-full text-body font-medium shadow-sm">
              {business.category.category}
            </span>
          )}

          {/* Corazón */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(business.id_business); }}
            className="absolute top-3 right-3 p-1.5 rounded-xl bg-card-bg/80 backdrop-blur-sm hover:bg-card-bg transition-colors shadow-sm"
            aria-label={isFavorite ? 'Dejar de seguir' : 'Seguir negocio'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-terracotta text-terracotta' : 'text-muted hover:text-terracotta'
              }`}
            />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-heading leading-tight line-clamp-1">
              {business.businessName}
            </h4>
            <span className="flex items-center gap-1 shrink-0 text-xs">
              <Star className="w-3.5 h-3.5 text-amber" />
              <span className="text-muted">{rating !== null ? rating : '—'}</span>
            </span>
          </div>

          {hasCerts && (
            <span className="inline-flex items-center gap-1 self-start text-xs px-2 py-0.5 bg-ok-bg border border-ok-text/30 rounded-full text-ok-text">
              <Award className="w-3 h-3" />
              Certificado
            </span>
          )}

          {business.description && (
            <p className="text-xs text-muted leading-snug line-clamp-2">
              {business.description}
            </p>
          )}

          {business.address && (
            <span className="flex items-center gap-1 text-xs text-muted min-w-0">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{business.address}</span>
            </span>
          )}

          <button
            onClick={() => onViewDetail?.(business)}
            className="mt-auto w-full py-2 text-xs font-semibold rounded-xl bg-primary-dark text-on-dark-active hover:bg-primary-darkest transition-colors"
          >
            Ver perfil completo
          </button>
        </div>
      </div>
    );
  }

  /* variant='nearby' — idéntica a BusinessCard de Explorar */
  return (
    <div
      onClick={() => onViewDetail?.(business)}
      className="flex gap-3 p-3.5 rounded-2xl border border-edge bg-card-bg hover:border-primary-light hover:shadow-warm-sm cursor-pointer transition-all"
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
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(business.id_business); }}
            className="shrink-0 p-0.5 rounded-lg hover:bg-terracotta-soft transition-colors"
            aria-label={isFavorite ? 'Dejar de seguir' : 'Seguir negocio'}
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
            <Star className="w-3 h-3 text-amber" />
            <span>{rating !== null ? rating : '—'}</span>
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
          onClick={(e) => { e.stopPropagation(); onViewDetail?.(business); }}
          className="text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors pt-0.5"
        >
          Ver perfil completo →
        </button>
      </div>
    </div>
  );
}
