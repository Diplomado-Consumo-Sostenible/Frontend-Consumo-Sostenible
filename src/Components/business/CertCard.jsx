import { Award, ExternalLink, Trash2 } from 'lucide-react';

export const STATUS_MAP = {
  Active:   { label: 'Aprobada',    cls: 'bg-ok-bg text-ok-text border-ok-text/30' },
  Pending:  { label: 'En revisión', cls: 'bg-warn-bg text-warn-text border-warn-text/30' },
  Rejected: { label: 'Rechazada',   cls: 'bg-red-50 text-red-700 border-red-200' },
};

export default function CertCard({ cert, onDelete }) {
  const status = STATUS_MAP[cert.status] ?? STATUS_MAP.Pending;

  return (
    <div className="bg-card-bg rounded-2xl border border-edge shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-36 bg-primary-softest flex items-center justify-center overflow-hidden">
        {cert.badge_url ? (
          <img
            src={cert.badge_url}
            alt={cert.name}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ display: cert.badge_url ? 'none' : 'flex' }}
        >
          <Award className="w-10 h-10 text-primary-mid/40" />
        </div>
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
          <a
            href={cert.verification_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary-mid hover:text-primary-dark transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Verificar
          </a>
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
  );
}
