import { Flag, Loader2, Star, X } from 'lucide-react';
import { useState } from 'react';

/* ── Valores exactos del enum ReportReason del backend ──────── */
const REPORT_REASONS = [
  'Lenguaje ofensivo o inapropiado',
  'Spam o publicidad',
  'Reseña falsa o no es cliente',
  'Otro',
];

/* ── Avatar ──────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  'bg-primary-softest text-primary-dark',
  'bg-earth-cream text-earth-dark',
  'bg-blue-50 text-blue-700',
  'bg-violet-50 text-violet-700',
];

function Avatar({ name }) {
  const initials = (name ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const colorClass = AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${colorClass}`}>
      {initials}
    </div>
  );
}

/* ── StarRating ──────────────────────────────────────────────── */
function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 mt-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-edge text-edge'}`} />
      ))}
    </div>
  );
}

/* ── ReportModal ─────────────────────────────────────────────── */
function ReportModal({ onConfirm, onCancel, loading }) {
  const [selected, setSelected] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card-bg rounded-2xl border border-edge shadow-warm w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            Reportar reseña
          </h3>
          <button onClick={onCancel} className="text-muted hover:text-body transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted">Selecciona el motivo del reporte:</p>

        <div className="space-y-2">
          {REPORT_REASONS.map((reason) => (
            <label
              key={reason}
              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                selected === reason
                  ? 'border-red-300 bg-red-50'
                  : 'border-edge hover:border-muted'
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                value={reason}
                checked={selected === reason}
                onChange={() => setSelected(reason)}
                className="accent-red-500"
              />
              <span className="text-sm text-body">{reason}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-xl border border-edge text-sm text-muted hover:text-body transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            disabled={!selected || loading}
            onClick={() => onConfirm(selected)}
            className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── ReviewCard ──────────────────────────────────────────────── */
export default function ReviewCard({ review, compact = false, onReport, isReported }) {
  const [showReport, setShowReport] = useState(false);
  const [reporting,  setReporting]  = useState(false);

  const date = review.fecha
    ? new Date(review.fecha).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  async function handleConfirm(reason) {
    setReporting(true);
    try {
      await onReport(review.id_review, reason);
      setShowReport(false);
    } finally {
      setReporting(false);
    }
  }

  return (
    <>
      {showReport && (
        <ReportModal
          loading={reporting}
          onConfirm={handleConfirm}
          onCancel={() => setShowReport(false)}
        />
      )}

      <div className={`flex gap-3 ${compact ? '' : 'p-4 bg-card-bg rounded-2xl border border-edge'}`}>
        <Avatar name={review.usuario} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-heading truncate">{review.usuario}</span>
            <span className="text-xs text-muted shrink-0">{date}</span>
          </div>
          <StarRating rating={review.rating} />
          {review.comment && (
            <p className={`text-sm text-body mt-1.5 ${compact ? 'line-clamp-2' : ''}`}>
              "{review.comment}"
            </p>
          )}

          {/* Acciones */}
          {onReport && !compact && (
            <div className="flex items-center pt-2">
              {isReported ? (
                <span className="flex items-center gap-1 text-xs text-muted ml-auto">
                  <Flag className="w-3 h-3" />Reportado
                </span>
              ) : (
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-1 text-xs text-muted hover:text-red-500 transition-colors ml-auto"
                >
                  <Flag className="w-3 h-3" />Reportar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
