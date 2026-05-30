import {
  AlertTriangle,
  Building2,
  ChevronRight,
  Loader2,
  MessageSquare,
  RefreshCw,
  Star,
  Trash2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useMyReviews from '../../hooks/useMyReviews';
import { useToastContext } from '../../context/ToastContext';

/* ── Helpers ─────────────────────────────────────────────────── */
function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= value ? 'fill-amber-400 text-amber-400' : 'text-edge'
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/* ── Sub-components ──────────────────────────────────────────── */
function ReviewCard({ review, onDelete }) {
  const navigate   = useNavigate();
  const businessId = review.negocio?.id_business ?? review.negocio?.id ?? null;

  const handleCardClick = () => {
    if (!businessId) return;
    navigate(`/negocio/${businessId}`, { state: { scrollToReviews: true } });
  };

  return (
    <div className="bg-card-bg border border-edge rounded-2xl overflow-hidden hover:border-primary-light transition-colors">

      {/* Área clickeable → detalle del negocio + scroll a reseñas */}
      <button
        type="button"
        onClick={handleCardClick}
        disabled={!businessId}
        className="w-full text-left p-5 space-y-3 disabled:cursor-default group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-primary-softest flex items-center justify-center shrink-0 overflow-hidden">
            {review.negocio?.logo ? (
              <img
                src={review.negocio.logo}
                alt={review.negocio?.nombre ?? 'Negocio'}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-7 h-7 text-primary-dark" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-heading truncate group-hover:text-primary-dark transition-colors">
              {review.negocio?.nombre ?? '—'}
            </p>
            <p className="text-xs text-muted">{formatDate(review.fecha)}</p>
          </div>
          {businessId && (
            <ChevronRight className="w-4 h-4 text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        <StarRating value={review.rating} />

        {review.comment && (
          <p className="text-sm text-gray-600 leading-relaxed text-left">{review.comment}</p>
        )}
      </button>

      {/* Borrar reseña — fuera del área clickeable */}
      <div className="px-5 pb-4 flex justify-end border-t border-edge/50">
        <button
          onClick={() => onDelete(review.id_review)}
          title="Eliminar reseña"
          className="mt-3 flex items-center gap-1.5 text-xs text-muted hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] bg-card-bg rounded-2xl border border-edge p-8 text-center">
      <div className="w-16 h-16 bg-primary-softest rounded-2xl flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-muted" />
      </div>
      <h2 className="text-base font-semibold text-heading">Aún no has escrito reseñas</h2>
      <p className="text-sm text-muted mt-1.5 max-w-xs leading-relaxed">
        Explora negocios y comparte tu experiencia con la comunidad.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary-dark hover:text-primary-darkest transition-colors"
      >
        Explorar negocios
      </Link>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[220px] bg-card-bg rounded-2xl border border-edge p-8 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-sm font-semibold text-heading">Error al cargar reseñas</p>
      <p className="text-xs text-muted mt-1 max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 flex items-center gap-2 text-xs font-medium py-2 px-4 rounded-xl bg-primary-dark text-on-dark-active hover:bg-primary-darkest transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reintentar
      </button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function MisResenas() {
  const { reviews, loading, error, retry, remove } = useMyReviews();
  const { error: showError, success: showSuccess }  = useToastContext();

  const handleDelete = async (id) => {
    try {
      await remove(id);
      showSuccess('Reseña eliminada correctamente.');
    } catch {
      showError('No se pudo eliminar la reseña.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5 text-primary-dark" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-heading">Mis reseñas</h1>
          <p className="text-xs text-muted mt-0.5">
            {loading
              ? 'Cargando…'
              : `${reviews.length} reseña${reviews.length !== 1 ? 's' : ''} publicada${reviews.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary-mid" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : reviews.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id_review}
              review={review}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
