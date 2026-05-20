import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getSavedGeneralSummary } from '../../services/summary/summary.service';

export default function AiReviewSummary({ businessId }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    setLoading(true);
    getSavedGeneralSummary(businessId)
      .then((res) => {
        if (!cancelled && res?.hasAiSummary) setData(res);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [businessId]);

  if (loading || !data) return null;

  return (
    <div
      className="rounded-2xl p-6 border border-primary-softest"
      style={{
        background:
          'linear-gradient(135deg, rgba(200,219,191,0.22) 0%, var(--color-app-bg) 100%)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary-softest flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary-dark" />
        </div>
        <div>
          <p className="text-sm font-semibold text-heading">Opinión consolidada IA</p>
          <p className="text-xs text-muted">
            Basada en {data.totalReviews ?? 0} reseñas
            {data.averageRating ? ` — ${Number(data.averageRating).toFixed(1)} ★ promedio` : ''}
          </p>
        </div>
      </div>
      <p className="text-sm text-body leading-relaxed">{data.generalReview}</p>
      {data.updatedAt && (
        <p className="text-xs text-muted mt-3">
          Actualizado: {new Date(data.updatedAt).toLocaleDateString('es-CO')}
        </p>
      )}
    </div>
  );
}
