import DashboardLayout from '../layouts/DashboardLayout';
import { getSession } from '../utils/storage';

export default function Dashboard() {
  const session = getSession();

  return (
    <DashboardLayout>
      <div className="flex flex-col justify-center items-center h-full gap-2">
        <h1 className="text-stone-800 text-3xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
          Bienvenido{session?.nombre ? `, ${session.nombre}` : ''}
        </h1>
        <p className="text-stone-400 text-sm">Aquí podrás gestionar tu cuenta y acceder a tus datos.</p>
      </div>
    </DashboardLayout>
  );
}
