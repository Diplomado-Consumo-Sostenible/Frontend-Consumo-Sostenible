import { ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, Package } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePublicProducts } from '../../hooks/usePublicBusinessContent';
import PublicProductCard from './PublicProductCard';

const MAX_PRODUCTS    = 6;
const AUTOPLAY_DELAY  = 3500;
const AUTOPLAY_THRESHOLD = 4; // autoplay solo si hay más de 4 items en pista

/* ── Skeleton de carga ───────────────────────────────────────── */
function SliderSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-[calc(100%-12px)] sm:w-[calc(50%-6px)] lg:w-[calc(25%-9px)] h-60 bg-edge/40 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}

/* ── Card "Ver todos" ────────────────────────────────────────── */
function SeeAllCard({ remaining, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-full min-h-[220px] flex flex-col items-center justify-center gap-4
                 rounded-2xl border-2 border-dashed border-primary-light bg-primary-softest/50
                 hover:bg-primary-softest hover:border-primary-mid
                 transition-colors cursor-pointer p-5 text-center group"
    >
      <div className="w-12 h-12 rounded-full bg-primary-softest border border-primary-light
                      flex items-center justify-center
                      group-hover:bg-primary-light/40 transition-colors">
        <LayoutGrid className="w-5 h-5 text-primary-dark" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-primary-dark">Ver todos los productos</p>
        {remaining > 0 && (
          <p className="text-xs text-muted">
            +{remaining} producto{remaining !== 1 ? 's' : ''} más disponible{remaining !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <span className="flex items-center gap-1 text-xs font-medium text-primary-dark
                       group-hover:gap-2 transition-all duration-200">
        Ir a la sección <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}

/* ── Componente principal ────────────────────────────────────── */
export default function ProductsSlider({
  businessId,
  onView,
  onSeeAll,
  emptyMessage = 'Este negocio aún no tiene productos publicados.',
}) {
  const { products, loading, error, retry } = usePublicProducts(businessId);

  const trackRef      = useRef(null);
  const isPausedRef   = useRef(false);
  const currentIdxRef = useRef(0);

  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [canLeft,       setCanLeft]       = useState(false);
  const [canRight,      setCanRight]      = useState(false);
  const [visibleCount,  setVisibleCount]  = useState(4); // ítems que caben en pantalla

  // Máximo 6 productos en pista; si hay más se añade la card "ver todos"
  const visible   = products.slice(0, MAX_PRODUCTS);
  const remaining = products.length - MAX_PRODUCTS;
  const hasMore   = remaining > 0 && Boolean(onSeeAll);

  // Total de items en pista (productos visibles + card "ver todos" si aplica)
  const trackItems = visible.length + (hasMore ? 1 : 0);

  // Páginas reales = ceil(ítems / ítems visibles en pantalla)
  const pageCount   = trackItems > 0 ? Math.ceil(trackItems / visibleCount) : 1;
  const currentPage = Math.floor(currentIndex / visibleCount);

  /* Ir a un índice concreto */
  const scrollToIdx = useCallback((rawIdx) => {
    const track = trackRef.current;
    if (!track) return;
    const idx   = Math.max(0, Math.min(rawIdx, trackItems - 1));
    const cards = track.querySelectorAll('[data-card]');
    if (!cards[idx]) return;
    const left  = cards[idx].offsetLeft - track.offsetLeft;
    track.scrollTo({ left, behavior: 'smooth' });
    currentIdxRef.current = idx;
    setCurrentIndex(idx);
  }, [trackItems]);

  /* Recalcular nav y dot activo al hacer scroll */
  const updateNav = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanLeft(track.scrollLeft > 2);
    setCanRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);

    const cards = Array.from(track.querySelectorAll('[data-card]'));
    let closest = 0, minDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < minDist) { minDist = d; closest = i; }
    });
    currentIdxRef.current = closest;
    setCurrentIndex(closest);
  }, []);

  /* Detectar overflow al cambiar la lista */
  useEffect(() => {
    const track = trackRef.current;
    if (track) setCanRight(track.scrollWidth > track.clientWidth + 2);
  }, [products]);

  /* Calcular cuántos ítems caben en pantalla para derivar el nº de páginas */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || trackItems === 0) return;

    const compute = () => {
      if (track.scrollWidth > 0 && trackItems > 0) {
        const itemWidth = track.scrollWidth / trackItems;
        setVisibleCount(Math.max(1, Math.round(track.clientWidth / itemWidth)));
      }
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(track);
    return () => ro.disconnect();
  }, [trackItems]);

  /* Autoplay — solo cuando hay más items que los visibles en pantalla */
  useEffect(() => {
    if (trackItems <= AUTOPLAY_THRESHOLD) return;
    const timer = setInterval(() => {
      if (isPausedRef.current) return;
      const next = (currentIdxRef.current + 1) % trackItems;
      scrollToIdx(next);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [trackItems, scrollToIdx]);

  /* ── Estados de carga / error / vacío ── */
  if (loading) return <SliderSkeleton />;

  if (error) return (
    <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
      <span className="flex-1">Error al cargar productos.</span>
      {retry && (
        <button onClick={retry} className="text-xs underline shrink-0">
          Reintentar
        </button>
      )}
    </div>
  );

  if (!products.length) return (
    <div className="flex items-center gap-2 py-6 text-muted text-sm">
      <Package className="w-4 h-4 shrink-0 opacity-40" />
      <span>{emptyMessage}</span>
    </div>
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => { isPausedRef.current = true;  }}
      onMouseLeave={() => { isPausedRef.current = false; }}
    >
      {/* Botón anterior */}
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollToIdx(currentIdxRef.current - 1)}
          aria-label="Anterior"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                     w-8 h-8 rounded-full bg-card-bg border border-edge shadow-warm-sm
                     flex items-center justify-center
                     hover:border-primary-mid hover:text-primary-dark transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Botón siguiente */}
      {canRight && (
        <button
          type="button"
          onClick={() => scrollToIdx(currentIdxRef.current + 1)}
          aria-label="Siguiente"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                     w-8 h-8 rounded-full bg-card-bg border border-edge shadow-warm-sm
                     flex items-center justify-center
                     hover:border-primary-mid hover:text-primary-dark transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* overflow-hidden es el fix clave: evita que el layout de la página se rompa */}
      <div className="overflow-hidden w-full">
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto"
          style={{
            scrollSnapType:          'x mandatory',
            scrollbarWidth:          'none',
            msOverflowStyle:         'none',
            WebkitOverflowScrolling: 'touch',
          }}
          onScroll={updateNav}
        >
          {/* Productos (máx. 6) */}
          {visible.map((p, i) => (
            <div
              key={p.id_product ?? i}
              data-card
              className="shrink-0 w-[calc(100%-12px)] sm:w-[calc(50%-6px)] lg:w-[calc(25%-9px)]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <button
                type="button"
                onClick={() => onView?.(p)}
                className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-mid rounded-2xl"
              >
                <PublicProductCard product={p} />
              </button>
            </div>
          ))}

          {/* Card "Ver todos" — aparece cuando hay más de 6 productos */}
          {hasMore && (
            <div
              data-card
              className="shrink-0 w-[calc(100%-12px)] sm:w-[calc(50%-6px)] lg:w-[calc(25%-9px)]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <SeeAllCard remaining={remaining} onClick={onSeeAll} />
            </div>
          )}
        </div>
      </div>

      {/* Dots de navegación — 1 dot por página, no por ítem */}
      {pageCount > 1 && (
        <div className="flex justify-center gap-1.5 mt-3" role="tablist">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === currentPage}
              aria-label={`Página ${i + 1}`}
              onClick={() => scrollToIdx(i * visibleCount)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentPage
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
