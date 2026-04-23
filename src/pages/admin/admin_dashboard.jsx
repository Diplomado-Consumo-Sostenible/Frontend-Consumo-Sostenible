import DashboardLayout from '../../layouts/DashboardLayout';
import { getSession } from '../../utils/storage';

export default function AdminDashboard() {
  const session = getSession();

  return (
    <DashboardLayout>
      <div className="flex flex-col justify-center items-center h-full gap-2">
        <h1 className="text-stone-800 text-3xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
          Panel de Administrador{session?.nombre ? ` — ${session.nombre}` : ''}
        </h1>
        <p className="text-stone-400 text-sm">Gestiona la configuración del sistema y supervisa la actividad.</p>
      </div>
    </DashboardLayout>
  );
}
