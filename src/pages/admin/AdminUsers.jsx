import { useState, useEffect, useCallback } from 'react';
import ModalOverlay from '../../Components/ui/ModalOverlay';
import { Users, Plus, Search, Edit2, Trash2, X, AlertTriangle, Eye, EyeOff, Loader2, LayoutDashboard, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, ShieldCheck, Store, User as UserIcon } from 'lucide-react';
import { getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../../services/user/user.service';
import { useToastContext } from '../../context/ToastContext';
import API from '../../api/api';

const ROLE_TABS = [
  { value: '',      label: 'Todos',    Icon: Users },
  { value: 'ADMIN', label: 'Admins',   Icon: ShieldCheck },
  { value: 'owner', label: 'Dueños',   Icon: Store },
  { value: 'USER',  label: 'Usuarios', Icon: UserIcon },
];

const SORT_OPTIONS = [
  { value: 'createdAt_DESC', label: 'Más recientes' },
  { value: 'createdAt_ASC',  label: 'Más antiguos' },
  { value: 'email_ASC',      label: 'Email A → Z' },
  { value: 'email_DESC',     label: 'Email Z → A' },
];

const INITIAL_FORM = { nombre: '', email: '', password: '', rolId: '', id_genero: '' };

function PhotoPreviewModal({ src, alt, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none">
        <div className="relative max-w-xs w-full pointer-events-auto">
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-card-bg rounded-full shadow-warm flex items-center justify-center hover:bg-app-bg transition-colors"
          >
            <X className="w-4 h-4 text-body" />
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
    <div className="w-8 h-8 rounded-full bg-primary-softest flex items-center justify-center text-xs font-semibold text-primary-dark shrink-0">
      {initial}
    </div>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-primary-softest text-primary-dark' : 'bg-app-bg text-muted'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary-mid' : 'bg-edge'}`} />
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="relative bg-card-bg rounded-2xl shadow-warm w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
          <h2 className="text-base font-semibold text-heading">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-body hover:bg-app-bg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </ModalOverlay>
  );
}

function ConfirmDialog({ user, onConfirm, onCancel, loading }) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="relative bg-card-bg rounded-2xl shadow-warm w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-heading">Eliminar usuario</h3>
            <p className="text-sm text-muted mt-1">
              ¿Estás seguro de que deseas eliminar a <span className="font-medium text-body">{user?.perfil?.nombre || user?.email}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-body">{label}</label>
      {children}
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg';
const selectClass = 'w-full px-3.5 py-2.5 rounded-xl border border-edge text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg';

export default function AdminUsers() {
  const toast = useToastContext();

  const [users, setUsers]           = useState([]);
  const [meta, setMeta]             = useState({ totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 15 });
  const [roles, setRoles]           = useState([]);
  const [generos, setGeneros]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sort, setSort]             = useState('createdAt_DESC');
  const [page, setPage]             = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser]     = useState(null);
  const [deleteUser_, setDeleteUser] = useState(null);
  const [preview, setPreview]       = useState(null);

  const [form, setForm]             = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = useCallback(async (p = 1, rol = roleFilter, sortVal = sort) => {
    try {
      setLoading(true);
      const [sortBy, order] = sortVal.split('_');
      const data = await getAllUsers({ page: p, limit: 15, rol: rol || undefined, sortBy, order });
      setUsers(Array.isArray(data?.data) ? data.data : []);
      if (data?.meta) setMeta(data.meta);
    } catch (err) {
      toast.error(err?.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, sort]);

  useEffect(() => {
    fetchUsers(1, roleFilter, sort);
    Promise.all([
      API.get('/rol').then((r) => setRoles(Array.isArray(r.data) ? r.data : [])),
      API.get('/genero?limit=100').then((r) => setGeneros(Array.isArray(r.data?.data) ? r.data.data : [])),
    ]).catch(() => {});
  }, [roleFilter, sort]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchUsers(p, roleFilter, sort);
  };

  // Búsqueda cliente sobre la página actual
  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.perfil?.nombre?.toLowerCase().includes(q) ||
      u.rol?.nombre?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total:    meta.totalItems,
    active:   meta.totalActive   ?? 0,
    inactive: meta.totalInactive ?? 0,
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

  const handleRoleFilter = (rol) => {
    setRoleFilter(rol);
    setPage(1);
  };

  const handleSort = (val) => {
    setSort(val);
    setPage(1);
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
      fetchUsers(1, roleFilter, sort);
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
      fetchUsers(page, roleFilter, sort);
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
      // Retroceder página si se eliminó el último elemento de ella
      const newPage = filtered.length === 1 && page > 1 ? page - 1 : page;
      setPage(newPage);
      fetchUsers(newPage, roleFilter, sort);
    } catch (err) {
      toast.error(err?.message || 'Error al eliminar el usuario');
      setDeleteUser(null);
    } finally {
      setActionLoading(null);
    }
  };

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Administrador</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-body font-medium">Usuarios</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-heading">Gestión de Usuarios</h1>
              <p className="text-sm text-muted mt-0.5">Administra los usuarios registrados en la plataforma</p>
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-dark text-on-dark-active text-sm font-medium rounded-xl hover:bg-primary-darkest transition-colors shadow-warm-sm shrink-0">
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total usuarios', value: stats.total,    color: 'text-heading',      bg: 'bg-card-bg' },
          { label: 'Activos',        value: stats.active,   color: 'text-primary-dark', bg: 'bg-primary-softest' },
          { label: 'Inactivos',      value: stats.inactive, color: 'text-muted',        bg: 'bg-app-bg' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl px-5 py-4 border border-edge`}>
            <p className="text-xs text-muted font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs de rol + sort */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-app-bg p-1 rounded-xl border border-edge">
          {ROLE_TABS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => handleRoleFilter(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                roleFilter === value
                  ? 'bg-card-bg text-primary-dark shadow-warm-sm border border-edge'
                  : 'text-muted hover:text-body'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Ordenamiento */}
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-edge text-xs text-body focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Búsqueda (cliente, sobre la página actual) */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Buscar en esta página por nombre, correo o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg"
        />
      </div>

      {/* Table */}
      <div className="bg-card-bg rounded-2xl border border-edge overflow-hidden shadow-warm-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando usuarios...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
            <Users className="w-10 h-10 opacity-30" />
            <p className="text-sm">{search ? 'No se encontraron resultados' : 'No hay usuarios registrados'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-edge bg-app-bg/50">
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>Usuario</th>
                  <th className={thClass}>Correo</th>
                  <th className={thClass}>Rol</th>
                  <th className={thClass}>Estado</th>
                  <th className={thClass}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/40">
                {filtered.map((user, idx) => (
                  <tr key={user.id_usuario} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-muted font-mono">{idx + 1}</td>
                    <td className="px-4 py-3.5 overflow-visible">
                      <div className="flex items-center gap-3">
                        <Avatar perfil={user.perfil} email={user.email} onPreview={(src, alt) => setPreview({ src, alt })} />
                        <span className="text-sm font-medium text-body">{user.perfil?.nombre || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted">{user.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-body bg-app-bg px-2.5 py-1 rounded-full border border-edge">{user.rol?.nombre || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge isActive={user.isActive} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button title={user.isActive ? 'Desactivar' : 'Activar'} onClick={() => handleToggleStatus(user)} disabled={actionLoading === user.id_usuario} className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${user.isActive ? 'text-primary-mid hover:bg-primary-softest/50' : 'text-muted hover:bg-app-bg'}`}>
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
                        <button title="Editar" onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-muted hover:text-primary-dark hover:bg-primary-softest/50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button title="Eliminar" onClick={() => setDeleteUser(user)} className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
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
        {/* Paginador */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-edge">
            <span className="text-xs text-muted">
              <span className="font-semibold text-body">{meta.totalItems}</span> usuario{meta.totalItems !== 1 ? 's' : ''} en total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                aria-label="Página anterior"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted px-1">
                Página <span className="font-semibold text-body">{meta.currentPage}</span> de{' '}
                <span className="font-semibold text-body">{meta.totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= meta.totalPages}
                aria-label="Página siguiente"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
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
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body">
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
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-dark text-sm font-medium text-on-dark-active hover:bg-primary-darkest transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
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
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body">
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
              <button type="button" onClick={() => setEditUser(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-dark text-sm font-medium text-on-dark-active hover:bg-primary-darkest transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
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
