import { useEffect, useState } from "react";
import { getUsers, toggleUserStatus } from "../services/auth/auth.service";
import Button from "./button";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      setUsers(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("fetchUsers error:", err);
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoading(userId);
      await toggleUserStatus(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          const currentId = user.id ?? user._id;
          if (currentId !== userId) return user;
          return { ...user, activo: !user.activo };
        })
      );
    } catch (err) {
      console.error("handleToggleStatus error:", err);
      setError(err.message || "Error al cambiar el estado del usuario");
    } finally {
      setActionLoading(null);
    }
  };

  const renderUserRow = (user) => {
    const currentId = user.id ?? user._id;
    const roleClasses =
      user.rol === "admin"
        ? "bg-purple-100 text-purple-800"
        : "bg-blue-100 text-blue-800";
    const statusClasses =
      user.activo
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";
    const buttonClasses =
      user.activo
        ? "bg-red-600 hover:bg-red-700"
        : "bg-green-600 hover:bg-green-700";
    const statusLabel = user.activo ? "Desactivar" : "Activar";

    return (
      <tr key={currentId} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {user.nombre}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.email}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleClasses}`}>
            {user.rol}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
            {user.activo ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <Button
            onClick={() => handleToggleStatus(currentId)}
            disabled={actionLoading === currentId}
            className={`${buttonClasses} text-white px-3 py-1 text-xs`}
          >
            {actionLoading === currentId ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              statusLabel
            )}
          </Button>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <Button
          onClick={fetchUsers}
          className="mt-2 bg-red-600 hover:bg-red-700"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Gestión de Usuarios
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Administra los usuarios registrados en el sistema
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(renderUserRow)}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          No hay usuarios registrados
        </div>
      )}
    </div>
  );
}