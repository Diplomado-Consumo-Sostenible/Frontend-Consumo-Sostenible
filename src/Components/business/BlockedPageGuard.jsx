import { Edit, Hourglass, Lock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlockedPageGuard({ status, rejectionReason }) {
  const isRejected = status === 'Rejected';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 text-center space-y-5">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
        isRejected ? 'bg-red-100' : 'bg-warn-bg border border-warn-text/20'
      }`}>
        {isRejected
          ? <XCircle className="w-8 h-8 text-red-500" />
          : <Hourglass className="w-8 h-8 text-warn-text" />
        }
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h2 className="text-base font-semibold text-heading">Acceso bloqueado</h2>
        <p className="text-sm text-muted leading-relaxed">
          {isRejected
            ? <>Esta sección no está disponible mientras tu negocio se encuentre <span className="font-semibold text-red-600">rechazado</span>.</>
            : <>Esta sección estará disponible una vez que tu negocio sea <span className="font-semibold text-warn-text">aprobado</span>.</>
          }
        </p>
      </div>

      {isRejected && rejectionReason && (
        <div className="w-full max-w-sm rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left space-y-1">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Motivo de rechazo</p>
          <p className="text-sm text-red-800 leading-relaxed">{rejectionReason}</p>
        </div>
      )}

      {!isRejected && (
        <div className="w-full max-w-sm rounded-xl border border-warn-text/20 bg-warn-bg px-4 py-3 text-left">
          <p className="text-xs text-warn-text leading-relaxed">
            Tu negocio está siendo revisado. Mientras tanto puedes editar y completar su información.
          </p>
        </div>
      )}

      <Link
        to="/dashboardBusiness/perfil"
        className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl transition-colors ${
          isRejected ? 'bg-red-600 hover:bg-red-700' : 'bg-warn-text hover:opacity-90'
        }`}
      >
        {isRejected ? <><Edit className="w-4 h-4" /> Editar negocio</> : <><Lock className="w-4 h-4" /> Completar información</>}
      </Link>
    </div>
  );
}
