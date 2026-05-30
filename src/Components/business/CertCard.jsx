/* eslint-disable react-refresh/only-export-components */
import { Award, Download, ExternalLink, FileText, Pencil, Trash2 } from 'lucide-react';

export const STATUS_MAP = {
  Active:   { label: 'Aprobada',    cls: 'bg-ok-bg text-ok-text border-ok-text/30' },
  Pending:  { label: 'En revisión', cls: 'bg-warn-bg text-warn-text border-warn-text/30' },
  Rejected: { label: 'Rechazada',   cls: 'bg-red-50 text-red-700 border-red-200' },
};

async function downloadFile(url, filename) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || 'documento.pdf';
  a.click();
  URL.revokeObjectURL(blobUrl);
}

export default function CertCard({ cert, onDelete, onEdit }) {
  const status = STATUS_MAP[cert.status] ?? STATUS_MAP.Pending;

  return (
    <div className="bg-card-bg rounded-2xl border border-edge shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Documento */}
      <div className="h-28 bg-primary-softest flex flex-col items-center justify-center gap-2 border-b border-edge/40 px-4">
        <div className="w-10 h-10 rounded-xl bg-card-bg border border-edge flex items-center justify-center shrink-0">
          {cert.badge_url ? <FileText className="w-5 h-5 text-primary-mid" /> : <Award className="w-5 h-5 text-primary-mid/40" />}
        </div>
        {cert.badge_url && (
          <div className="flex items-center gap-2">
            <a
              href={cert.badge_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary-mid hover:text-primary-dark transition-colors"
            >
              <ExternalLink className="w-3 h-3" />Ver
            </a>
            <span className="text-edge">·</span>
            <button
              onClick={() => downloadFile(cert.badge_url, `${cert.name}.pdf`)}
              className="flex items-center gap-1 text-xs text-primary-mid hover:text-primary-dark transition-colors"
            >
              <Download className="w-3 h-3" />Descargar
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-body text-sm leading-tight">{cert.name}</h3>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
            {status.label}
          </span>
        </div>

        <p className="text-xs text-muted">{cert.issuing_entity}</p>

        <div className="flex items-center justify-between mt-auto pt-2">
          {cert.verification_url ? (
            <a
              href={cert.verification_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary-mid hover:text-primary-dark transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Verificar
            </a>
          ) : (
            <span className="text-xs text-muted/40">Sin URL</span>
          )}
          <div className="flex items-center gap-2">
            {onEdit && cert.status === 'Rejected' && (
              <button
                onClick={() => onEdit(cert)}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(cert)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
