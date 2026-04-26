import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, AlertTriangle, ChevronUp, ChevronDown, Eye, EyeOff, Loader2, LayoutDashboard, ChevronRight } from 'lucide-react';
import { getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../../services/user/user.service';
import { useToastContext } from '../../context/ToastContext';
import API from '../../api/api';

const INITIAL_FORM = { nombre: '', email: '', password: '', rolId: '', id_genero: '' };

function PhotoPreviewModal({ src, alt, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none">
        <div className="relative max-w-xs w-full pointer-events-auto">
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4 text-stone-600" />
          </button>
          <img src={src} alt={alt} className="w-full rounded-2xl shadow-2xl object-cover aspect-square" />
        </div>
      </div>
    </>
  );
}

function Avatar({ perfil, email, onPreview }) {
  const initial = perfil?.nombre ? perfil.nombre.charAt(0).toUpperCase() : email?.charAt(0).toUpperCase() || '?';
  if (perfil?.foto_perfil) {
    return (
      <div className="relative group shrink-0 w-8 h-8">
        <img src={perfil.foto_perfil} alt={perfil.nombre || email} className="w-8 h-8 rounded-full object-cover" />
        <button
          onClick={() => onPreview(perfil.foto_perfil, perfil.nombre || email)}
          className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <Eye className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 shrink-0">
      {initial}
    </div>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-stone-400'}`} />
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-800">Eliminar usuario</h3>
            <p className="text-sm text-stone-500 mt-1">
              ¿Estás seguro de que deseas eliminar a <span className="font-medium text-stone-700">{user?.perfil?.nombre || user?.email}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-stone-600">{label}</label>
      {children}
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white';
const selectClass = 'w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white';

export default function AdminUsers() {
  const toast = useToastContext();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser_, setDeleteUser] = useState(null);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    Promise.all([API.get('/rol').then((r) => setRoles(Array.isArray(r.data) ? r.data : [])), API.get('/genero?limit=100').then((r) => setGeneros(Array.isArray(r.data?.data) ? r.data.data : []))]).catch(() => {});
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      return u.email?.toLowerCase().includes(q) || u.perfil?.nombre?.toLowerCase().includes(q) || u.rol?.nombre?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let aVal = sortField === 'nombre' ? a.perfil?.nombre || a.email : a[sortField];
      let bVal = sortField === 'nombre' ? b.perfil?.nombre || b.email : b[sortField];
      aVal = (aVal || '').toString().toLowerCase();
      bVal = (bVal || '').toString().toLowerCase();
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  const handleToggleStatus = async (user) => {
    setActionLoading(user.id_usuario);
    try {
      const res = await toggleUserStatus(user.id_usuario, !user.isActive);
      setUsers((prev) => prev.map((u) => (u.id_usuario === user.id_usuario ? { ...u, isActive: !u.isActive } : u)));
      toast.success(res?.message || 'Estado actualizado');
    } catch (err) {
      toast.error(err?.message || 'Error al cambiar estado');
    } finally {
      setActionLoading(null);
    }
  };

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setFormErrors({});
    setShowPassword(false);
    setShowCreateModal(true);
  };

  const openEdit = (user) => {
    setForm({ nombre: user.perfil?.nombre || '', email: user.email || '', password: '', rolId: user.rol?.id?.toString() || '', id_genero: '' });
    setFormErrors({});
    setShowPassword(false);
    setEditUser(user);
  };

  const validateForm = (isEdit) => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!form.email.trim()) errs.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Correo inválido';
    if (!isEdit && !form.password) errs.password = 'La contraseña es requerida';
    if (!isEdit && form.password && form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (!form.rolId) errs.rolId = 'El rol es requerido';
    if (!isEdit && !form.id_genero) errs.id_genero = 'El género es requerido';
    return errs;
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    const errs = validateForm(false);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormLoading(true);
    try {
      const res = await createUser({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rolId: parseInt(form.rolId),
        id_genero: parseInt(form.id_genero),
      });
      toast.success(res?.message || 'Usuario creado');
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      setFormErrors({ submit: err?.message || 'Error al crear el usuario' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const errs = validateForm(true);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormLoading(true);
    try {
      const payload = { nombre: form.nombre, email: form.email, rolId: parseInt(form.rolId) };
      if (form.password) payload.password = form.password;
      if (form.id_genero) payload.id_genero = parseInt(form.id_genero);
      const res = await updateUser(editUser.id_usuario, payload);
      toast.success(res?.message || 'Usuario actualizado');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setFormErrors({ submit: err?.message || 'Error al actualizar el usuario' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser_) return;
    setActionLoading('delete');
    try {
      const res = await deleteUser(deleteUser_.id_usuario);
      toast.success(res?.message || 'Usuario eliminado');
      setDeleteUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err?.message || 'Error al eliminar el usuario');
      setDeleteUser(null);
    } finally {
      setActionLoading(null);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
  };

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide';
  const thSortClass = `${thClass} cursor-pointer hover:text-stone-700 select-none`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Administrador</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-600 font-medium">Usuarios</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-stone-800">Gestión de Usuarios</h1>
              <p className="text-sm text-stone-400 mt-0.5">Administra los usuarios registrados en la plataforma</p>
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-sm shrink-0">
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Usuarios', value: stats.total, color: 'text-stone-700', bg: 'bg-white' },
          { label: 'Activos', value: stats.active, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Inactivos', value: stats.inactive, color: 'text-stone-500', bg: 'bg-stone-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl px-5 py-4 border border-stone-100`}>
            <p className="text-xs text-stone-400 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input type="text" placeholder="Buscar por nombre, correo o rol..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando usuarios...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3">
            <Users className="w-10 h-10 opacity-30" />
            <p className="text-sm">{search ? 'No se encontraron resultados' : 'No hay usuarios registrados'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-stone-100 bg-stone-50/50">
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thSortClass} onClick={() => handleSort('nombre')}>
                    <span className="flex items-center gap-1">
                      Usuario <SortIcon field="nombre" />
                    </span>
                  </th>
                  <th className={thSortClass} onClick={() => handleSort('email')}>
                    <span className="flex items-center gap-1">
                      Correo <SortIcon field="email" />
                    </span>
                  </th>
                  <th className={thClass}>Rol</th>
                  <th className={thClass}>Estado</th>
                  <th className={thClass}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((user, idx) => (
                  <tr key={user.id_usuario} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-stone-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3.5 overflow-visible">
                      <div className="flex items-center gap-3">
                        <Avatar perfil={user.perfil} email={user.email} onPreview={(src, alt) => setPreview({ src, alt })} />
                        <span className="text-sm font-medium text-stone-700">{user.perfil?.nombre || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-stone-500">{user.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">{user.rol?.nombre || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge isActive={user.isActive} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button title={user.isActive ? 'Desactivar' : 'Activar'} onClick={() => handleToggleStatus(user)} disabled={actionLoading === user.id_usuario} className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${user.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100'}`}>
                          {actionLoading === user.id_usuario ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : user.isActive ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        <button title="Editar" onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button title="Eliminar" onClick={() => setDeleteUser(user)} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-stone-50 text-xs text-stone-400">
            Mostrando {filtered.length} de {users.length} usuarios
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Nuevo Usuario" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            {formErrors.submit && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {formErrors.submit}
              </div>
            )}
            <FormField label="Nombre completo" error={formErrors.nombre}>
              <input type="text" placeholder="Juan Pérez" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Correo electrónico" error={formErrors.email}>
              <input type="email" placeholder="usuario@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Contraseña" error={formErrors.password}>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>
            <FormField label="Rol" error={formErrors.rolId}>
              <select value={form.rolId} onChange={(e) => setForm({ ...form, rolId: e.target.value })} className={selectClass}>
                <option value="">Seleccionar rol</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Género" error={formErrors.id_genero}>
              <select value={form.id_genero} onChange={(e) => setForm({ ...form, id_genero: e.target.value })} className={selectClass}>
                <option value="">Seleccionar género</option>
                {generos.map((g) => (
                  <option key={g.id_genero} value={g.id_genero}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Usuario
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal title={`Editar: ${editUser.perfil?.nombre || editUser.email}`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            {formErrors.submit && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {formErrors.submit}
              </div>
            )}
            <FormField label="Nombre completo" error={formErrors.nombre}>
              <input type="text" placeholder="Juan Pérez" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Correo electrónico" error={formErrors.email}>
              <input type="email" placeholder="usuario@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Nueva contraseña (opcional)" error={formErrors.password}>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Dejar vacío para no cambiar" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>
            <FormField label="Rol" error={formErrors.rolId}>
              <select value={form.rolId} onChange={(e) => setForm({ ...form, rolId: e.target.value })} className={selectClass}>
                <option value="">Seleccionar rol</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Cambiar género (opcional)">
              <select value={form.id_genero} onChange={(e) => setForm({ ...form, id_genero: e.target.value })} className={selectClass}>
                <option value="">Sin cambios</option>
                {generos.map((g) => (
                  <option key={g.id_genero} value={g.id_genero}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditUser(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar Cambios
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteUser_ && <ConfirmDialog user={deleteUser_} onConfirm={handleDelete} onCancel={() => setDeleteUser(null)} loading={actionLoading === 'delete'} />}

      {preview && <PhotoPreviewModal src={preview.src} alt={preview.alt} onClose={() => setPreview(null)} />}
    </div>
  );
}
