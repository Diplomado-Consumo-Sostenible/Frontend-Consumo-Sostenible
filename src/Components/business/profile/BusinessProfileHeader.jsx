import { Building2, Camera, Eye, Loader2, Share2, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToastContext } from '../../../context/ToastContext';
import { uploadGeneralImage } from '../../../services/upload/upload.service';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const STATUS_BADGE = {
  Active:   { label: 'Aprobado',    cls: 'bg-ok-bg text-ok-text border-ok-text/30' },
  Pending:  { label: 'En revisión', cls: 'bg-warn-bg text-warn-text border-warn-text/30' },
  Rejected: { label: 'Rechazado',   cls: 'bg-red-50 text-red-700 border-red-200' },
};

const inputCls =
  'w-full px-3.5 py-2.5 border border-edge rounded-xl text-sm text-body bg-card-bg outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-colors';

function LogoButton({ src, onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="relative w-24 h-24 rounded-2xl shrink-0 overflow-hidden bg-primary-softest border border-edge group focus:outline-none disabled:cursor-wait"
    >
      {src ? (
        <img src={src} alt="Logo del negocio" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Building2 className="w-10 h-10 text-muted" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {loading
          ? <Loader2 className="w-5 h-5 text-white animate-spin" />
          : <Camera className="w-5 h-5 text-white" />
        }
      </div>
    </button>
  );
}

function LogoMenu({ hasLogo, onUpload, onView, onRemove, onClose, loading }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={!loading ? onClose : undefined} />
      <div className="absolute left-0 top-[calc(100%+8px)] z-20 bg-white rounded-2xl shadow-2xl border border-edge overflow-hidden w-52 py-1.5">
        <label
          className={`flex items-center gap-3 px-4 py-2.5 hover:bg-primary-softest transition-colors ${
            loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
          }`}
        >
          <Camera className="w-4 h-4 text-primary-dark shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-heading">Subir logo</span>
            <span className="text-[10px] text-muted">PNG, JPG, WEBP · máx. 5 MB</span>
          </div>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={onUpload}
            disabled={loading}
          />
        </label>

        {hasLogo && (
          <>
            <button
              type="button"
              onClick={!loading ? onView : undefined}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-softest transition-colors disabled:opacity-50"
            >
              <Eye className="w-4 h-4 text-primary-dark shrink-0" />
              <span className="text-sm font-medium text-heading">Ver logo</span>
            </button>
            <button
              type="button"
              onClick={!loading ? onRemove : undefined}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm font-medium text-red-600">Eliminar logo</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}

export function HeaderDisplay({ business, editSlot, onShare, onLogoSave }) {
  const badge = STATUS_BADGE[business.status] ?? STATUS_BADGE.Pending;
  const { success, error: showError } = useToastContext();

  const [menuOpen,  setMenuOpen]  = useState(false);
  const [localLogo, setLocalLogo] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [viewOpen,  setViewOpen]  = useState(false);

  const displayLogo = localLogo ?? business.logo ?? null;
  const hasLogo     = !!displayLogo;

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError('Formato no permitido. Usa PNG, JPG o WEBP.');
      return;
    }

    const preview = URL.createObjectURL(file);
    setLocalLogo(preview);
    setMenuOpen(false);
    setLoading(true);

    try {
      const { url } = await uploadGeneralImage(file);
      await onLogoSave?.(url);
      success('Logo actualizado correctamente.');
    } catch (err) {
      URL.revokeObjectURL(preview);
      setLocalLogo(null);
      showError(err?.message || 'Error al subir el logo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setMenuOpen(false);
    setLoading(true);
    try {
      await onLogoSave?.('');
      if (localLogo) URL.revokeObjectURL(localLogo);
      setLocalLogo(null);
      success('Logo eliminado.');
    } catch (err) {
      showError(err?.message || 'Error al eliminar el logo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <div className="relative shrink-0">
        <LogoButton
          src={displayLogo}
          loading={loading}
          onClick={() => setMenuOpen((o) => !o)}
        />
        {menuOpen && (
          <LogoMenu
            hasLogo={hasLogo}
            onUpload={handleUpload}
            onView={() => { setMenuOpen(false); setViewOpen(true); }}
            onRemove={handleRemove}
            onClose={() => setMenuOpen(false)}
            loading={loading}
          />
        )}
      </div>

      {viewOpen && displayLogo && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => setViewOpen(false)}
        >
          <img
            src={displayLogo}
            alt="Logo del negocio"
            className="max-w-sm max-h-[80vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-heading leading-tight">
          {business.businessName}
        </h1>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.cls}`}>
            {badge.label}
          </span>
          {business.isActive && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-ok-bg text-ok-text border-ok-text/30">
              Activo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 text-sm flex-wrap">
          {business.category?.category && (
            <span className="text-primary-mid font-medium">
              {business.category.category}
            </span>
          )}
          {business.average_rating > 0 && (
            <>
              <span className="text-muted">·</span>
              <span className="flex items-center gap-1 text-muted">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {Number(business.average_rating).toFixed(1)}{' '}
                ({business.total_reviews} reseñas)
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
        {editSlot}
        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-primary-softest transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Compartir
        </button>
      </div>
    </div>
  );
}

export function HeaderForm({ values, onChange, categories }) {
  return (
    <div className="space-y-4 pt-2 border-t border-edge/40 mt-4">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Nombre del negocio
        </label>
        <input
          type="text"
          value={values.businessName ?? ''}
          onChange={(e) => onChange({ ...values, businessName: e.target.value })}
          placeholder="Nombre de tu negocio"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Categoría
        </label>
        <select
          value={values.categoryId ?? ''}
          onChange={(e) =>
            onChange({ ...values, categoryId: e.target.value ? Number(e.target.value) : null })
          }
          className={inputCls}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((c) => (
            <option key={c.id_category ?? c.id} value={c.id_category ?? c.id}>
              {c.category ?? c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
