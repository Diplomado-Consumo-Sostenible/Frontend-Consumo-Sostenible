import { Award, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STATUS_MAP } from '../CertCard';

function CompactCertRow({ cert }) {
  const status = STATUS_MAP[cert.status] ?? STATUS_MAP.Pending;

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-edge/40 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-body truncate">{cert.name}</p>
        <p className="text-xs text-muted truncate">{cert.issuing_entity}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
          {status.label}
        </span>
        <a
          href={cert.verification_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Verificar certificación"
          className="text-muted hover:text-primary-mid transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export default function BusinessCertificationsCard({ certifications }) {
  const isEmpty = !certifications?.length;

  return (
    <div className="bg-card-bg border border-edge rounded-2xl p-6 space-y-4">
      <h2 className="text-base font-semibold text-heading">Certificaciones</h2>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-softest border border-edge flex items-center justify-center">
            <Award className="w-6 h-6 text-muted" />
          </div>
          <p className="text-sm text-muted">No hay certificaciones registradas aún.</p>
          <Link
            to="/dashboardBusiness/certificaciones"
            className="text-sm font-medium text-primary-mid hover:text-primary-dark transition-colors"
          >
            Subir documentos
          </Link>
        </div>
      ) : (
        <div>
          {certifications.slice(0, 3).map((cert) => (
            <CompactCertRow key={cert.id_certification} cert={cert} />
          ))}
          {certifications.length > 3 && (
            <Link
              to="/dashboardBusiness/certificaciones"
              className="block text-center text-sm font-medium text-primary-mid hover:text-primary-dark transition-colors pt-3"
            >
              Ver todas ({certifications.length})
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
