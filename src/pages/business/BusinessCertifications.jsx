import { Award, ExternalLink, ImagePlus, LayoutDashboard, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToastContext } from '../../context/ToastContext';
import { createCertification, deleteCertification, getMyCertifications } from '../../services/certifications/certifications.service';
import { uploadGeneralImage } from '../../services/upload/upload.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

const STATUS_MAP = {
  Active: { label: 'Aprobada', cls: 'bg-ok-bg text-ok-text border-ok-text/30' },
  Pending: { label: 'En revisión', cls: 'bg-warn-bg text-warn-text border-warn-text/30' },
  Rejected: { label: 'Rechazada', cls: 'bg-red-50 text-red-700 border-red-200' },
};

function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Formato no permitido. Usa JPG, PNG, WEBP o GIF.';
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `El archivo no puede superar los ${MAX_SIZE_MB} MB.`;
  return null;
}

const emptyForm = { name: '', issuing_entity: '', verification_url: '', badge_url: '' };

function CertFormModal({ onClose, onSave, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();
  const { error: showError } = useToastContext();

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido.';
    if (!form.issuing_entity.trim()) e.issuing_entity = 'La entidad emisora es requerida.';
    if (!form.verification_url.trim()) {
      e.verification_url = 'La URL de verificación es requerida.';
    } else {
      try {
        new URL(form.verification_url.trim());
      } catch {
        e.verification_url = 'Ingresa una URL válida.';
      }
    }
    if (!imageFile && !form.badge_url) e.badge_url = 'La imagen del certificado es requerida.';
    return e;
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      showError(err);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, badge_url: '' }));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview('');
    setForm((f) => ({ ...f, badge_url: '' }));
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    let badgeUrl = form.badge_url;
    if (imageFile) {
      setUploading(true);
      try {
        const res = await uploadGeneralImage(imageFile);
        badgeUrl = res.url;
      } catch {
        showError('No se pudo subir la imagen. Inténtalo de nuevo.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSave({
      name: form.name.trim(),
      issuing_entity: form.issuing_entity.trim(),
      verification_url: form.verification_url.trim(),
      badge_url: badgeUrl,
    });
  }

  const inputCls = (err) => `w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-green-400/30 ${err ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-400'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Nueva certificación</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Badge image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del certificado <span className="text-red-500">*</span>
            </label>
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                <img src={imagePreview} alt="preview" className="w-full h-full object-contain p-2" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition-colors">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className={`w-full h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${errors.badge_url ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-primary-mid hover:bg-green-50/30'}`}>
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">Subir imagen</span>
                <span className="text-xs text-gray-400">JPG, PNG, WEBP, GIF · máx. 5 MB</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageChange} />
            {errors.badge_url && <p className="mt-1 text-xs text-red-500">{errors.badge_url}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Certificado de Comercio Justo" className={inputCls(errors.name)} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Issuing entity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entidad emisora <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.issuing_entity} onChange={(e) => set('issuing_entity', e.target.value)} placeholder="Ej: Fairtrade International" className={inputCls(errors.issuing_entity)} />
            {errors.issuing_entity && <p className="mt-1 text-xs text-red-500">{errors.issuing_entity}</p>}
          </div>

          {/* Verification URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de verificación <span className="text-red-500">*</span>
            </label>
            <input type="url" value={form.verification_url} onChange={(e) => set('verification_url', e.target.value)} placeholder="https://certificadora.org/verificar/..." className={inputCls(errors.verification_url)} />
            {errors.verification_url && <p className="mt-1 text-xs text-red-500">{errors.verification_url}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || uploading} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              {(loading || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? 'Subiendo imagen…' : loading ? 'Enviando…' : 'Enviar certificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ cert, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Eliminar certificación</h3>
            <p className="text-sm text-gray-500 mt-0.5">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          ¿Seguro que deseas eliminar <strong>"{cert.name}"</strong>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CertCard({ cert, onDelete }) {
  const status = STATUS_MAP[cert.status] ?? STATUS_MAP.Pending;
  return (
    <div className="bg-card-bg rounded-2xl border border-edge shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-36 bg-primary-softest flex items-center justify-center overflow-hidden">
        {cert.badge_url ? (
          <img
            src={cert.badge_url}
            alt={cert.name}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center" style={{ display: cert.badge_url ? 'none' : 'flex' }}>
          <Award className="w-10 h-10 text-primary-mid/40" />
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-body text-sm leading-tight">{cert.name}</h3>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
        </div>

        <p className="text-xs text-muted">{cert.issuing_entity}</p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <a href={cert.verification_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-mid hover:text-primary-dark transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Verificar
          </a>
          <button onClick={() => onDelete(cert)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyCertifications({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-softest border border-edge flex items-center justify-center mb-4">
        <Award className="w-8 h-8 text-primary-mid/60" />
      </div>
      <h3 className="text-base font-semibold text-body mb-1">Sin certificaciones aún</h3>
      <p className="text-sm text-muted max-w-xs mb-6">Agrega tus certificados de sostenibilidad para mostrarlos en tu perfil. Cada envío pasa por revisión del administrador.</p>
      <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
        <Plus className="w-4 h-4" />
        Agregar certificación
      </button>
    </div>
  );
}

export default function BusinessCertifications() {
  const { success: showSuccess, error: showError } = useToastContext();

  const [certs, setCerts] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingCert, setDeletingCert] = useState(null);

  async function loadCerts() {
    const data = await getMyCertifications();
    setCerts(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadCerts()
      .catch(() => showError('No se pudieron cargar las certificaciones.'))
      .finally(() => setPageLoading(false));
  }, []);

  async function handleSave(formData) {
    setActionLoading(true);
    try {
      await createCertification(formData);
      showSuccess('Certificación enviada. Quedará pendiente de aprobación.');
      await loadCerts();
      setShowForm(false);
    } catch (err) {
      showError(err?.message || 'No se pudo enviar la certificación.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingCert) return;
    setActionLoading(true);
    try {
      await deleteCertification(deletingCert.id_certification);
      showSuccess('Certificación eliminada.');
      setCerts((prev) => prev.filter((c) => c.id_certification !== deletingCert.id_certification));
      setDeletingCert(null);
    } catch (err) {
      showError(err?.message || 'No se pudo eliminar la certificación.');
    } finally {
      setActionLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-primary-mid" />
      </div>
    );
  }

  return (
    <div className="pl-14 pr-6 py-6 space-y-8 w-full">
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <Link to="/dashboardBusiness" className="hover:text-body transition-colors">
            Mi Negocio
          </Link>
          <span>/</span>
          <span className="text-body font-medium">Certificaciones</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-primary-dark" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-heading">Certificaciones</h1>
              <p className="text-sm text-muted mt-0.5">
                {certs.length} certificación{certs.length !== 1 ? 'es' : ''} · cada envío pasa por revisión
              </p>
            </div>
          </div>
          {certs.length > 0 && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          )}
        </div>
      </div>

      {certs.length === 0 ? (
        <EmptyCertifications onAdd={() => setShowForm(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((cert) => (
            <CertCard key={cert.id_certification} cert={cert} onDelete={setDeletingCert} />
          ))}
        </div>
      )}

      {showForm && <CertFormModal onClose={() => setShowForm(false)} onSave={handleSave} loading={actionLoading} />}

      {deletingCert && <DeleteConfirmModal cert={deletingCert} onClose={() => setDeletingCert(null)} onConfirm={handleDelete} loading={actionLoading} />}
    </div>
  );
}
