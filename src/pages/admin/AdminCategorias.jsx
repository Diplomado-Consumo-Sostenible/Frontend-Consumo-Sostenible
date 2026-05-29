import { AlertTriangle, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, Edit2, LayoutDashboard, Loader2, Plus, Search, Tag, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ModalOverlay from '../../Components/ui/ModalOverlay';
import { useToastContext } from '../../context/ToastContext';
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../../services/admin/categorias.service';

const LIMIT = 15;

function Modal({ title, onClose, children }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="relative bg-card-bg rounded-2xl shadow-warm w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
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

function ConfirmDialog({ item, onConfirm, onCancel, loading }) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="relative bg-card-bg rounded-2xl shadow-warm w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-heading">Eliminar categoría</h3>
            <p className="text-sm text-muted mt-1">
              ¿Eliminar <span className="font-medium text-body">"{item?.category}"</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors disabled:opacity-50">Cancelar</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}Eliminar
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg';

export default function AdminCategorias() {
  const toast = useToastContext();
  const [items, setItems]           = useState([]);
  const [meta, setMeta]             = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [formValue, setFormValue]   = useState('');
  const [formError, setFormError]   = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAll = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const data = await getCategorias({ page: p, limit: LIMIT });
      setItems(Array.isArray(data?.data) ? data.data : []);
      if (data?.meta) setMeta({
        totalItems:  data.meta.totalItems  ?? 0,
        totalPages:  data.meta.totalPages  ?? 1,
        currentPage: data.meta.currentPage ?? p,
      });
    } catch {
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(1); }, [fetchAll]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchAll(p);
  };

  // Client-side search on current page
  const filtered = items.filter((i) => i.category?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setFormValue(''); setFormError(''); setShowCreate(true); };
  const openEdit   = (item) => { setFormValue(item.category); setFormError(''); setEditItem(item); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formValue.trim()) { setFormError('El nombre es requerido'); return; }
    setFormLoading(true);
    try {
      await createCategoria(formValue.trim());
      toast.success('Categoría creada');
      setShowCreate(false);
      fetchAll(page);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Error al crear');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!formValue.trim()) { setFormError('El nombre es requerido'); return; }
    setFormLoading(true);
    try {
      await updateCategoria(editItem.id_category, formValue.trim());
      toast.success('Categoría actualizada');
      setEditItem(null);
      fetchAll(page);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Error al actualizar');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      await deleteCategoria(deleteItem.id_category);
      toast.success('Categoría eliminada');
      setDeleteItem(null);
      const newPage = filtered.length === 1 && page > 1 ? page - 1 : page;
      setPage(newPage);
      fetchAll(newPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al eliminar');
      setDeleteItem(null);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Administrador</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-body font-medium">Categorías</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-heading">Categorías de Negocio</h1>
              <p className="text-sm text-muted mt-0.5">Define los tipos de negocio disponibles en la plataforma</p>
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-dark text-on-dark-active text-sm font-medium rounded-xl hover:bg-primary-darkest transition-colors shadow-warm-sm shrink-0">
            <Plus className="w-4 h-4" /> Nueva Categoría
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card-bg rounded-xl px-5 py-4 border border-edge">
          <p className="text-xs text-muted font-medium">Total categorías</p>
          <p className="text-2xl font-bold mt-1 text-heading">{meta.totalItems}</p>
        </div>
        <div className="bg-primary-softest rounded-xl px-5 py-4 border border-edge">
          <p className="text-xs text-muted font-medium">En esta página</p>
          <p className="text-2xl font-bold mt-1 text-primary-dark">{filtered.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Buscar categoría en esta página..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg"
        />
      </div>

      {/* Table */}
      <div className="bg-card-bg rounded-2xl border border-edge overflow-hidden shadow-warm-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Cargando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
            <Tag className="w-10 h-10 opacity-30" />
            <p className="text-sm">{search ? 'Sin resultados en esta página' : 'No hay categorías registradas'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-edge bg-app-bg/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/40">
                {filtered.map((item, idx) => (
                  <tr key={item.id_category} className="hover:bg-app-bg/50 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-muted font-mono">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-body">{item.category}</td>
                    <td className="px-4 py-3.5 text-xs text-muted font-mono">#{item.id_category}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-muted hover:text-primary-dark hover:bg-primary-softest/50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteItem(item)} className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
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

        {/* Paginator */}
        {!loading && meta.totalItems > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-edge">
            <span className="text-xs text-muted">
              <span className="font-semibold text-body">{meta.totalItems}</span> categoría{meta.totalItems !== 1 ? 's' : ''} en total
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

      {/* Modals */}
      {showCreate && (
        <Modal title="Nueva Categoría" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />{formError}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-body">Nombre de la categoría</label>
              <input type="text" placeholder="Ej: Restaurante, Finca, Confecciones..." value={formValue} onChange={(e) => setFormValue(e.target.value)} className={inputClass} autoFocus />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors">Cancelar</button>
              <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-dark text-sm font-medium text-on-dark-active hover:bg-primary-darkest transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}Crear
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editItem && (
        <Modal title={`Editar: ${editItem.category}`} onClose={() => setEditItem(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />{formError}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-body">Nombre de la categoría</label>
              <input type="text" value={formValue} onChange={(e) => setFormValue(e.target.value)} className={inputClass} autoFocus />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setEditItem(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors">Cancelar</button>
              <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-dark text-sm font-medium text-on-dark-active hover:bg-primary-darkest transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteItem && <ConfirmDialog item={deleteItem} onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} loading={actionLoading === 'delete'} />}
    </div>
  );
}
