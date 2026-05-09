import { Star } from 'lucide-react';

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
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const colorClass = AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${colorClass}`}>
      {initials}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 mt-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-100 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewCard({ review, compact = false }) {
  const date = review.fecha
    ? new Date(review.fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
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
      </div>
    </div>
  );
}
