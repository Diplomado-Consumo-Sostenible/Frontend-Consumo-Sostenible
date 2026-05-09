import {
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Star,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export const ANIM_STYLES = `
  @keyframes df-fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .df-card  { animation: df-fade-up 0.4s ease-out both; }
  .df-track { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
  .df-track.df-drag { scroll-behavior: auto; cursor: grabbing !important; user-select: none; }
`;

const CAT_GRADIENTS = [
  'from-emerald-400 to-green-600',
  'from-teal-400    to-cyan-600',
  'from-lime-400    to-emerald-600',
  'from-blue-400    to-indigo-500',
  'from-amber-400   to-orange-500',
  'from-violet-400  to-purple-600',
  'from-sky-400     to-blue-500',
  'from-rose-400    to-pink-500',
];

const TAG_COLORS = [
  'bg-green-100  text-green-700  border-green-200',
  'bg-amber-100  text-amber-700  border-amber-200',
  'bg-blue-100   text-blue-700   border-blue-200',
  'bg-teal-100   text-teal-700   border-teal-200',
  'bg-violet-100 text-violet-700 border-violet-200',
];

function seedGradient(id) { return CAT_GRADIENTS[(id ?? 0) % CAT_GRADIENTS.length]; }
function seedRating(id)   { return (3.8 + (((id ?? 1) * 97 + 41) % 13) * 0.1).toFixed(1); }
function seedDistance(id) { return ((((id ?? 1) * 137 + 23) % 47) / 10 + 0.3).toFixed(1); }

export function BusinessCard({
  business,
  delay = 0,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) {
  const name     = business.businessName ?? business.nombre      ?? 'Sin nombre';
  const category = business.category?.category ?? business.tipo_negocio ?? null;
  const address  = business.address ?? business.direccion        ?? null;
  const logo     = business.logo                                 ?? null;
  const tags     = (business.tags ?? []).slice(0, 3);
  const hasCert  = (business.certifications ?? []).length > 0;
  const gradient = seedGradient(business.id_business);
  const rating   = seedRating(business.id_business);
  const distance = seedDistance(business.id_business);

  const [imgError, setImgError] = useState(false);

  const handleToggle = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggleFavorite?.(business.id_business);
    },
    [business.id_business, onToggleFavorite],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={false}
      onClick={() => onSelect?.(business)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(business)}
      className="df-card group flex flex-col rounded-2xl border border-edge bg-card-bg overflow-hidden h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/8 hover:border-primary-light cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`relative h-44 shrink-0 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {logo && !imgError ? (
          <img
            src={logo}
            alt={name}
            loading="lazy"
            draggable={false}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-10 h-10 text-white/45" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {onToggleFavorite && (
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isFavorite ? 'Dejar de seguir' : 'Seguir negocio'}
            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm border border-white/25 transition-all duration-200 hover:bg-black/40 hover:scale-110 active:scale-95"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all duration-200 ${
                isFavorite ? 'fill-red-400 text-red-400' : 'text-white'
              }`}
            />
          </button>
        )}

        {hasCert && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/80 backdrop-blur-sm text-white">
            <Award className="w-2.5 h-2.5" />
            Cert.
          </span>
        )}

        {category && (
          <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white border border-white/20">
            {category}
          </span>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-white leading-none">{rating}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <h4 className="text-sm font-semibold text-heading leading-tight line-clamp-1 group-hover:text-primary-dark transition-colors duration-200">
          {name}
        </h4>

        <div className="flex items-center gap-1 text-[11px] text-muted">
          <MapPin className="w-3 h-3 text-primary-mid shrink-0" />
          <span className="font-medium">{distance} km</span>
          {address && (
            <>
              <span className="opacity-40">·</span>
              <span className="truncate">{address}</span>
            </>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {tags.map((t, i) => (
              <span
                key={t.id_tag ?? t.tag ?? i}
                className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${TAG_COLORS[i % TAG_COLORS.length]}`}
              >
                {t.tag ?? t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HorizontalCarousel({
  items,
  TitleIcon,
  title,
  titleBadge    = null,
  iconClassName = 'text-primary-mid',
  linkTo        = '/dashboard/explorar',
  linkLabel     = 'Ver todos →',
  emptyMsg      = 'No hay negocios disponibles',
  autoplay      = false,
  autoplayDelay = 4000,
  onSelect,
  renderItem,
}) {
  const trackRef         = useRef(null);
  const isDragging       = useRef(false);
  const dragStartX       = useRef(0);
  const dragStartScroll  = useRef(0);
  const touchStartX      = useRef(0);
  const touchStartScroll = useRef(0);
  const currentIdxRef    = useRef(0);
  const isPausedRef      = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [canLeft,      setCanLeft]      = useState(false);
  const [canRight,     setCanRight]     = useState(false);

  const scrollToIdx = useCallback(
    (rawIdx) => {
      const track = trackRef.current;
      if (!track) return;
      const idx   = Math.max(0, Math.min(rawIdx, items.length - 1));
      const cards = track.querySelectorAll('[data-card]');
      if (!cards[idx]) return;
      const left  = cards[idx].offsetLeft - track.offsetLeft;
      track.scrollTo({ left, behavior: 'smooth' });
      currentIdxRef.current = idx;
      setCurrentIndex(idx);
    },
    [items.length],
  );

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('[data-card]'));
    if (!cards.length) return;

    let closest = 0;
    let minDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < minDist) { minDist = d; closest = i; }
    });

    currentIdxRef.current = closest;
    setCurrentIndex(closest);
    setCanLeft(track.scrollLeft > 2);
    setCanRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (track) setCanRight(track.scrollWidth > track.clientWidth + 2);
  }, [items]);

  useEffect(() => {
    if (!autoplay || items.length <= 1) return;
    const timer = setInterval(() => {
      if (isPausedRef.current) return;
      const next = (currentIdxRef.current + 1) % items.length;
      scrollToIdx(next);
    }, autoplayDelay);
    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, items.length, scrollToIdx]);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    isDragging.current      = true;
    dragStartX.current      = e.clientX;
    dragStartScroll.current = trackRef.current.scrollLeft;
    trackRef.current.classList.add('df-drag');
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    trackRef.current.scrollLeft =
      dragStartScroll.current - (e.clientX - dragStartX.current);
  }, []);

  const endDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const track = trackRef.current;
    track.classList.remove('df-drag');
    const cards = Array.from(track.querySelectorAll('[data-card]'));
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < minDist) { minDist = d; closest = i; }
    });
    scrollToIdx(closest);
  }, [scrollToIdx]);

  const onTouchStart = useCallback((e) => {
    touchStartX.current      = e.touches[0].clientX;
    touchStartScroll.current = trackRef.current.scrollLeft;
    trackRef.current.style.scrollBehavior = 'auto';
  }, []);

  const onTouchMove = useCallback((e) => {
    trackRef.current.scrollLeft =
      touchStartScroll.current - (e.touches[0].clientX - touchStartX.current);
  }, []);

  const onTouchEnd = useCallback(() => {
    trackRef.current.style.scrollBehavior = 'smooth';
    const track = trackRef.current;
    const cards = Array.from(track.querySelectorAll('[data-card]'));
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < minDist) { minDist = d; closest = i; }
    });
    scrollToIdx(closest);
  }, [scrollToIdx]);

  if (items.length === 0) {
    return (
      <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <TitleIcon className={`w-4 h-4 ${iconClassName}`} />
          <h3 className="text-sm font-semibold text-heading">{title}</h3>
        </div>
        <p className="text-xs text-muted text-center py-8 italic">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div
      className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4"
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TitleIcon className={`w-4 h-4 ${iconClassName}`} />
          <h3 className="text-sm font-semibold text-heading">{title}</h3>
          {titleBadge}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollToIdx(currentIdxRef.current - 1)}
            disabled={!canLeft}
            aria-label="Anterior"
            className="w-7 h-7 rounded-full flex items-center justify-center border border-edge bg-app-bg text-muted transition-all duration-200 hover:border-primary-mid hover:text-primary-dark disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIdx(currentIdxRef.current + 1)}
            disabled={!canRight}
            aria-label="Siguiente"
            className="w-7 h-7 rounded-full flex items-center justify-center border border-edge bg-app-bg text-muted transition-all duration-200 hover:border-primary-mid hover:text-primary-dark disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <Link
            to={linkTo}
            className="text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors ml-1"
          >
            {linkLabel}
          </Link>
        </div>
      </div>

      <div
        ref={trackRef}
        className="df-track flex overflow-x-auto scrollbar-none cursor-grab gap-3 pb-1"
        style={{ scrollSnapType: 'x mandatory' }}
        onScroll={onScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((b, i) => (
          <div
            key={b.id_business ?? b.id ?? i}
            data-card
            className="shrink-0 w-[80vw] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)]"
            style={{ scrollSnapAlign: 'start' }}
          >
            {renderItem ? renderItem(b, i) : <BusinessCard business={b} delay={i * 55} onSelect={onSelect} />}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Ir a negocio ${i + 1}`}
              onClick={() => scrollToIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-5 bg-primary-dark'
                  : 'w-1.5 bg-edge hover:bg-primary-light'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
