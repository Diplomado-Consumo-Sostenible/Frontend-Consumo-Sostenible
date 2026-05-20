import { createPortal } from 'react-dom';
import { Minus, TrendingDown, TrendingUp, X } from 'lucide-react';

const TREND_MAP = {
  improving: { Icon: TrendingUp,   color: 'text-ok-text',  label: 'Mejorando'   },
  declining: { Icon: TrendingDown, color: 'text-red-500',  label: 'Empeorando'  },
  stable:    { Icon: Minus,        color: 'text-muted',    label: 'Estable'     },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'long' });
}

export default function WeeklySummaryModal({ summary, onClose }) {
  if (!summary) return null;

  const { businessName, weekStart, weekEnd, stats, aiSummary } = summary;

  const pctPos = stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0;
  const pctNeu = stats.total > 0 ? Math.round((stats.neutral  / stats.total) * 100) : 0;
  const pctNeg = stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0;

  const trend  = TREND_MAP[stats.trend] ?? TREND_MAP.stable;

  // Convierte **texto** en <strong>texto</strong> para el insight de Gemini
  const formattedSummary = aiSummary
    ? aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
    : '';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-card-bg rounded-2xl shadow-2xl border border-edge w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between p-5 border-b border-edge">
          <div>
            <p className="text-[11px] font-semibold text-primary-dark uppercase tracking-wider">
              Reporte semanal IA
            </p>
            <h2 className="text-base font-semibold text-heading mt-0.5">{businessName}</h2>
            <p className="text-xs text-muted mt-0.5">
              {formatDate(weekStart)} – {formatDate(weekEnd)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar reporte semanal"
            className="w-8 h-8 rounded-xl border border-edge flex items-center justify-center text-muted hover:text-body transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Grid pos / neu / neg */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary-softest rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary-dark">{stats.positive}</p>
              <p className="text-xs text-muted mt-1">Positivas</p>
              <p className="text-xs font-semibold text-primary-dark">{pctPos}%</p>
            </div>
            <div className="bg-edge/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-heading">{stats.neutral}</p>
              <p className="text-xs text-muted mt-1">Neutrales</p>
              <p className="text-xs font-semibold text-muted">{pctNeu}%</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
              <p className="text-xs text-muted mt-1">Negativas</p>
              <p className="text-xs font-semibold text-red-500">{pctNeg}%</p>
            </div>
          </div>

          {/* Resumen: total · promedio · tendencia */}
          <div className="flex gap-3">
            <div className="flex-1 bg-edge/20 rounded-xl p-3">
              <p className="text-xs text-muted">Total esta semana</p>
              <p className="text-lg font-bold text-heading">{stats.total}</p>
            </div>
            <div className="flex-1 bg-edge/20 rounded-xl p-3">
              <p className="text-xs text-muted">Promedio</p>
              <p className="text-lg font-bold text-heading">
                {Number(stats.averageRating).toFixed(1)} ★
              </p>
            </div>
            <div className="flex-1 bg-edge/20 rounded-xl p-3">
              <p className="text-xs text-muted">Tendencia</p>
              <p className={`text-sm font-bold flex items-center gap-1 ${trend.color}`}>
                <trend.Icon className="w-3.5 h-3.5" />
                {trend.label}
              </p>
            </div>
          </div>

          {/* Insight de Gemini */}
          {aiSummary && (
            <div className="bg-primary-softest/50 border-l-4 border-primary-dark rounded-r-xl p-4">
              <p className="text-[11px] font-semibold text-primary-dark uppercase tracking-wider mb-2">
                Análisis generado por IA
              </p>
              <div
                className="text-sm text-body leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formattedSummary }}
              />
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary-dark text-on-dark-active font-semibold text-sm hover:bg-primary-darkest transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
