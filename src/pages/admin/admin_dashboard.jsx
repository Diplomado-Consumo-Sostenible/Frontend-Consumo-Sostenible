export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1
        className="text-2xl font-semibold text-stone-800"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Bienvenido al Panel de Administrador
      </h1>
      <p className="text-stone-400 text-sm mt-1.5">
        Desde aquí puedes supervisar la actividad del sistema y gestionar los usuarios de la plataforma.
      </p>
    </div>
  );
}
