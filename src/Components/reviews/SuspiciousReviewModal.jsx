import { AlertTriangle, Edit3, Star, X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Modal bloqueante que se muestra cuando la IA detecta incongruencia
 * entre la calificación en estrellas y el tono del comentario.
 * Solo se cierra mediante el botón de acción o la X.
 */
export default function SuspiciousReviewModal({ aiStars, onDismiss }) {
  // Cierra con Escape — no impide al usuario corregir, solo cierra el aviso
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card-bg rounded-2xl border border-edge shadow-warm w-full max-w-sm p-5 space-y-4">

        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Reseña no publicada
          </h3>
          <button
            onClick={onDismiss}
            aria-label="Cerrar aviso"
            className="text-muted hover:text-body transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="space-y-3">
          <p className="text-sm text-body leading-relaxed">
            Nuestra IA detectó una incongruencia entre la calificación que diste y el tono
            de tu comentario. La reseña no puede publicarse en este estado.
          </p>

          {aiStars != null && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  Calificación esperada según tu comentario
                </p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= aiStars
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-white text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-amber-700 ml-1.5">
                    aprox. {aiStars} estrella{aiStars !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-muted leading-relaxed">
            Asegúrate de que las estrellas que seleccionas coincidan con lo que describes.
            Por ejemplo, si tu comentario es positivo, la calificación debería ser alta.
          </p>
        </div>

        {/* Acción */}
        <button
          onClick={onDismiss}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-dark text-on-dark-active text-sm font-semibold hover:bg-primary-darkest transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Corregir mi reseña
        </button>

      </div>
    </div>
  );
}
