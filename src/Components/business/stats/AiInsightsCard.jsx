import { useEffect, useState } from 'react';
import { Brain, Loader2, RefreshCw } from 'lucide-react';
import {
  getSavedGeneralSummary,
  regenerateGeneralSummary,
} from '../../../services/summary/summary.service';

export default function AiInsightsCard({ businessId }) {
  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    setLoading(true);
    getSavedGeneralSummary(businessId)
      .then((res) => { if (!cancelled) setSummary(res); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [businessId]);

  const handleRegenerate = async () => {
    if (!businessId || regenerating) return;
    setRegenerating(true);
    try {
      const res = await regenerateGeneralSummary(businessId);
      setSummary((prev) => ({
        ...prev,
        generalReview: res.generalReview,
        updatedAt: res.updatedAt,
        hasAiSummary: true,
      }));
    } catch { /* no-op */ } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="bg-primary-dark rounded-2xl p-5 text-on-dark-active">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-on-dark" />
          <h3 className="text-sm font-semibold">Reseña IA del negocio</h3>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating || loading}
          aria-label="Actualizar reseña IA"
          className="p-1.5 rounded-lg hover:bg-primary-mid/20 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-on-dark ${regenerating ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
      <p className="text-xs text-on-dark mb-4">
        Resumen consolidado de todas las reseñas
      </p>

      {/* Cuerpo */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-on-dark/60" />
        </div>
      ) : summary?.hasAiSummary ? (
        <div className="bg-primary-darkest rounded-xl p-3 mb-4">
          <p className="text-xs text-on-dark leading-relaxed line-clamp-6">
            {summary.generalReview}
          </p>
          {summary.updatedAt && (
            <p className="text-[10px] text-on-dark/50 mt-2">
              Actualizado: {new Date(summary.updatedAt).toLocaleDateString('es-CO')}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-primary-darkest rounded-xl p-3 mb-4">
          <p className="text-xs text-on-dark/60 text-center py-2">
            Sin resumen IA aún. Un admin puede generarlo.
          </p>
        </div>
      )}

      {/* Botón generar / actualizar */}
      <button
        onClick={handleRegenerate}
        disabled={regenerating || loading}
        className="w-full bg-card-bg text-primary-dark font-semibold text-sm py-2.5 rounded-xl hover:bg-primary-softest transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
      >
        {regenerating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generando…
          </span>
        ) : summary?.hasAiSummary ? (
          'Actualizar reseña IA'
        ) : (
          'Generar reseña IA'
        )}
      </button>
    </div>
  );
}
