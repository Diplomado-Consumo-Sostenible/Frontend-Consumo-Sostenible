import { Award, ExternalLink, ShieldCheck, ShieldX, Clock } from 'lucide-react';

const STATUS = {
  Active:   { label: 'Verificado',  cls: 'bg-ok-bg text-ok-text border-ok-text/30',     Icon: ShieldCheck },
  Pending:  { label: 'En revisión', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock       },
  Rejected: { label: 'Rechazado',   cls: 'bg-red-50 text-red-600 border-red-200',       Icon: ShieldX     },
};

export default function PublicCertRow({ cert }) {
  const s = STATUS[cert.status] ?? STATUS.Pending;

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-edge/40 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
          <Award className="w-4 h-4 text-primary-dark" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-heading truncate">{cert.name}</p>
          {cert.issuing_entity && (
            <p className="text-xs text-muted truncate">{cert.issuing_entity}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
          <s.Icon className="w-3 h-3" />
          {s.label}
        </span>
        {cert.verification_url && (
          <a
            href={cert.verification_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Verificar certificación"
            className="text-muted hover:text-primary-dark transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
