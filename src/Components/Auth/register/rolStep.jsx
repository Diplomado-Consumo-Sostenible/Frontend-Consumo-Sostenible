import { Store, User } from "lucide-react";
import BackButton from "../../backButton";

export default function RoleStep({ onSelectRole }) {
  return (
    <div className="flex-1 bg-card-bg flex flex-col justify-center px-5 py-6 sm:px-10 sm:py-10 overflow-y-auto">
      <BackButton />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-heading text-2xl sm:text-4xl font-serif">
          ¿Cómo deseas registrarte?
        </h1>
        <p className="text-muted text-sm mt-1">
          Elige el tipo de cuenta que quieres crear
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => onSelectRole(2)}
          className="group border border-edge rounded-2xl p-5 flex items-center gap-4
            hover:border-primary-light hover:shadow-warm-sm transition-all bg-card-bg text-left"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-softest
            group-hover:bg-primary-softest/70 transition-colors shrink-0">
            <User className="w-6 h-6 text-primary-dark" />
          </div>
          <div>
            <h2 className="text-heading font-medium">Usuario</h2>
            <p className="text-sm text-muted">Explora y utiliza la plataforma</p>
          </div>
        </button>

        <button
          onClick={() => onSelectRole(3)}
          className="group border border-edge rounded-2xl p-5 flex items-center gap-4
            hover:border-primary-light hover:shadow-warm-sm transition-all bg-card-bg text-left"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-softest
            group-hover:bg-primary-softest/70 transition-colors shrink-0">
            <Store className="w-6 h-6 text-primary-dark" />
          </div>
          <div>
            <h2 className="text-heading font-medium">Negocio</h2>
            <p className="text-sm text-muted">Registra tu establecimiento</p>
          </div>
        </button>
      </div>
    </div>
  );
}
