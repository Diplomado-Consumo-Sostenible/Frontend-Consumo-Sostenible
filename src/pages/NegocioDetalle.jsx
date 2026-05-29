import ModalOverlay from '../Components/ui/ModalOverlay';
import {
  AlertTriangle, Award, Building2, ChevronLeft, ChevronRight,
  Clock, Compass, Globe, Images, Leaf, Loader2, MapPin, Package,
  RefreshCw, Share2, ShieldCheck, Star,
  UserCheck, UserPlus, X,
} from 'lucide-react';
import SingleLocationMap from '../Components/map/SingleLocationMap';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PublicCertRow from '../Components/landing/PublicCertRow';
import PublicProductCard from '../Components/landing/PublicProductCard';
import ProductsSlider from '../Components/landing/ProductsSlider';
import ReviewsSection from '../Components/landing/ReviewsSection';
import AiReviewSummary from '../Components/landing/AiReviewSummary';
import { ContactDisplay, SocialCard } from '../Components/business/profile/BusinessContactCard';
import { ScheduleDisplay } from '../Components/business/profile/BusinessScheduleCard';
import usePublicBusinessById from '../hooks/usePublicBusinessById';
import { usePublicCertifications, usePublicProducts } from '../hooks/usePublicBusinessContent';
import useFollow from '../hooks/useFollow';
import useSimilarBusinesses from '../hooks/useSimilarBusinesses';
import { useToastContext } from '../context/ToastContext';

const DAY_JS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function calcOpenStatus(schedule) {
  if (!schedule || !Object.keys(schedule).length) return null;
  const key   = DAY_JS[new Date().getDay()];
  const entry = schedule[key];
  if (!entry || entry === 'Cerrado') return { open: false, label: 'Cerrado hoy' };
  const parts = entry.split(' - ');
  if (parts.length !== 2) return null;
  const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const now    = new Date().getHours() * 60 + new Date().getMinutes();
  const isOpen = now >= toMins(parts[0]) && now < toMins(parts[1]);
  return { open: isOpen, label: isOpen ? `Abierto · cierra ${parts[1]}` : `Cerrado · abre ${parts[0]}` };
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-7 h-7 animate-spin text-primary-mid" />
    </div>
  );
}

function PageError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-sm font-semibold text-heading">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-xl bg-primary-dark text-on-dark-active hover:bg-primary-darkest transition-colors"
      >
        <RefreshCw className="w-4 h-4" />Reintentar
      </button>
    </div>
  );
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-14">
      <Loader2 className="w-5 h-5 animate-spin text-primary-mid" />
    </div>
  );
}

function Empty({ icon, message }) {
  const EmptyIcon = icon;
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <div className="w-12 h-12 bg-primary-softest rounded-2xl flex items-center justify-center">
        <EmptyIcon className="w-6 h-6 text-muted" />
      </div>
      <p className="text-sm text-muted max-w-xs">{message}</p>
    </div>
  );
}

function BusinessCover({ business }) {
  const year    = business.createdAt ? new Date(business.createdAt).getFullYear() : null;
  const mapsUrl = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
    : null;

  const bannerSrc = business.banner_image ?? null;

  return (
    <div
      className="relative h-60 sm:h-80 rounded-3xl overflow-hidden"
      style={!bannerSrc ? { background: 'linear-gradient(160deg, var(--color-primary-mid) 0%, var(--color-primary-darkest) 100%)' } : undefined}
    >
      {bannerSrc && (
        <img
          src={bannerSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {bannerSrc ? (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)' }}
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 22% 30%, rgba(231,206,160,0.14) 0%, transparent 48%),' +
                'radial-gradient(circle at 78% 68%, rgba(91,138,102,0.25) 0%, transparent 52%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </>
      )}

      <div className="absolute right-[-50px] top-[-50px] opacity-[0.07] pointer-events-none select-none text-white">
        <Leaf style={{ width: 380, height: 380 }} strokeWidth={0.4} />
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <MapPin className="w-3 h-3" />Ver en mapa
          </a>
        )}
        {year && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-body backdrop-blur-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />Desde {year}
          </span>
        )}
      </div>
    </div>
  );
}

function BusinessProfile({ business }) {
  const { success, error: toastError } = useToastContext();
  const { isFollowing, toggle, loading, initializing, isAuthenticated } =
    useFollow(business.id_business);
  const status = calcOpenStatus(business.schedule);

  const handleFollow = async () => {
    if (!isAuthenticated) { toastError('Inicia sesión para seguir negocios'); return; }
    try {
      const result = await toggle();
      if (result?.nowFollowing) success(`¡Ahora sigues a ${business.businessName}!`);
      else if (result)          success(`Dejaste de seguir a ${business.businessName}`);
    } catch { toastError('No se pudo completar la acción'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: business.businessName, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href)
        .then(() => success('Enlace copiado al portapapeles'))
        .catch(() => {});
    }
  };

  const mapsUrl = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
    : null;

  return (
    <div
      className="relative z-10 -mt-16 mx-4 sm:mx-6 flex items-center flex-wrap gap-5 px-5 sm:px-8 py-5 rounded-2xl bg-white border"
      style={{
        borderColor: 'rgba(243,244,246,0.4)',
        boxShadow: '0px 0px 2px rgba(23,26,31,0.08), 0px 2px 4px rgba(23,26,31,0.09)',
      }}
    >
      <div className="relative shrink-0">
        <div
          className="w-[100px] h-[100px] rounded-full flex items-center justify-center overflow-hidden border-[3px] border-white"
          style={{ background: '#E5F9EF', boxShadow: '0 4px 20px 0 rgb(31 61 43 / 0.18)' }}
        >
          {business.logo
            ? <img src={business.logo} alt={business.businessName} className="w-full h-full object-cover" />
            : <Building2 className="w-10 h-10 text-primary-mid" />}
        </div>
        <div
          className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full border-2 border-white"
          style={{ background: status?.open ? '#28A745' : '#9CA3AF' }}
        />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {business.category?.category && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary-dark text-on-dark-active">
              <Leaf className="w-3 h-3" />{business.category.category}
            </span>
          )}
          {business.certifications?.some(c => c.status === 'Active') && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-ok-bg text-ok-text border border-ok-text/20">
              <ShieldCheck className="w-3 h-3" />Certificado
            </span>
          )}
        </div>

        <h1 className="font-serif text-[30px] leading-[36px] font-bold" style={{ color: '#171A1F' }}>
          {business.businessName}
        </h1>

        <div className="flex items-center gap-3 text-sm text-muted flex-wrap">
          {status && (
            <>
              <span className={`flex items-center gap-1.5 font-medium ${status.open ? 'text-ok-text' : 'text-muted'}`}>
                <span className={`w-2 h-2 rounded-full ${status.open ? 'bg-ok-text animate-pulse' : 'bg-muted'}`} />
                {status.label}
              </span>
              <span className="w-px h-4 bg-edge shrink-0" />
            </>
          )}
          {business.average_rating != null && (
            <>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <strong className="text-heading font-semibold">{Number(business.average_rating).toFixed(1)}</strong>
                <span>· {business.total_reviews ?? 0} reseñas</span>
              </span>
              {business.address && <span className="w-px h-4 bg-edge shrink-0" />}
            </>
          )}
          {business.address && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[220px]">{business.address}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleFollow}
          disabled={initializing || loading}
          aria-label={isFollowing ? 'Dejar de seguir' : 'Seguir'}
          className={`h-9 flex items-center gap-2 px-3 rounded-[6px] text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-[4px] ${
            isFollowing
              ? 'bg-[#3B803D] text-white hover:bg-[#2C5F2E]'
              : 'bg-white text-[#3B803D] hover:text-[#2C5F2E] active:text-[#1D3E1E]'
          }`}
          style={{ boxShadow: '0px 0px 2px #171a1f14, 0px 1px 2.5px #171a1f12' }}
        >
          {initializing || loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : isFollowing
              ? <><UserCheck className="w-4 h-4" />Siguiendo</>
              : <><UserPlus className="w-4 h-4" />Seguir</>}
        </button>

        <button
          onClick={handleShare}
          aria-label="Compartir"
          className="h-9 flex items-center gap-2 px-3 rounded-[6px] bg-white text-[#3B803D] text-sm font-medium transition-colors hover:text-[#2C5F2E] active:text-[#1D3E1E] backdrop-blur-[4px]"
          style={{ boxShadow: '0px 0px 2px #171a1f14, 0px 1px 2.5px #171a1f12' }}
        >
          <Share2 className="w-4 h-4" />Compartir
        </button>

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 flex items-center gap-2 px-3 rounded-[6px] bg-white text-[#3B803D] text-sm font-medium transition-colors hover:text-[#2C5F2E] active:text-[#1D3E1E] backdrop-blur-[4px]"
            style={{ boxShadow: '0px 0px 2px #171a1f14, 0px 1px 2.5px #171a1f12' }}
          >
            <Compass className="w-4 h-4" />Cómo llegar
          </a>
        )}
      </div>
    </div>
  );
}

function ImageLightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex ?? 0);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % images.length);
      if (e.key === 'ArrowLeft')  setCurrent((c) => (c - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
        <Images className="w-3.5 h-3.5 text-white/70" />
        <span className="text-xs text-white/80">{current + 1} / {images.length}</span>
      </div>
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}
      <img
        src={images[current]}
        alt={`Foto ${current + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryMosaic({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const items = images.slice(0, 5);
  if (!items.length) return null;

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gridTemplateRows: '190px 190px',
          gap: '8px',
        }}
      >
        {items.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="relative overflow-hidden bg-primary-softest group focus:outline-none"
            style={{ gridRow: i === 0 ? '1 / 3' : 'auto' }}
          >
            <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {i === 4 && images.length > 5 && (
              <div className="absolute inset-0 bg-primary-darkest/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <span className="font-serif text-3xl leading-none">+{images.length - 4}</span>
                <span className="text-xs text-white/80 mt-1">fotos</span>
              </div>
            )}
          </button>
        ))}
      </div>
      {lightboxIndex !== null && (
        <ImageLightbox images={images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}

function PublicProductDetailModal({ product, onClose }) {
  const price = product.price != null
    ? Number(product.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    : null;

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="bg-card-bg rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-52 bg-primary-softest">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-14 h-14 text-muted/40" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-heading text-base leading-tight">{product.name}</h3>
            {price && <span className="shrink-0 text-sm font-bold text-primary-dark">{price}</span>}
          </div>
          {product.description && (
            <p className="text-sm text-muted leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

function TabInfo({ business, businessId, ownerUserId, onViewProduct, onGoToProducts }) {
  const reviewsCount = business.total_reviews ?? 0;
  const { products }  = usePublicProducts(businessId);
  const certsCount    = business.certifications?.filter(c => c.status === 'Active').length ?? 0;

  return (
    <div className="space-y-10">
      {business.description && (
        <div className="rounded-2xl border border-edge overflow-hidden bg-card-bg">
          <div className="px-6 pt-5 pb-4">
            <h2 className="font-serif text-xl text-heading">Sobre el negocio</h2>
          </div>

          <div className="border-t border-edge/40 mx-6" />

          <div className="px-6 py-5">
            <p className="font-serif text-sm sm:text-base text-muted leading-relaxed">
              {business.description}
            </p>
          </div>

          <div className="flex gap-3 px-6 pb-6">
            {[
              { value: products.length,  label: 'Productos'       },
              { value: certsCount,       label: 'Certificaciones' },
              {
                value: business.average_rating != null
                  ? Number(business.average_rating).toFixed(1)
                  : '—',
                label: 'Puntuación',
              },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex-1 min-w-0 rounded-2xl border px-3 py-3 flex flex-col items-center justify-center gap-0.5"
                style={{ background: '#F5FAF5', borderColor: 'rgba(60,143,75,0.1)' }}
              >
                <span className="font-serif text-2xl font-bold leading-none" style={{ color: '#588157' }}>
                  {value}
                </span>
                <span className="text-xs font-semibold text-center leading-tight" style={{ color: '#565D6D' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="rounded-[10px] bg-white p-5 sm:p-6"
        style={{ boxShadow: '0px 0px 2px rgba(23,26,31,0.08), 0px 1px 2.5px rgba(23,26,31,0.07)' }}
      >
        <div className="mb-4">
          <h2 className="font-serif text-2xl text-heading">Productos</h2>
          <p className="text-sm text-muted mt-0.5">Lo más recomendado del negocio</p>
        </div>
        <ProductsSlider businessId={businessId} onView={onViewProduct} onSeeAll={onGoToProducts} />
      </div>

      {business.images?.length > 0 && (
        <div
          className="rounded-[10px] bg-white p-5 sm:p-6"
          style={{ boxShadow: '0px 0px 2px rgba(23,26,31,0.08), 0px 1px 2.5px rgba(23,26,31,0.07)' }}
        >
          <div className="mb-4">
            <h2 className="font-serif text-2xl text-heading">Galería</h2>
            <p className="text-sm text-muted mt-0.5">{business.images.length} fotos del espacio</p>
          </div>
          <GalleryMosaic images={business.images} />
        </div>
      )}

      {business.tags?.length > 0 && (
        <div
          className="rounded-[10px] bg-white p-5 sm:p-6"
          style={{ boxShadow: '0px 0px 2px rgba(23,26,31,0.08), 0px 1px 2.5px rgba(23,26,31,0.07)' }}
        >
          <div className="mb-4">
            <h2 className="font-serif text-2xl text-heading">Etiquetas sostenibles</h2>
            <p className="text-sm text-muted mt-0.5">Tipos de producto que ofrece este negocio</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {business.tags.map((t) => (
              <span
                key={t.id_tags ?? t.tagName}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary-softest text-primary-dark border border-primary-softest"
              >
                <Leaf className="w-3 h-3" />
                {t.tagName ?? t.name ?? t.tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <AiReviewSummary businessId={businessId} />

      <div id="reviews-section" className="space-y-4 border-t border-edge pt-8">
        <div>
          <h2 className="font-serif text-2xl text-heading">Reseñas de la comunidad</h2>
          <p className="text-sm text-muted mt-0.5">
            {reviewsCount > 0
              ? `${reviewsCount} reseña${reviewsCount !== 1 ? 's' : ''} verificada${reviewsCount !== 1 ? 's' : ''}`
              : 'Sé el primero en dejar una reseña'}
          </p>
        </div>
        <ReviewsSection businessId={businessId} ownerUserId={ownerUserId} />
      </div>
    </div>
  );
}

function TabProducts({ businessId, onViewProduct }) {
  const { products, loading, error, retry } = usePublicProducts(businessId);
  if (loading) return <SectionLoader />;
  if (error)   return <PageError message={error} onRetry={retry} />;
  if (!products.length) return <Empty icon={Package} message="Este negocio aún no tiene productos publicados." />;
  return (
    <div>
      <div className="mb-4">
        <h2 className="font-serif text-2xl text-heading">Productos</h2>
        <p className="text-sm text-muted mt-0.5">{products.length} producto{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <button
            key={p.id_product ?? i}
            type="button"
            onClick={() => onViewProduct?.(p)}
            className="text-left focus:outline-none"
          >
            <PublicProductCard product={p} />
          </button>
        ))}
      </div>
    </div>
  );
}

function TabCertifications({ businessId }) {
  const { certifications, loading, error, retry } = usePublicCertifications(businessId);
  if (loading) return <SectionLoader />;
  if (error)   return <PageError message={error} onRetry={retry} />;
  if (!certifications.length) return (
    <Empty icon={Award} message="Este negocio no tiene certificaciones activas registradas." />
  );
  return (
    <div>
      <div className="mb-4">
        <h2 className="font-serif text-2xl text-heading">Certificaciones</h2>
        <p className="text-sm text-muted mt-0.5">
          {certifications.length} certificación{certifications.length !== 1 ? 'es' : ''} verificada{certifications.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="bg-card-bg border border-edge rounded-2xl p-5 max-w-2xl">
        {certifications.map((c, i) => (
          <PublicCertRow key={c.id_certification ?? i} cert={c} />
        ))}
      </div>
    </div>
  );
}

function SidebarCard({ title, icon, children }) {
  const SideIcon = icon;
  return (
    <div className="bg-card-bg border border-edge rounded-2xl p-5 space-y-4">
      <h4 className="flex items-center gap-2 text-[11px] font-semibold text-muted uppercase tracking-wider">
        <SideIcon className="w-3.5 h-3.5" />{title}
      </h4>
      {children}
    </div>
  );
}

function ScheduleCard({ schedule }) {
  const hasSchedule = schedule && Object.keys(schedule).length > 0;
  const status = hasSchedule ? calcOpenStatus(schedule) : null;
  return (
    <SidebarCard title="Horario de atención" icon={Clock}>
      {!hasSchedule
        ? <p className="text-sm text-muted">Sin horario registrado.</p>
        : (
          <>
            {status && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                status.open ? 'bg-ok-bg text-ok-text' : 'bg-edge text-muted'
              }`}>
                <span className={`w-2 h-2 rounded-full ${status.open ? 'bg-ok-text animate-pulse' : 'bg-muted'}`} />
                {status.label}
              </span>
            )}
            <ScheduleDisplay schedule={schedule} />
          </>
        )
      }
    </SidebarCard>
  );
}

function MiniMapCard({ address, latitude, longitude, municipio }) {
  const hasCoords = Boolean(latitude && longitude);
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null;

  const municipioLine = municipio?.nombre
    ? [municipio.departamento?.nombre, municipio.nombre].filter(Boolean).join(' · ')
    : null;

  return (
    <SidebarCard title="Ubicación" icon={MapPin}>
      {municipioLine && (
        <div className="flex items-center gap-2 text-sm text-body">
          <MapPin className="w-3.5 h-3.5 text-primary-mid shrink-0" />
          <span>{municipioLine}</span>
        </div>
      )}
      {hasCoords
        ? <SingleLocationMap latitude={latitude} longitude={longitude} className="mb-1" />
        : (
          <div className="flex items-center justify-center h-32 rounded-xl bg-primary-softest border border-edge">
            <p className="text-xs text-muted">Sin coordenadas registradas</p>
          </div>
        )
      }
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-edge text-sm text-body hover:border-primary-mid hover:text-primary-dark transition-colors"
        >
          <Compass className="w-4 h-4" />Cómo llegar
        </a>
      )}
    </SidebarCard>
  );
}

function SimilarCard({ businesses, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <SidebarCard title="Negocios similares" icon={Leaf}>
        <SectionLoader />
      </SidebarCard>
    );
  }
  if (!businesses.length) return null;

  return (
    <SidebarCard title="Negocios similares" icon={Leaf}>
      <div className="space-y-1 -mx-1">
        {businesses.map((b) => (
          <button
            key={b.id_business}
            onClick={() => navigate(`/negocio/${b.id_business}`)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-primary-softest/40 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-softest flex items-center justify-center shrink-0 overflow-hidden">
              {b.logo
                ? <img src={b.logo} alt={b.businessName} className="w-full h-full object-cover" />
                : <span className="text-sm font-bold text-primary-dark select-none">
                    {(b.businessName || '??').slice(0, 2).toUpperCase()}
                  </span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-heading truncate">{b.businessName}</p>
              <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {b.average_rating ? Number(b.average_rating).toFixed(1) : '—'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </SidebarCard>
  );
}

function Sidebar({ business }) {
  const categoryId = business.category?.id_category ?? business.id_category;
  const { businesses: similar, loading: simLoading } = useSimilarBusinesses(
    categoryId,
    business.id_business,
  );

  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <SidebarCard title="Contacto" icon={Globe}>
        <ContactDisplay
          address={business.address}
          phone={business.phone}
          emailBusiness={business.emailBusiness}
          website={business.website}
        />
      </SidebarCard>

      <SocialCard
        instagramUrl={business.instagramUrl}
        facebookUrl={business.facebookUrl}
        xUrl={business.xUrl}
        website={business.website}
      />

      <ScheduleCard schedule={business.schedule} />

      {(business.address || business.latitude || business.municipio) && (
        <MiniMapCard
          address={business.address}
          latitude={business.latitude}
          longitude={business.longitude}
          municipio={business.municipio}
        />
      )}

      <SimilarCard businesses={similar} loading={simLoading} />
    </aside>
  );
}

const TABS = [
  { id: 'info',  label: 'Información',     icon: Globe   },
  { id: 'prods', label: 'Productos',       icon: Package },
  { id: 'certs', label: 'Certificaciones', icon: Award   },
];

export default function NegocioDetalle() {
  const { id }   = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab,      setActiveTab]      = useState('info');
  const [viewingProduct, setViewingProduct] = useState(null);

  const fromState = location.state?.business;
  const { business: fetched, loading, error, retry } = usePublicBusinessById(id);
  const business = fetched ?? fromState;

  useEffect(() => {
    if (!location.state?.scrollToReviews) return;
    const timer = setTimeout(() => {
      document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
    return () => clearTimeout(timer);
  }, [location.state?.scrollToReviews]);

  if (loading && !business) return <PageLoader />;
  if (error && !business) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <PageError message={error} onRetry={retry} />
      </div>
    );
  }
  if (!business) return null;

  const businessId = Number(id);
  const certsCount = business.certifications?.filter(c => c.status === 'Active').length ?? 0;

  const tabCount = (tab) => {
    if (tab.id === 'certs' && certsCount > 0) return certsCount;
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <button onClick={() => navigate(-1)} className="hover:text-body transition-colors">
          ← Volver
        </button>
        {business.category?.category && (
          <>
            <span className="opacity-50">/</span>
            <span>{business.category.category}</span>
          </>
        )}
        <span className="opacity-50">/</span>
        <span className="text-body font-medium truncate max-w-[160px]">{business.businessName}</span>
      </nav>

      <BusinessCover business={business} />

      <BusinessProfile business={business} />

      <div className="flex items-center gap-0.5 border-b border-edge overflow-hidden">
        {TABS.map((tab) => {
          const count = tabCount(tab);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px shrink-0 ${
                activeTab === tab.id
                  ? 'border-primary-dark text-primary-dark'
                  : 'border-transparent text-muted hover:text-body'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {count !== null && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-primary-softest text-primary-dark'
                      : 'bg-edge text-muted'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-10">

        <div>
          {activeTab === 'info'  && <TabInfo business={business} businessId={businessId} ownerUserId={business.owner_id ?? null} onViewProduct={setViewingProduct} onGoToProducts={() => setActiveTab('prods')} />}
          {activeTab === 'prods' && <TabProducts businessId={businessId} onViewProduct={setViewingProduct} />}
          {activeTab === 'certs' && <TabCertifications businessId={businessId} />}
        </div>

        <Sidebar business={business} />
      </div>

      {viewingProduct && (
        <PublicProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}

    </div>
  );
}
