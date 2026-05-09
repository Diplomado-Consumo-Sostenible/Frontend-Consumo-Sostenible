import { AlertTriangle, Clock, LayoutDashboard, Loader2, PackageOpen, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImageUploader from '../../Components/ui/ImageUploader';
import { useToastContext } from '../../context/ToastContext';
import { getMyBusinesses } from '../../services/business/busienss.service';
import { createProduct, deleteProduct, getProductsByBusiness, updateProduct } from '../../services/product/product.service';
import { uploadGeneralImage } from '../../services/upload/upload.service';

// ─── ProductFormModal ─────────────────────────────────────────────────────────

const emptyForm = { name: '', description: '', image: '' };

function ProductFormModal({ initial, onClose, onSave, loading }) {
  const [form, setForm]     = useState(initial ?? emptyForm);
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

    // Solo sube si el usuario seleccionó un archivo nuevo
    if (uploaderRef.current?.canUpload) {
      try {
        imageUrl = await uploaderRef.current.upload();
      } catch {
        // ImageUploader ya actualizó su estado de error y llamó onError
        return;
      }
    }

    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      image: imageUrl || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Imagen — el uploader gestiona todo su estado internamente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-green-400/30 ${
                errors.name
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-green-400'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none resize-none transition-colors focus:ring-2 focus:ring-green-400/30 ${
                errors.description
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-green-400'
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
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
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
            <h3 className="font-semibold text-gray-800">Eliminar producto</h3>
            <p className="text-sm text-gray-500 mt-0.5">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          ¿Seguro que deseas eliminar <strong>"{product.name}"</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-44 bg-gray-100 relative overflow-hidden">
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
          className="w-full h-full flex items-center justify-center bg-gray-50"
          style={{ display: product.image ? 'none' : 'flex' }}
        >
          <PackageOpen className="w-10 h-10 text-gray-300" />
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
          {product.description}
        </p>

        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
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
      <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-4">
        <PackageOpen className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">Sin productos aún</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        Agrega tu primer producto para que los usuarios puedan explorar lo que ofreces.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar producto
      </button>
    </div>
  );
}

// ─── BusinessProducts (página principal) ─────────────────────────────────────

export default function BusinessProducts() {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastContext();

  const [business, setBusiness]         = useState(null);
  const [products, setProducts]         = useState([]);
  const [pageLoading, setPageLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showForm, setShowForm]             = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  async function loadProducts(biz) {
    const data = await getProductsByBusiness(biz.id_business);
    setProducts(data?.data ?? data ?? []);
  }

  useEffect(() => {
    async function init() {
      try {
        const businesses = await getMyBusinesses();
        if (!businesses?.length) { setPageLoading(false); return; }
        const biz = businesses[0];
        setBusiness(biz);
        await loadProducts(biz);
      } catch {
        showError('No se pudieron cargar los productos.');
      } finally {
        setPageLoading(false);
      }
    }
    init();
  }, []);

  async function handleSave(formData) {
    if (!business) return;
    setActionLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id_product, formData);
        showSuccess('Producto actualizado.');
      } else {
        await createProduct(business.id_business, formData);
        showSuccess('Producto creado.');
      }
      await loadProducts(business);
      closeForm();
    } catch (err) {
      showError(err?.message || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingProduct) return;
    setActionLoading(true);
    try {
      await deleteProduct(deletingProduct.id_product);
      setProducts((prev) =>
        prev.filter((p) => p.id_product !== deletingProduct.id_product),
      );
      showSuccess('Producto eliminado.');
      setDeletingProduct(null);
    } catch (err) {
      showError(err?.message || 'No se pudo eliminar el producto.');
    } finally {
      setActionLoading(false);
    }
  }

  function openCreate() { setEditingProduct(null); setShowForm(true); }
  function openEdit(product) { setEditingProduct(product); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditingProduct(null); }

  // ── Estados de carga / negocio inactivo ──────────────────────────────────

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-green-500" />
      </div>
    );
  }

  if (business && business.status !== 'Active') {
    const isPending = business.status === 'Pending';
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            isPending
              ? 'bg-yellow-50 border border-yellow-100'
              : 'bg-red-50 border border-red-100'
          }`}
        >
          {isPending
            ? <Clock className="w-7 h-7 text-yellow-400" />
            : <AlertTriangle className="w-7 h-7 text-red-400" />
          }
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">
          {isPending ? 'Negocio pendiente de aprobación' : 'Negocio rechazado'}
        </h3>
        <p className="text-sm text-gray-400 max-w-xs">
          {isPending
            ? 'Podrás gestionar tus productos una vez que el administrador apruebe tu negocio.'
            : 'Tu negocio fue rechazado. Contacta al administrador para más información.'}
        </p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-4">
          <PackageOpen className="w-7 h-7 text-green-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">Sin negocio registrado</h3>
        <p className="text-sm text-gray-400 max-w-xs mb-5">
          Registra tu negocio primero para poder agregar productos.
        </p>
        <button
          onClick={() => navigate('/dashboardBusiness/crear-negocio')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear negocio
        </button>
      </div>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────────

  return (
    <div className="pl-14 pr-6 py-6 space-y-8 w-full">
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <Link to="/dashboardBusiness" className="hover:text-body transition-colors">
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
              <h1 className="text-xl font-semibold text-heading">Productos</h1>
              <p className="text-sm text-muted mt-0.5">
                {business.name ?? business.businessName} ·{' '}
                {products.length} producto{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {products.length > 0 && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyProducts onAdd={openCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.id_product}
              product={p}
              onEdit={openEdit}
              onDelete={setDeletingProduct}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ProductFormModal
          initial={editingProduct}
          onClose={closeForm}
          onSave={handleSave}
          businessId={business.id_business}
          loading={actionLoading}
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
