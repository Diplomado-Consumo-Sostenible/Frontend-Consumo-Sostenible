import { ChevronDown, ChevronUp, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../layouts/DashboardLayout';
import { createUser, deleteUser, getUsers, toggleUserStatus, updateUser } from '../../services/user.service';
import { getGeneros } from '../../services/genero.service';

const EMPTY_FORM = { email: '', password: '', nombre: '', id_genero: '' };

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('ASC');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(new Set());
  const [generos, setGeneros] = useState([]);

  const searchTimer = useRef(null);

  const fetchUsers = useCallback(
    async (p = page, s = search, o = order) => {
      setLoading(true);
      try {
        const res = await getUsers({ page: p, limit: 10, search: s, order: o });
        setUsers(res.data);
        setMeta(res.meta);
      } catch {
        toast.error('No se pudo cargar la lista de usuarios.');
      } finally {
        setLoading(false);
      }
    },
    [page, search, order],
  );

  useEffect(() => {
    fetchUsers(page, search, order);
  }, [page, order]);

  useEffect(() => {
    getGeneros().then(setGeneros);
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, val, order);
    }, 400);
  };

  const toggleOrder = () => {
    const next = order === 'ASC' ? 'DESC' : 'ASC';
    setOrder(next);
    setPage(1);
    fetchUsers(1, search, next);
  };

  const handleToggle = async (u) => {
    setToggling((prev) => new Set(prev).add(u.id_usuario));
    try {
      const result = await toggleUserStatus(u.id_usuario);
      setUsers((prev) => prev.map((x) => (x.id_usuario === u.id_usuario ? { ...x, isActive: result.isActive } : x)));
      toast.success(`Usuario ${result.isActive ? 'activado' : 'desactivado'} correctamente.`);
    } catch {
      toast.error('No se pudo cambiar el estado del usuario.');
    } finally {
      setToggling((prev) => {
        const s = new Set(prev);
        s.delete(u.id_usuario);
        return s;
      });
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal('create');
  };
  const openEdit = (u) => {
    setSelected(u);
    setForm({ email: u.email, password: '', nombre: u.perfil?.nombre ?? '', id_genero: u.perfil?.genero?.id_genero ?? '' });
    setFormError('');
    setModal('edit');
  };
  const openDelete = (u) => {
    setSelected(u);
    setModal('delete');
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (modal === 'create') {
        const payload = { ...form };
        if (!payload.id_genero) delete payload.id_genero;
        else payload.id_genero = Number(payload.id_genero);
        await createUser(payload);
        toast.success('Usuario creado correctamente.');
      } else {
        const payload = { email: form.email, nombre: form.nombre };
        if (form.password) payload.password = form.password;
        if (form.id_genero) payload.id_genero = Number(form.id_genero);
        await updateUser(selected.id_usuario, payload);
        toast.success('Usuario actualizado correctamente.');
      }
      closeModal();
      fetchUsers(page, search, order);
    } catch (e) {
      setFormError(e?.response?.data?.message ?? 'Ocurrió un error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteUser(selected.id_usuario);
      toast.success('Usuario eliminado correctamente.');
      closeModal();
      fetchUsers(page, search, order);
    } catch (e) {
      setFormError(e?.response?.data?.message ?? 'Error al eliminar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
            Usuarios
          </h1>
          <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Nuevo usuario
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input type="text" placeholder="Buscar por nombre o email…" value={search} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white shadow-sm" />
          </div>
          <button onClick={toggleOrder} className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 bg-white px-3 py-2.5 rounded-xl hover:border-stone-300 transition-colors shadow-sm">
            ID {order === 'ASC' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-stone-500 text-left">
                <th className="px-4 py-3.5 font-medium w-10 hidden sm:table-cell">#</th>
                <th className="px-4 py-3.5 font-medium">Nombre</th>
                <th className="px-4 py-3.5 font-medium hidden sm:table-cell">Email</th>
                <th className="px-4 py-3.5 font-medium hidden md:table-cell">Rol</th>
                <th className="px-4 py-3.5 font-medium hidden lg:table-cell">Género</th>
                <th className="px-4 py-3.5 font-medium">Estado</th>
                <th className="px-4 py-3.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    Cargando…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id_usuario} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3.5 text-stone-400 hidden sm:table-cell">{u.id_usuario}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-stone-700 truncate max-w-[140px]">{u.perfil?.nombre ?? '—'}</p>
                      <p className="text-xs text-stone-400 truncate max-w-[140px] sm:hidden">{u.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-stone-500 hidden sm:table-cell">
                      <span className="truncate block max-w-[180px]">{u.email}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.rol?.nombre === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.rol?.nombre ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-stone-500 text-xs hidden lg:table-cell">
                      {u.perfil?.genero?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(u)} disabled={toggling.has(u.id_usuario)} title={u.isActive ? 'Desactivar' : 'Activar'} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${u.isActive ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${u.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-xs font-medium hidden sm:inline ${u.isActive ? 'text-emerald-600' : 'text-stone-400'}`}>{toggling.has(u.id_usuario) ? '…' : u.isActive ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDelete(u)} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalItems > 0 && (
          <div className="flex items-center justify-between text-sm text-stone-500">
            <span className="text-xs">
              {meta.totalItems} usuarios · pág. {meta.currentPage}/{meta.totalPages}
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <PagBtn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ←
              </PagBtn>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
                <PagBtn key={n} active={n === page} onClick={() => setPage(n)}>
                  {n}
                </PagBtn>
              ))}
              <PagBtn disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                →
              </PagBtn>
            </div>
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Nuevo usuario' : 'Editar usuario'} onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <Field label="Nombre" value={form.nombre} onChange={(v) => setForm((f) => ({ ...f, nombre: v }))} />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
            <Field label={modal === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña'} type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-stone-500">Género (opcional)</label>
              <select
                value={form.id_genero}
                onChange={(e) => setForm((f) => ({ ...f, id_genero: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white text-stone-700"
              >
                <option value="">Sin especificar</option>
                {generos.map((g) => (
                  <option key={g.id_genero} value={g.id_genero}>{g.nombre}</option>
                ))}
              </select>
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal delete */}
      {modal === 'delete' && (
        <Modal title="Eliminar usuario" onClose={closeModal}>
          <p className="text-stone-600 text-sm">
            ¿Eliminar a <span className="font-medium">{selected?.perfil?.nombre ?? selected?.email}</span>? Esta acción no se puede deshacer.
          </p>
          {formError && <p className="text-red-400 text-xs mt-2">{formError}</p>}
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={closeModal} className="px-4 py-2 text-sm rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50">
              {saving ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-stone-800 font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-stone-500">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white" />
    </div>
  );
}

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${active ? 'bg-emerald-600 text-white font-medium' : 'border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed'}`}>
      {children}
    </button>
  );
}
