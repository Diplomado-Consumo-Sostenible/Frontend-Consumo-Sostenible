import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function AccumulatedNegativesAlert({ alert, onDismiss, onReview }) {
  const [visible, setVisible] = useState(true);

  if (!alert || !visible) return null;

  const total = alert.totalNegatives ?? 0;
  const date  = new Date(alert.timestamp);
  const dateStr = date.toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit',
  });

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.(alert.id);
  };

  const handleReview = () => {
    setVisible(false);
    onDismiss?.(alert.id);
    onReview?.();
  };

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5 shadow-sm"
    >
      {/* Ícono */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-orange-800">
          Alerta: {total} reseñas negativas acumuladas
        </p>
        <p className="mt-0.5 text-xs text-orange-700">
          Tu negocio ha recibido <strong>{total} reseñas negativas</strong> en
          los últimos 30 días. Revisa el contenido y considera responder a tus
          clientes para mejorar tu calificación.
        </p>
        <p className="mt-1 text-[10px] text-orange-500/80">
          Detectado el {dateStr} · {timeStr}
        </p>

        {/* Acciones */}
        <div className="mt-2.5 flex items-center gap-3">
          <button
            onClick={handleReview}
            className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-orange-600 cursor-pointer"
          >
            Ver reseñas
            <ChevronRight className="h-3 w-3" />
          </button>
          <button
            onClick={handleDismiss}
            className="text-xs text-orange-600 underline underline-offset-2 hover:text-orange-800 transition-colors cursor-pointer"
          >
            Descartar
          </button>
        </div>
      </div>

      {/* Cerrar */}
      <button
        onClick={handleDismiss}
        aria-label="Cerrar alerta"
        className="shrink-0 rounded-lg p-1 text-orange-400 transition-colors hover:bg-orange-100 hover:text-orange-600 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
