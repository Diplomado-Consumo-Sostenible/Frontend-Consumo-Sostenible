import { Edit, Lock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BLOCKED_FEATURES = ['Estadísticas', 'Certificaciones', 'Productos', 'Galería'];

export default function RejectionBanner({ rejectionReason }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-red-800">Negocio rechazado</h2>
          <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
            Tu negocio no fue aprobado. Revisa el motivo indicado a continuación, actualiza la información y vuelve a enviarlo para revisión.
          </p>
        </div>
      </div>

      {rejectionReason && (
        <div className="rounded-xl border border-red-200 bg-white px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Motivo de rechazo</p>
          <p className="text-sm text-red-800 leading-relaxed">{rejectionReason}</p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-red-700">Funcionalidades bloqueadas temporalmente:</p>
        <div className="flex flex-wrap gap-2">
          {BLOCKED_FEATURES.map((f) => (
            <span
              key={f}
              className="flex items-center gap-1.5 text-xs text-red-600 bg-red-100 border border-red-200 rounded-full px-2.5 py-1"
            >
              <Lock className="w-3 h-3 shrink-0" />
              {f}
            </span>
          ))}
        </div>
      </div>

      <Link
        to="/dashboardBusiness/perfil"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        <Edit className="w-4 h-4" />
        Editar negocio
      </Link>
    </div>
  );
}
