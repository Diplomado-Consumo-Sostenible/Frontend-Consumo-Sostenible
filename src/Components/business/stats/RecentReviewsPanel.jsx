import { useEffect, useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { getBusinessReviews } from '../../../services/stats/stats.service';

export default function RecentReviewsPanel({ businessId, total }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    getBusinessReviews(businessId, { page: 1, limit: 4 })
      .then(res => setReviews(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  return (
    <div className="bg-card-bg rounded-2xl border border-edge p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-dark" />
          <h3 className="text-sm font-semibold text-heading">Reseñas Recientes</h3>
        </div>
        {total != null && total > 0 && (
          <span className="text-xs bg-primary-softest text-primary-dark font-semibold px-2.5 py-0.5 rounded-full">
            {total} total
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-5">
          <Loader2 className="w-4 h-4 animate-spin text-primary-mid" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted text-center py-5">Sin reseñas aún</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <div key={review.id_review} className={idx > 0 ? 'pt-4 border-t border-edge' : ''}>
              <ReviewCard review={review} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
