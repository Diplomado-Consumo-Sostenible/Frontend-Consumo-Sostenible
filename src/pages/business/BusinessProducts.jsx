import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  LayoutDashboard,
  Loader2,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BlockedPageGuard from '../../Components/business/BlockedPageGuard';
import ImageUploader from '../../Components/ui/ImageUploader';
import { useToastContext } from '../../context/ToastContext';
import useOwnerBusinessStatus from '../../hooks/useOwnerBusinessStatus';
import { getMyBusinesses } from '../../services/business/busienss.service';
import { createProduct, deleteProduct, getProductsByBusiness, updateProduct } from '../../services/product/product.service';
import { uploadGeneralImage } from '../../services/upload/upload.service';

// ─── Constantes ───────────────────────────────────────────────────────────────

const LIMIT = 12;

// ─── ProductFormModal ─────────────────────────────────────────────────────────

const emptyForm = { name: '', description: '', price: '', image: '' };

function ProductFormModal({ initial, onClose, onSave, loading }) {
  const [form, setForm]     = useState(
    initial
      ? { ...initial, price: initial.price != null ? String(initial.price) : '', image: initial.image ?? '' }
      : emptyForm,
  );
  const [errors, setErrors] = useState({});
  const uploaderRef         = useRef();
  const { error: showError } = useToastContext();

  const isEdit = !!initial;

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido.';
    else if (form.name.trim().length < 2) e.name = 'Mínimo 2 caracteres.';
    if (!form.description.trim()) e.description = 'La descripción es requerida.';
    else if (form.description.trim().length < 5) e.description = 'Mínimo 5 caracteres.';
    if (form.price === '' || form.price === null) e.price = 'El precio es requerido.';
    else if (isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Ingresa un precio válido.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    let imageUrl = form.image;

    if (uploaderRef.current?.canUpload) {
      try {
        imageUrl = await uploaderRef.current.upload();
      } catch {
        return;
      }
    }

    onSave({
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       Number(form.price),
      image:       imageUrl || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
          <h2 className="text-lg font-semibold text-heading">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-app-bg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-body mb-2">
              Imagen del producto
            </label>
            <ImageUploader
              ref={uploaderRef}
              uploadFn={uploadGeneralImage}
              initialImage={initial?.image || ''}
              onError={showError}
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((er) => ({ ...er, name: '' }));
              }}
              placeholder="Ej: Canasta de frutas orgánicas"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-primary-mid/30 ${
                errors.name
                  ? 'border-red-400 bg-red-50'
                  : 'border-edge focus:border-primary-mid'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Precio (COP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted select-none">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => {
                  setForm((f) => ({ ...f, price: e.target.value }));
                  setErrors((er) => ({ ...er, price: '' }));
                }}
                placeholder="0"
                className={`w-full pl-7 pr-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-primary-mid/30 ${
                  errors.price
                    ? 'border-red-400 bg-red-50'
                    : 'border-edge focus:border-primary-mid'
                }`}
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">{errors.price}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => {
                setForm((f) => ({ ...f, description: e.target.value }));
                setErrors((er) => ({ ...er, description: '' }));
              }}
              placeholder="Describe brevemente tu producto…"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none resize-none transition-colors focus:ring-2 focus:ring-primary-mid/30 ${
                errors.description
                  ? 'border-red-400 bg-red-50'
                  : 'border-edge focus:border-primary-mid'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary-dark hover:bg-primary-darkest disabled:opacity-60 text-on-dark-active text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? 'Guardando…'
                : isEdit
                  ? 'Guardar cambios'
                  : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DeleteConfirmModal ───────────────────────────────────────────────────────

function DeleteConfirmModal({ product, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-heading">Eliminar producto</h3>
            <p className="text-sm text-muted mt-0.5">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <p className="text-sm text-body">
          ¿Seguro que deseas eliminar <strong>"{product.name}"</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ProductDetailModal ───────────────────────────────────────────────────────

function ProductDetailModal({ product, onClose, onEdit, onDelete }) {
  const price = product.price != null
    ? Number(product.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="bg-card-bg rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-52 bg-app-bg">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageOpen className="w-14 h-14 text-muted/40" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-heading text-base leading-tight">{product.name}</h3>
            {price && <span className="shrink-0 text-sm font-bold text-primary-dark">{price}</span>}
          </div>
          {product.description && (
            <p className="text-sm text-muted leading-relaxed">{product.description}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { onClose(); onEdit(product); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg hover:border-primary-light transition-colors"
            >
              <Pencil className="w-4 h-4" />Editar
            </button>
            <button
              onClick={() => { onClose(); onDelete(product); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-100 text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete, onView }) {
  const price = product.price != null
    ? Number(product.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    : null;

  return (
    <div
      className="group bg-card-bg rounded-2xl shadow-warm-sm border border-edge overflow-hidden flex flex-col hover:shadow-warm hover:border-primary-light transition-all cursor-pointer"
      onClick={() => onView(product)}
    >
      <div className="h-44 bg-app-bg relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center bg-app-bg"
          style={{ display: product.image ? 'none' : 'flex' }}
        >
          <PackageOpen className="w-10 h-10 text-muted" />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-heading text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-muted leading-relaxed line-clamp-3 flex-1">
          {product.description}
        </p>
        {price && (
          <p className="text-sm font-bold text-primary-dark">{price}</p>
        )}

        <div className="flex gap-2 mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-edge text-xs font-medium text-body hover:bg-app-bg hover:border-primary-light transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
          <button
            onClick={() => onDelete(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EmptyProducts ────────────────────────────────────────────────────────────

function EmptyProducts({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-softest border border-edge flex items-center justify-center mb-4">
        <PackageOpen className="w-8 h-8 text-primary-mid" />
      </div>
      <h3 className="text-lg font-semibold text-body mb-1">Sin productos aún</h3>
      <p className="text-sm text-muted max-w-xs mb-6">
        Agrega tu primer producto para que los usuarios puedan explorar lo que ofreces.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-dark hover:bg-primary-darkest text-white text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar producto
      </button>
    </div>
  );
}

// ─── BusinessProducts (página principal) ─────────────────────────────────────

export default function BusinessProducts() {
  const { isRejected, isPending, rejectionReason, status } = useOwnerBusinessStatus();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastContext();

  if (isRejected || isPending) return <BlockedPageGuard status={status} rejectionReason={rejectionReason} />;

  // ── Estado ────────────────────────────────────────────────────────────────
  const [business, setBusiness]           = useState(null);
  const [products, setProducts]           = useState([]);
  const [meta, setMeta]                   = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });
  const [page, setPage]                   = useState(1);
  const [search, setSearch]               = useState('');
  const [sortBy, setSortBy]               = useState('createdAt_DESC');
  const [pageLoading, setPageLoading]     = useState(true);
  const [listLoading, setListLoading]     = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [showForm, setShowForm]               = useState(false);
  const [editingProduct, setEditingProduct]   = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [viewingProduct, setViewingProduct]   = useState(null);

  const businessRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Carga de productos ────────────────────────────────────────────────────

  async function doLoad(biz, p, q, s) {
    const [field, dir] = (s || 'createdAt_DESC').split('_');
    setListLoading(true);
    try {
      const data = await getProductsByBusiness(biz.id_business, {
        page:   p,
        limit:  LIMIT,
        search: q || undefined,
        sortBy: field,
        order:  dir,
      });
      const list = data?.data ?? (Array.isArray(data) ? data : []);
      const m    = data?.meta ?? {};
      setProducts(list);
      setMeta({
        totalItems:  m.totalItems  ?? 0,
        totalPages:  Math.max(1, m.totalPages  ?? 1),
        currentPage: m.currentPage ?? p,
      });
    } catch {
      setProducts([]);
      setMeta({ totalItems: 0, totalPages: 1, currentPage: 1 });
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const businesses = await getMyBusinesses();
        if (!businesses?.length) { setPageLoading(false); return; }
        const biz = businesses[0];
        setBusiness(biz);
        businessRef.current = biz;
        await doLoad(biz, 1, '', 'createdAt_DESC');
      } catch {
        showError('No se pudieron cargar los productos.');
      } finally {
        setPageLoading(false);
      }
    }
    init();
  }, []);

  // ── Handlers de filtros ───────────────────────────────────────────────────

  function handleSearchChange(e) {
    const q = e.target.value;
    setSearch(q);
    if (!businessRef.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doLoad(businessRef.current, 1, q, sortBy);
    }, 350);
  }

  function handleSortChange(e) {
    const s = e.target.value;
    setSortBy(s);
    if (!businessRef.current) return;
    setPage(1);
    doLoad(businessRef.current, 1, search, s);
  }

  function handlePageChange(p) {
    if (!businessRef.current) return;
    setPage(p);
    doLoad(businessRef.current, p, search, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Handlers de CRUD ──────────────────────────────────────────────────────

  async function handleSave(formData) {
    if (!businessRef.current) return;
    setActionLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id_product, formData);
        showSuccess('Producto actualizado.');
      } else {
        await createProduct(businessRef.current.id_business, formData);
        showSuccess('Producto creado.');
      }
      await doLoad(businessRef.current, page, search, sortBy);
      closeForm();
    } catch (err) {
      showError(err?.message || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingProduct || !businessRef.current) return;
    setActionLoading(true);
    try {
      await deleteProduct(deletingProduct.id_product);
      showSuccess('Producto eliminado.');
      setDeletingProduct(null);
      // Si era el último de la página y no es la primera, retrocede una página
      const targetPage = products.length === 1 && page > 1 ? page - 1 : page;
      setPage(targetPage);
      await doLoad(businessRef.current, targetPage, search, sortBy);
    } catch (err) {
      showError(err?.message || 'No se pudo eliminar el producto.');
    } finally {
      setActionLoading(false);
    }
  }

  function openCreate()           { setEditingProduct(null); setShowForm(true); }
  function openEdit(product)      { setEditingProduct(product); setShowForm(true); }
  function closeForm()            { setShowForm(false); setEditingProduct(null); }

  // ── Estados de bloqueo / carga inicial ───────────────────────────────────

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-primary-mid" />
      </div>
    );
  }

  if (business && business.status !== 'Active') {
    const isPendingBiz = business.status === 'Pending';
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
          isPendingBiz ? 'bg-yellow-50 border border-yellow-100' : 'bg-red-50 border border-red-100'
        }`}>
          {isPendingBiz
            ? <Clock className="w-7 h-7 text-yellow-400" />
            : <AlertTriangle className="w-7 h-7 text-red-400" />
          }
        </div>
        <h3 className="text-base font-semibold text-body mb-1">
          {isPendingBiz ? 'Negocio pendiente de aprobación' : 'Negocio rechazado'}
        </h3>
        <p className="text-sm text-muted max-w-xs">
          {isPendingBiz
            ? 'Podrás gestionar tus productos una vez que el administrador apruebe tu negocio.'
            : 'Tu negocio fue rechazado. Contacta al administrador para más información.'}
        </p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-softest border border-edge flex items-center justify-center mb-4">
          <PackageOpen className="w-7 h-7 text-primary-mid" />
        </div>
        <h3 className="text-base font-semibold text-body mb-1">Sin negocio registrado</h3>
        <p className="text-sm text-muted max-w-xs mb-5">
          Registra tu negocio primero para poder agregar productos.
        </p>
        <button
          onClick={() => navigate('/dashboardBusiness/crear-negocio')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-dark hover:bg-primary-darkest text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear negocio
        </button>
      </div>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────────

  const totalPages  = meta.totalPages;
  const hasProducts = meta.totalItems > 0 || products.length > 0;

  return (
    <div className="pl-14 pr-6 py-6 space-y-6 w-full">

      {/* Breadcrumb + encabezado */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <Link to="/dashboardBusiness/perfil" className="hover:text-body transition-colors">
            Mi Negocio
          </Link>
          <span>/</span>
          <span className="text-body font-medium">Productos</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
              <PackageOpen className="w-5 h-5 text-primary-dark" />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-heading">Productos</h1>
              <p className="text-sm text-muted mt-0.5">
                {business.name ?? business.businessName} ·{' '}
                {search
                  ? `${meta.totalItems} resultado${meta.totalItems !== 1 ? 's' : ''}`
                  : `${meta.totalItems} producto${meta.totalItems !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>

          {hasProducts && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-dark hover:bg-primary-darkest text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          )}
        </div>
      </div>

      {/* Buscador + ordenamiento — visible cuando hay productos o hay búsqueda activa */}
      {(hasProducts || search) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar producto…"
              className="w-full pl-9 pr-3.5 py-2 border border-edge rounded-xl text-sm outline-none transition-colors focus:border-primary-mid focus:ring-2 focus:ring-primary-mid/20"
            />
          </div>

          {/* Ordenamiento */}
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-3.5 py-2 border border-edge rounded-xl text-sm text-body outline-none transition-colors focus:border-primary-mid focus:ring-2 focus:ring-primary-mid/20 bg-white cursor-pointer"
          >
            <option value="createdAt_DESC">Más recientes</option>
            <option value="updatedAt_DESC">Actualizados</option>
            <option value="name_ASC">A → Z</option>
            <option value="price_ASC">Precio: menor a mayor</option>
            <option value="price_DESC">Precio: mayor a menor</option>
          </select>
        </div>
      )}

      {/* Contenido */}
      {listLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-primary-mid" />
        </div>
      ) : products.length === 0 && !search ? (
        <EmptyProducts onAdd={openCreate} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <Search className="w-10 h-10 text-muted/40 mb-3" />
          <p className="text-sm text-muted">
            Sin resultados para <strong className="text-body">"{search}"</strong>
          </p>
        </div>
      ) : (
        <>
          {/* Grid de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard
                key={p.id_product}
                product={p}
                onEdit={openEdit}
                onDelete={setDeletingProduct}
                onView={setViewingProduct}
              />
            ))}
          </div>

          {/* Paginador — solo se muestra cuando hay más de una página */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted">
                {meta.totalItems} producto{meta.totalItems !== 1 ? 's' : ''} en total
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-body font-medium min-w-[90px] text-center">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {showForm && (
        <ProductFormModal
          initial={editingProduct}
          onClose={closeForm}
          onSave={handleSave}
          businessId={business.id_business}
          loading={actionLoading}
        />
      )}

      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={openEdit}
          onDelete={setDeletingProduct}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
