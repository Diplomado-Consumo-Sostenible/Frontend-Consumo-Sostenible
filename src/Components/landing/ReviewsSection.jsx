import {
  AlertTriangle, ChevronDown, ChevronUp,
  Edit3, Flag, Loader2, LogIn, MessageSquare, Send, Star, X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useBusinessReviews from '../../hooks/useBusinessReviews';
import { useToastContext } from '../../context/ToastContext';
import ReportModal from '../reviews/ReportModal';
import SuspiciousReviewModal from '../reviews/SuspiciousReviewModal';

const MAX_COMMENT_PREVIEW = 160;

/* ── Helpers ─────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)     return 'Hace un momento';
  if (diff < 3600)   return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400)  return `Hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
  return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function nameInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U';
}

/* ── StarRow (solo lectura) ──────────────────────────────────── */
function StarRow({ value, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${sz} ${
          s <= value ? 'fill-amber-400 text-amber-400' : 'fill-white text-gray-300'
        }`} />
      ))}
    </div>
  );
}

/* ── StarPicker (interactivo) ────────────────────────────────── */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 active:scale-95"
          aria-label={`${s} estrellas`}
        >
          <Star className={`w-7 h-7 transition-colors ${
            s <= (hover || value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-white text-gray-300 hover:text-amber-300'
          }`} />
        </button>
      ))}
    </div>
  );
}

/* ── StarFilter ──────────────────────────────────────────────── */
function StarFilter({ active, onChange, counts }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted shrink-0">Filtrar:</span>
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
          active === null
            ? 'bg-primary-dark text-on-dark-active border-primary-dark'
            : 'border-edge text-body hover:border-primary-mid'
        }`}
      >
        Todas
      </button>
      {[5, 4, 3, 2, 1].map((s) => (
        <button
          key={s}
          onClick={() => onChange(active === s ? null : s)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            active === s
              ? 'bg-amber-400 text-white border-amber-400'
              : 'border-edge text-body hover:border-amber-300'
          }`}
        >
          <Star className="w-3 h-3 fill-current" />
          {s}
          {counts[s] != null && (
            <span className={active === s ? 'text-white/80' : 'text-muted'}>
              ({counts[s]})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── ReviewForm ──────────────────────────────────────────────── */
function ReviewForm({ initial, onSubmit, onCancel, isEdit }) {
  const [rating,  setRating]  = useState(initial?.rating  ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [saving,  setSaving]  = useState(false);

  const valid = rating > 0 && comment.trim().length >= 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    try {
      // parseInt garantiza que rating sea entero antes de enviarlo al backend
      await onSubmit({ rating: parseInt(rating, 10), comment: comment.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-primary-softest border border-primary-light/40 rounded-2xl p-4 space-y-3 max-w-xl"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-heading">
          {isEdit ? 'Editar tu reseña' : 'Escribe una reseña'}
        </p>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-muted hover:text-body transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted">Calificación <span className="text-red-400">*</span></p>
        <StarPicker value={rating} onChange={setRating} />
        {rating === 0 && (
          <p className="text-[11px] text-muted">Selecciona una calificación</p>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted">
          Comentario <span className="text-red-400">*</span>
          <span className="ml-1 text-muted/60">(mín. 10 caracteres)</span>
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={400}
          placeholder="Comparte tu experiencia…"
          className="w-full px-3 py-2 text-sm border border-edge rounded-xl bg-card-bg text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid resize-none transition-colors"
        />
        <div className="flex justify-between text-[10px] text-muted">
          <span>{comment.trim().length < 10 ? `Faltan ${10 - comment.trim().length} caracteres` : '✓'}</span>
          <span>{comment.length}/400</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!valid || saving}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-dark text-on-dark-active text-sm font-semibold hover:bg-primary-darkest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{isEdit ? 'Guardando…' : 'Enviando…'}</>
          : <><Send className="w-3.5 h-3.5" />{isEdit ? 'Guardar cambios' : 'Publicar'}</>}
      </button>
    </form>
  );
}

/* ── ReviewCard ──────────────────────────────────────────────── */
function ReviewCard({ review, isOwn, onEdit, onReport, alreadyReported }) {
  const [showReport, setShowReport] = useState(false);
  const [reporting,  setReporting]  = useState(false);
  const [expanded,   setExpanded]   = useState(false);

  async function handleConfirm(reason) {
    setReporting(true);
    try {
      await onReport(review.id_review, reason);
      setShowReport(false);
    } finally {
      setReporting(false);
    }
  }

  const long    = (review.comment?.length ?? 0) > MAX_COMMENT_PREVIEW;
  const display = long && !expanded
    ? review.comment.slice(0, MAX_COMMENT_PREVIEW) + '…'
    : review.comment;

  return (
    <>
      {showReport && (
        <ReportModal
          loading={reporting}
          onConfirm={handleConfirm}
          onCancel={() => setShowReport(false)}
        />
      )}

      <div className={`bg-card-bg border rounded-2xl p-4 space-y-2.5 transition-colors ${
        isOwn ? 'border-primary-light/60 bg-primary-softest/30' : 'border-edge'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {review.avatar ? (
              <img src={review.avatar} alt={review.usuario}
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-edge" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-on-dark-active">
                  {nameInitials(review.usuario)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold text-heading truncate">{review.usuario}</p>
                {isOwn && (
                  <span className="text-[10px] font-normal text-primary-dark bg-primary-softest border border-primary-light px-1.5 py-0.5 rounded-full shrink-0">
                    Tú
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted">{timeAgo(review.fecha)}</p>
            </div>
          </div>
          <StarRow value={review.rating} />
        </div>

        {/* Comentario compacto con expansión */}
        {review.comment && (
          <div>
            <p className="text-sm text-body leading-relaxed">{display}</p>
            {long && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-0.5 text-xs text-primary-dark hover:text-primary-darkest transition-colors mt-1"
              >
                {expanded
                  ? <><ChevronUp className="w-3 h-3" />Ver menos</>
                  : <><ChevronDown className="w-3 h-3" />Ver más</>}
              </button>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-0.5">
          {isOwn && (
            <button onClick={onEdit}
              className="flex items-center gap-1 text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors">
              <Edit3 className="w-3 h-3" />Editar
            </button>
          )}
          {!isOwn && !alreadyReported && (
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1 text-xs text-muted hover:text-red-500 transition-colors ml-auto"
            >
              <Flag className="w-3 h-3" />Reportar
            </button>
          )}
          {alreadyReported && (
            <span className="text-xs text-muted ml-auto flex items-center gap-1">
              <Flag className="w-3 h-3" />Reportado
            </span>
          )}
        </div>
      </div>
    </>
  );
}

/* ── ReviewsSummary ──────────────────────────────────────────── */
function ReviewsSummary({ reviews, total, onFilterChange, activeFilter }) {
  if (!total && activeFilter === null) return null;
  const avg = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const counts = {};
  reviews.forEach((r) => { counts[r.rating] = (counts[r.rating] ?? 0) + 1; });

  return (
    <div className="flex items-start gap-6 p-4 bg-card-bg border border-edge rounded-2xl flex-wrap">
      <div className="text-center shrink-0 w-20">
        <p className="text-4xl font-bold text-heading leading-none">{avg.toFixed(1)}</p>
        <div className="flex justify-center mt-1.5">
          <StarRow value={Math.round(avg)} size="md" />
        </div>
        <p className="text-xs text-muted mt-1">{total} reseña{total !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 min-w-[140px] space-y-1.5">
        {[5, 4, 3, 2, 1].map((s) => {
          const c   = counts[s] ?? 0;
          const pct = total ? Math.round((c / total) * 100) : 0;
          return (
            <button key={s} onClick={() => onFilterChange(activeFilter === s ? null : s)}
              className={`w-full flex items-center gap-2 text-xs transition-opacity ${
                activeFilter != null && activeFilter !== s ? 'opacity-40' : ''
              }`}
            >
              <span className="w-2 text-right text-muted shrink-0">{s}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 h-1.5 bg-edge rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-5 text-left text-muted shrink-0">{c}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function ReviewsSection({ businessId, ownerUserId }) {
  const { success, error: toastError } = useToastContext();
  const [ratingFilter, setRatingFilter] = useState(null);

  const {
    reviews, meta, ratingCounts, myReview, loading, error,
    isAuthenticated, currentUserId,
    submitReview, report, loadMore, hasMore, retry,
  } = useBusinessReviews(businessId, { ratingFilter });

  const [editing,         setEditing]         = useState(false);
  const [showForm,        setShowForm]        = useState(false);
  const [reported,        setReported]        = useState(new Set());
  const [suspiciousError, setSuspiciousError] = useState(null);

  const handleSubmit = async (payload) => {
    try {
      const res = await submitReview(payload);
      success(res?.message ?? (myReview ? 'Reseña actualizada.' : 'Reseña publicada.'));
      setEditing(false);
      setShowForm(false);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.code === 'SUSPICIOUS_REVIEW') {
        // Mostrar modal bloqueante; el formulario queda intacto para corrección
        setSuspiciousError({ aiStars: data.aiStars ?? null });
      } else {
        toastError(data?.message ?? 'No se pudo guardar la reseña.');
      }
    }
  };

  const handleReport = async (reviewId, reason) => {
    try {
      const res = await report(reviewId, reason);
      success(res?.message ?? 'Reseña reportada.');
      setReported((prev) => new Set([...prev, reviewId]));
    } catch (err) {
      toastError(err?.response?.data?.message ?? 'No se pudo reportar la reseña.');
    }
  };

  const total = meta?.totalItems ?? reviews.length;
  const isBusinessOwner = currentUserId !== null && ownerUserId !== null &&
    Number(currentUserId) === Number(ownerUserId);

  return (
    <section className="space-y-5 max-w-3xl">
      {suspiciousError && (
        <SuspiciousReviewModal
          aiStars={suspiciousError.aiStars}
          onDismiss={() => setSuspiciousError(null)}
        />
      )}
      {/* Título */}
      <div className="flex items-center gap-2 border-b border-edge pb-3">
        <MessageSquare className="w-5 h-5 text-muted" />
        <h2 className="text-lg font-serif text-heading">
          Reseñas{total > 0 ? ` · ${total}` : ''}
        </h2>
      </div>

      {/* Resumen */}
      {(reviews.length > 0 || ratingFilter !== null) && (
        <ReviewsSummary reviews={reviews} total={total}
          onFilterChange={setRatingFilter} activeFilter={ratingFilter} />
      )}

      {/* Filtros */}
      {(total > 0 || ratingFilter !== null) && (
        <StarFilter
          active={ratingFilter}
          onChange={setRatingFilter}
          counts={ratingCounts}
        />
      )}

      {/* CTA reseña nueva — oculto para el owner de este negocio */}
      {!isBusinessOwner && (
        <>
          {isAuthenticated && myReview === null && !showForm && (
            <button onClick={() => setShowForm(true)}
              className="py-2.5 px-4 rounded-xl border border-dashed border-edge text-sm text-muted hover:border-primary-mid hover:text-primary-dark transition-colors">
              + Escribir reseña
            </button>
          )}
          {isAuthenticated && myReview === null && showForm && (
            <ReviewForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} isEdit={false} />
          )}
          {!isAuthenticated && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-softest/30 border border-primary-softest">
              <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-primary-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-heading">¿Visitaste este negocio?</p>
                <p className="text-xs text-muted mt-0.5">Inicia sesión para compartir tu experiencia con la comunidad</p>
              </div>
              <Link
                to="/login"
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-dark text-white text-xs font-semibold hover:bg-primary-darkest transition-colors whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                Iniciar sesión
              </Link>
            </div>
          )}
        </>
      )}

      {/* Estados */}
      {loading && reviews.length === 0 && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-primary-mid" />
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={retry} className="text-xs underline shrink-0">Reintentar</button>
        </div>
      )}
      {!loading && !error && reviews.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <MessageSquare className="w-7 h-7 text-muted/30" />
          <p className="text-sm text-muted">
            {ratingFilter
              ? `No hay reseñas de ${ratingFilter} estrella${ratingFilter !== 1 ? 's' : ''}.`
              : 'Sé el primero en dejar una reseña.'}
          </p>
          {ratingFilter && (
            <button onClick={() => setRatingFilter(null)}
              className="text-xs text-primary-dark hover:text-primary-darkest transition-colors">
              Ver todas las reseñas
            </button>
          )}
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {reviews.map((r) => {
          const isOwn = currentUserId != null && Number(r.id_usuario) === Number(currentUserId);
          return (
            <div key={r.id_review}>
              {isOwn && editing ? (
                <ReviewForm initial={r} onSubmit={handleSubmit} onCancel={() => setEditing(false)} isEdit />
              ) : (
                <ReviewCard
                  review={r}
                  isOwn={isOwn}
                  onEdit={() => setEditing(true)}
                  onReport={handleReport}
                  alreadyReported={reported.has(r.id_review)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Cargar más */}
      {hasMore && (
        <button onClick={loadMore} disabled={loading}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-edge text-sm text-muted hover:border-primary-mid hover:text-body transition-colors disabled:opacity-50">
          {loading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Cargando…</>
            : <><ChevronDown className="w-3.5 h-3.5" />Ver más reseñas</>}
        </button>
      )}
    </section>
  );
}
