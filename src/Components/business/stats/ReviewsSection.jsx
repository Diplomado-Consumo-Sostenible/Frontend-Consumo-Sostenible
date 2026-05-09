import { MessageSquare, Loader2 } from 'lucide-react';
import ReviewCard from './ReviewCard';
import useBusinessReviews from '../../../hooks/useBusinessReviews';

const FILTER_OPTIONS = [
  { label: 'Todas', value: null },
  { label: '5 ★', value: 5 },
  { label: '4 ★', value: 4 },
  { label: '3 ★', value: 3 },
  { label: '2 ★', value: 2 },
  { label: '1 ★', value: 1 },
];

export default function ReviewsSection({ businessId }) {
  const { reviews, meta, filter, setFilter, loadMore, hasMore, loading, error } =
    useBusinessReviews(businessId);

  return (
    <section className="bg-card-bg rounded-2xl border border-edge p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-softest flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary-dark" />
          </div>
          <h2 className="text-base font-semibold text-heading">Reseñas del negocio</h2>
          {meta?.totalItems > 0 && (
            <span className="text-sm text-muted">({meta.totalItems} total)</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={String(opt.value)}
            onClick={() => setFilter(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filter === opt.value
                ? 'bg-primary-dark text-on-dark-active'
                : 'bg-primary-softest text-primary-dark hover:bg-primary-light'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center py-6">{error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted gap-2">
          <MessageSquare className="w-10 h-10 opacity-30" />
          <p className="text-sm">Sin reseñas para este filtro</p>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map(review => (
            <ReviewCard key={review.id_review} review={review} />
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary-mid" />
        </div>
      )}

      {hasMore && !loading && (
        <button
          onClick={loadMore}
          className="w-full mt-4 py-2.5 rounded-xl border border-edge text-sm text-body hover:bg-primary-softest transition-colors cursor-pointer"
        >
          Cargar más reseñas
        </button>
      )}
    </section>
  );
}
