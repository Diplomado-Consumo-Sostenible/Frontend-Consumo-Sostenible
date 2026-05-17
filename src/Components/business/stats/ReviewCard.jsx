import { Flag, Star } from 'lucide-react';
import { useState } from 'react';
import ReportModal from '../../reviews/ReportModal';

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
