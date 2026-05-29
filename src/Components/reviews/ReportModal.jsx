import { Flag, Loader2, X } from 'lucide-react';
import { useState } from 'react';

export const REPORT_REASONS = [
  'Lenguaje inapropiado u ofensivo',
  'Contenido falso o engañoso',
  'Spam o publicidad no solicitada',
  'Acoso o amenazas',
  'Información personal expuesta',
  'Otro motivo',
];

export default function ReportModal({ onConfirm, onCancel, loading }) {
  const [selected, setSelected] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card-bg rounded-2xl border border-edge shadow-warm w-full max-w-sm p-5 space-y-4">

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            Reportar reseña
          </h3>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-muted hover:text-body transition-colors"
          >
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
