import { Building2, Leaf, Search, ShieldCheck, Star } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Formats a follower/number count into a readable string (1 200 → "1.2k") */
function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** Single avatar circle (logo image or initials fallback) */
function Avatar({ business }) {
  if (business.logo) {
    return (
      <img
        src={business.logo}
        alt={business.businessName}
        className="w-8 h-8 rounded-full object-cover border-2 border-card-bg"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary-softest border-2 border-card-bg flex items-center justify-center text-[10px] font-bold text-primary-dark select-none">
      {(business.businessName || '??').slice(0, 2).toUpperCase()}
    </div>
  );
}

/** Fallback avatars rendered when no real businesses are available */
const FALLBACK_INITIALS = ['EC', 'VS', 'BN', 'GR'];

export default function HeroSection({
  totalBusinesses = 0,
  newThisWeek = 0,
  totalReviews = 0,
  avatarBusinesses = [],
  onSearch,           // (query: string) => void — smooth-scroll + filter mode
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const displayCount   = totalBusinesses > 0 ? totalBusinesses : 240;
  const displayWeek    = newThisWeek > 0 ? newThisWeek : 6;
  const displayReviews = totalReviews > 0 ? formatCount(totalReviews) : '—';

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      // Landing-page mode: filter in-page and scroll to results
      onSearch(query.trim());
    } else {
      // Fallback: navigate to the full explorar page
      const params = new URLSearchParams();
      if (query.trim())    params.set('q',   query.trim());
      if (location.trim()) params.set('loc', location.trim());
      const qs = params.toString();
      navigate(`/dashboard/explorar${qs ? `?${qs}` : ''}`);
    }
  };

  return (
    <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">

        {/* ══════════════════════════════════════════
            Left column
        ══════════════════════════════════════════ */}
        <div className="flex flex-col gap-8">

          {/* Eyebrow chip */}
          <span className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full border border-edge bg-card-bg text-xs font-medium text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-mid" />
            Directorio verificado · {displayCount}+ negocios
          </span>

          {/* H1 — serif + italic accent + terracotta highlight */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-heading leading-[1.05] tracking-tight">
            Descubre negocios{' '}
            <span className="italic text-primary-dark">que cuidan</span>{' '}
            <span className="relative inline-block">
              <span
                className="relative z-10  px-1"
                style={{ color: 'var(--color-terracotta)' }}>
                  el planeta
              </span>
            </span>
          </h1>

          {/* Lede */}
          <p className="text-base sm:text-lg text-body leading-relaxed max-w-lg">
            El directorio de comercios sostenibles más completo del país.
            Certificados, transparentes y comprometidos con tu comunidad.
          </p>

          {/* ── Search bar — el protagonista ── */}
          <form onSubmit={handleSearch}>
            <div className="bg-card-bg border border-edge rounded-2xl shadow-warm flex items-center overflow-hidden">

              {/* Cell 1 — Qué buscas */}
              <label className="flex-1 flex items-center gap-3 px-4 py-4 min-w-0 cursor-text">
                <Search className="w-4 h-4 text-muted shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-0.5">
                    Qué buscas
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Café, moda, artesanías…"
                    className="text-sm text-heading placeholder-muted bg-transparent outline-none w-full"
                  />
                </div>
              </label>

              {/* Explorar CTA */}
              <div className="p-2 shrink-0">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-dark text-on-dark-active text-sm font-semibold hover:bg-primary-darkest transition-colors whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span>Explorar</span>
                </button>
              </div>
            </div>
          </form>

          {/* ── Social proof row ── */}
          <div className="flex flex-wrap items-center gap-4">

            {/* Avatar stack + label */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {avatarBusinesses.length > 0
                  ? avatarBusinesses.slice(0, 4).map((biz) => (
                      <Avatar key={biz.id_business} business={biz} />
                    ))
                  : FALLBACK_INITIALS.map((init) => (
                      <div
                        key={init}
                        className="w-8 h-8 rounded-full bg-primary-softest border-2 border-card-bg flex items-center justify-center text-[10px] font-bold text-primary-dark select-none"
                      >
                        {init}
                      </div>
                    ))}
              </div>
              <p className="text-sm text-muted">
                <span className="font-semibold text-body">+{displayWeek} nuevos</span>{' '}
                esta semana
              </p>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-edge" />

            {/* B-Corp badge */}
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-ok-text shrink-0" />
              <span className="text-xs font-medium text-ok-text">Estándar B-Corp</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            Right column — decorative visual
        ══════════════════════════════════════════ */}
        <div className="hidden md:block relative shrink-0 w-full">
          <div
            className="w-full rounded-3xl overflow-hidden relative"
            style={{ aspectRatio: '4 / 5' }}
          >
            {/* Gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(155deg, var(--color-primary-mid) 0%, var(--color-primary-darkest) 100%)',
              }}
            />

            {/* Dot grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />

            {/* Giant translucent leaf */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <Leaf
                className="w-4/5 h-4/5 text-white opacity-[0.09]"
                strokeWidth={0.5}
              />
            </div>

            {/* Center wordmark */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-7 h-7 text-white/50" />
                </div>
                <p className="text-white/30 text-xs font-medium tracking-wider uppercase">
                  EcoVida
                </p>
              </div>
            </div>

            {/* ── Floating stat card 1 — top-left: total negocios ── */}
            <div className="absolute top-5 left-4 bg-card-bg rounded-2xl shadow-warm px-3.5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-primary-dark" />
              </div>
              <div>
                <p className="text-xl font-bold text-heading leading-none">
                  {displayCount}
                </p>
                <p className="text-[11px] text-muted mt-0.5">Negocios activos</p>
              </div>
            </div>

            {/* ── Floating stat card 2 — bottom-left: reseñas ── */}
            <div className="absolute bottom-[5.5rem] left-4 bg-card-bg rounded-2xl shadow-warm px-3.5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-heading leading-none">
                  {displayReviews}
                </p>
                <p className="text-[11px] text-muted mt-0.5">Reseñas verificadas</p>
              </div>
            </div>

            {/* ── Floating stat card 3 — bottom-right: B-Corp ── */}
            <div className="absolute bottom-5 right-4 bg-primary-dark rounded-2xl px-3.5 py-3 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-on-dark-active shrink-0" />
              <div>
                <p className="text-sm font-semibold text-on-dark-active leading-tight">
                  B-Corp
                </p>
                <p className="text-[10px] text-on-dark mt-0.5">Estándar global</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
