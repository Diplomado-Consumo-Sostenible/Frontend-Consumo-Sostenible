import { useState, useEffect, useCallback } from 'react';
import { Building2, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight, Loader2, AlertTriangle, X, Power, PowerOff, Plus, Edit2, Trash2, Tag as TagIcon, LayoutDashboard, Eye } from 'lucide-react';
import { getBusinessesForAdmin, changeBusinessStatus, toggleBusinessActive, createBusiness, updateBusiness, deleteBusiness } from '../../services/business/business.admin.service';
import { useToastContext } from '../../context/ToastContext';
import API from '../../api/api';

const STATUS = { ALL: '', PENDING: 'Pending', ACTIVE: 'Active', REJECTED: 'Rejected' };
const STATUS_LABELS = { Pending: 'Pendiente', Active: 'Aprobado', Rejected: 'Rechazado' };
const STATUS_STYLES = { Pending: 'bg-amber-50 text-amber-700', Active: 'bg-emerald-50 text-emerald-700', Rejected: 'bg-red-50 text-red-600' };
const STATUS_DOT = { Pending: 'bg-amber-500', Active: 'bg-emerald-500', Rejected: 'bg-red-500' };
const TABS = [
  { label: 'Todos', value: STATUS.ALL },
  { label: 'Pendientes', value: STATUS.PENDING },
  { label: 'Aprobados', value: STATUS.ACTIVE },
  { label: 'Rechazados', value: STATUS.REJECTED },
];

const INIT_FORM = {
  businessName: '',
  description: '',
  logo: '',
  address: '',
  phone: '',
  emailBusiness: '',
  website: '',
  instagramUrl: '',
  facebookUrl: '',
  xUrl: '',
  categoryId: '',
  tagIds: [],
};

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/* ─── small reusable pieces ─────────────────────────────────────────────── */
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

function BusinessAvatar({ logo, name, onPreview }) {
  if (logo) {
    return (
      <div className="relative group shrink-0 w-8 h-8">
        <img src={logo} alt={name} className="w-8 h-8 rounded-lg object-cover" />
        <button
          onClick={() => onPreview(logo, name)}
          className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <Eye className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-emerald-600">{name?.charAt(0)?.toUpperCase() || '?'}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'bg-stone-100 text-stone-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || 'bg-stone-400'}`} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white';
const sel = `${inp} cursor-pointer`;

function Field({ label, error, children, half }) {
  return (
    <div className={`flex flex-col gap-1.5 ${half ? '' : ''}`}>
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{label}</label>
      {children}
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Reject modal ───────────────────────────────────────────────────────── */
function RejectModal({ business, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const handleConfirm = () => {
    if (!reason.trim()) {
      setErr('El motivo es requerido');
      return;
    }
    onConfirm(reason.trim());
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-800">Rechazar negocio</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-stone-500">
            Estás rechazando <span className="font-semibold text-stone-700">{business?.businessName}</span>. Indica el motivo.
          </p>
          <Field label="Motivo del rechazo" error={err}>
            <textarea
              rows={4}
              placeholder="Ej: La descripción no detalla el impacto ambiental..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErr('');
              }}
              className={`${inp} resize-none`}
            />
          </Field>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar rechazo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete confirm ─────────────────────────────────────────────────────── */
function DeleteConfirm({ business, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-800">Eliminar negocio</h3>
            <p className="text-sm text-stone-500 mt-1">
              ¿Eliminar permanentemente <span className="font-medium text-stone-700">{business?.businessName}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Business form drawer ───────────────────────────────────────────────── */
function BusinessFormDrawer({ open, onClose, onSaved, editTarget, categories, tags }) {
  const toast = useToastContext();
  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!editTarget;

  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      setForm({
        businessName: editTarget.businessName || '',
        description: editTarget.description || '',
        logo: editTarget.logo || '',
        address: editTarget.address || '',
        phone: editTarget.phone || '',
        emailBusiness: editTarget.emailBusiness || '',
        website: editTarget.website || '',
        instagramUrl: editTarget.instagramUrl || '',
        facebookUrl: editTarget.facebookUrl || '',
        xUrl: editTarget.xUrl || '',
        categoryId: editTarget.category?.id_category?.toString() || '',
        tagIds: editTarget.tags?.map((t) => t.id_tags) || [],
      });
    } else {
      setForm(INIT_FORM);
    }
    setErrors({});
  }, [open, editTarget]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleTag = (id) => set('tagIds', form.tagIds.includes(id) ? form.tagIds.filter((t) => t !== id) : [...form.tagIds, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        businessName: form.businessName.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        categoryId: parseInt(form.categoryId),
        tagIds: form.tagIds,
        ...(form.logo && { logo: form.logo.trim() }),
        ...(form.phone && { phone: form.phone.trim() }),
        ...(form.emailBusiness && { emailBusiness: form.emailBusiness.trim() }),
        ...(form.website && { website: form.website.trim() }),
        ...(form.instagramUrl && { instagramUrl: form.instagramUrl.trim() }),
        ...(form.facebookUrl && { facebookUrl: form.facebookUrl.trim() }),
        ...(form.xUrl && { xUrl: form.xUrl.trim() }),
      };
      const res = isEdit ? await updateBusiness(editTarget.id_business, payload) : await createBusiness(payload);
      toast.success(res?.message || `Negocio ${isEdit ? 'actualizado' : 'creado'} exitosamente`);
      onSaved();
      onClose();
    } catch (err) {
      setErrors({ submit: err?.message || 'Error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      {/* Drawer */}
      <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-stone-800">{isEdit ? 'Editar negocio' : 'Nuevo negocio'}</h2>
            <p className="text-xs text-stone-400 mt-0.5">{isEdit ? editTarget?.businessName : 'Completa los datos del negocio'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errors.submit}
            </div>
          )}

          {/* Info básica */}
          <section className="space-y-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Información básica</p>
            <Field label="Nombre del negocio" error={errors.businessName}>
              <input type="text" placeholder="Ej. EcoMarket Bogotá" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} className={inp} />
            </Field>
            <Field label="Descripción" error={errors.description}>
              <textarea rows={3} placeholder="Describe el negocio y sus prácticas sostenibles..." value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inp} resize-none`} />
            </Field>
            <Field label="Categoría" error={errors.categoryId}>
              <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={sel}>
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => (
                  <option key={c.id_category} value={c.id_category}>
                    {c.category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="URL del logo">
              <input type="url" placeholder="https://res.cloudinary.com/..." value={form.logo} onChange={(e) => set('logo', e.target.value)} className={inp} />
            </Field>
          </section>

          {/* Contacto */}
          <section className="space-y-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Contacto y ubicación</p>
            <Field label="Dirección">
              <input type="text" placeholder="Calle 123 #45-67, Barrio Centro" value={form.address} onChange={(e) => set('address', e.target.value)} className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Teléfono">
                <input type="tel" placeholder="+57 300 123 4567" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inp} />
              </Field>
              <Field label="Email del negocio">
                <input type="email" placeholder="contacto@negocio.com" value={form.emailBusiness} onChange={(e) => set('emailBusiness', e.target.value)} className={inp} />
              </Field>
            </div>
          </section>

          {/* Redes sociales */}
          <section className="space-y-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Redes sociales y web</p>
            <Field label="Sitio web">
              <input type="url" placeholder="https://www.minegocio.com" value={form.website} onChange={(e) => set('website', e.target.value)} className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Instagram">
                <input type="url" placeholder="https://instagram.com/..." value={form.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} className={inp} />
              </Field>
              <Field label="Facebook">
                <input type="url" placeholder="https://facebook.com/..." value={form.facebookUrl} onChange={(e) => set('facebookUrl', e.target.value)} className={inp} />
              </Field>
            </div>
            <Field label="X (Twitter)">
              <input type="url" placeholder="https://x.com/..." value={form.xUrl} onChange={(e) => set('xUrl', e.target.value)} className={inp} />
            </Field>
          </section>

          {/* Tags */}
          {tags.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Productos / etiquetas sostenibles</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const selected = form.tagIds.includes(t.id_tags);
                  return (
                    <button type="button" key={t.id_tags} onClick={() => toggleTag(t.id_tags)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400'}`}>
                      <TagIcon className="w-3 h-3" />
                      {t.tag}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-stone-400">{form.tagIds.length} seleccionados</p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear negocio'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function AdminBusinesses() {
  const toast = useToastContext();

  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [activeTab, setActiveTab] = useState(STATUS.PENDING);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [preview, setPreview] = useState(null);

  const LIMIT = 10;

  const fetchBusinesses = useCallback(async (tab, p) => {
    setLoading(true);
    try {
      const filters = { page: p, limit: LIMIT };
      if (tab) filters.status = tab;
      const res = await getBusinessesForAdmin(filters);
      setBusinesses(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error(err?.message || 'Error al cargar los negocios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses(activeTab, page);
  }, [fetchBusinesses, activeTab, page]);

  useEffect(() => {
    Promise.all([API.get('/category').then((r) => setCategories(Array.isArray(r.data) ? r.data : r.data?.data || [])), API.get('/tags').then((r) => setTags(Array.isArray(r.data) ? r.data : r.data?.data || []))]).catch(() => {});
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
  };

  const filtered = businesses.filter((b) => {
    const q = search.toLowerCase();
    return b.businessName?.toLowerCase().includes(q) || b.user?.email?.toLowerCase().includes(q) || b.category?.category?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(total / LIMIT);

  const openCreate = () => {
    setEditTarget(null);
    setDrawerOpen(true);
  };
  const openEdit = (b) => {
    setEditTarget(b);
    setDrawerOpen(true);
  };

  const handleApprove = async (business) => {
    setActionLoading(business.id_business);
    try {
      const res = await changeBusinessStatus(business.id_business, 'Active');
      toast.success(res?.message || 'Negocio aprobado');
      fetchBusinesses(activeTab, page);
    } catch (err) {
      toast.error(err?.message || 'Error al aprobar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id_business);
    try {
      const res = await changeBusinessStatus(rejectTarget.id_business, 'Rejected', reason);
      toast.success(res?.message || 'Negocio rechazado');
      setRejectTarget(null);
      fetchBusinesses(activeTab, page);
    } catch (err) {
      toast.error(err?.message || 'Error al rechazar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (business, isActive) => {
    setActionLoading(business.id_business);
    try {
      const res = await toggleBusinessActive(business.id_business, isActive);
      toast.success(res?.message || 'Estado actualizado');
      fetchBusinesses(activeTab, page);
    } catch (err) {
      toast.error(err?.message || 'Error al cambiar estado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id_business);
    try {
      const res = await deleteBusiness(deleteTarget.id_business);
      toast.success(res?.message || 'Negocio eliminado');
      setDeleteTarget(null);
      fetchBusinesses(activeTab, page);
    } catch (err) {
      toast.error(err?.message || 'Error al eliminar');
      setDeleteTarget(null);
    } finally {
      setActionLoading(null);
    }
  };

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Administrador</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-600 font-medium">Negocios</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-stone-800">Moderación de Negocios</h1>
              <p className="text-sm text-stone-400 mt-0.5">Revisa y gestiona los negocios de la plataforma</p>
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-sm shrink-0">
            <Plus className="w-4 h-4" /> Nuevo Negocio
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button key={tab.value} onClick={() => handleTabChange(tab.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.value ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            {tab.label}
            {tab.value === STATUS.PENDING && activeTab === STATUS.PENDING && total > 0 && <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">{total}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input type="text" placeholder="Buscar por nombre, propietario o categoría..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando negocios...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3">
            <Building2 className="w-10 h-10 opacity-30" />
            <p className="text-sm">{search ? 'No se encontraron resultados' : `No hay negocios ${activeTab ? `en estado "${STATUS_LABELS[activeTab]}"` : 'registrados'}`}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-stone-100 bg-stone-50/50">
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>Negocio</th>
                  <th className={thClass}>Propietario</th>
                  <th className={thClass}>Categoría</th>
                  <th className={thClass}>Dirección</th>
                  <th className={thClass}>Estado</th>
                  <th className={thClass}>Activo</th>
                  <th className={thClass}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((business, idx) => {
                  const isLoading = actionLoading === business.id_business;
                  const { status, isActive } = business;
                  return (
                    <tr key={business.id_business} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-stone-400 font-mono">{(page - 1) * LIMIT + idx + 1}</td>
                      <td className="px-4 py-3.5 overflow-visible">
                        <div className="flex items-center gap-3">
                          <BusinessAvatar logo={business.logo} name={business.businessName} onPreview={(src, alt) => setPreview({ src, alt })} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-700 truncate max-w-[140px]">{business.businessName}</p>
                            {status === 'Rejected' && business.rejectionReason && (
                              <p title={business.rejectionReason} className="text-xs text-red-400 flex items-center gap-1 mt-0.5 truncate max-w-[140px]">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                {business.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-stone-500">{business.user?.email || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">{business.category?.category || '—'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-stone-400 max-w-[160px] truncate">{business.address || '—'}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-stone-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                          ) : (
                            <>
                              {(status === 'Pending' || status === 'Rejected') && (
                                <button title="Aprobar" onClick={() => handleApprove(business)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {status === 'Pending' && (
                                <button title="Rechazar" onClick={() => setRejectTarget(business)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              {(status === 'Active' || status === 'Rejected') && (
                                <button title={isActive ? 'Desactivar' : 'Activar'} onClick={() => handleToggleActive(business, !isActive)} className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-stone-400 hover:bg-stone-100' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                                  {isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                </button>
                              )}
                              <div className="w-px h-4 bg-stone-200 mx-0.5" />
                              <button title="Editar" onClick={() => openEdit(business)} className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button title="Eliminar" onClick={() => setDeleteTarget(business)} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-stone-50 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              Mostrando {filtered.length} de {total} negocios
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-stone-600 font-medium px-1">
                  {page} / {totalPages}
                </span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals & Drawer */}
      {rejectTarget && <RejectModal business={rejectTarget} onConfirm={handleRejectConfirm} onCancel={() => setRejectTarget(null)} loading={actionLoading === rejectTarget.id_business} />}
      {deleteTarget && <DeleteConfirm business={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} loading={actionLoading === deleteTarget.id_business} />}
      <BusinessFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSaved={() => fetchBusinesses(activeTab, page)} editTarget={editTarget} categories={categories} tags={tags} />

      {preview && <PhotoPreviewModal src={preview.src} alt={preview.alt} onClose={() => setPreview(null)} />}
    </div>
  );
}
