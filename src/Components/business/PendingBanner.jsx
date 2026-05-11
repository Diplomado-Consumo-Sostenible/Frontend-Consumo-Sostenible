import { CheckCircle2, Clock, Edit, Hourglass } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  { label: 'Negocio enviado',    done: true  },
  { label: 'En revisión',        done: true  },
  { label: 'Aprobación',         done: false },
];

export default function PendingBanner() {
  return (
    <div className="rounded-2xl border border-warn-text/25 bg-warn-bg p-5 sm:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-warn-text/15 flex items-center justify-center shrink-0">
          <Hourglass className="w-5 h-5 text-warn-text" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-warn-text">Negocio en revisión</h2>
          <p className="text-xs text-warn-text/80 mt-0.5 leading-relaxed">
            Tu negocio está siendo revisado por nuestro equipo. Te notificaremos cuando esté aprobado.
            Mientras tanto, puedes completar o editar la información.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                step.done
                  ? 'bg-warn-text border-warn-text'
                  : 'bg-white border-warn-text/30'
              }`}>
                {step.done
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  : <Clock className="w-3.5 h-3.5 text-warn-text/40" />
                }
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${step.done ? 'text-warn-text' : 'text-warn-text/40'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full ${step.done ? 'bg-warn-text/40' : 'bg-warn-text/15'}`} />
            )}
          </div>
        ))}
      </div>

      <Link
        to="/dashboardBusiness/perfil"
        className="inline-flex items-center gap-2 px-4 py-2 bg-warn-text hover:opacity-90 text-white text-xs font-medium rounded-xl transition-opacity"
      >
        <Edit className="w-3.5 h-3.5" />
        Completar información
      </Link>
    </div>
  );
}
