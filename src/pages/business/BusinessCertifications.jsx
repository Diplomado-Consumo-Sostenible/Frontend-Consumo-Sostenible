import { Award, LayoutDashboard, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CertCard from '../../Components/business/CertCard';
import ImageUploader from '../../Components/ui/ImageUploader';
import { useToastContext } from '../../context/ToastContext';
import { createCertification, deleteCertification, getMyCertifications } from '../../services/certifications/certifications.service';
import { uploadGeneralImage } from '../../services/upload/upload.service';

const emptyForm = { name: '', issuing_entity: '', verification_url: '' };

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-green-400/30 ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-400'
  }`;

function CertFormModal({ onClose, onSave, loading }) {
  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const uploaderRef         = useRef();
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
      try { new URL(form.verification_url.trim()); }
      catch { e.verification_url = 'Ingresa una URL válida.'; }
    }
    if (!uploaderRef.current?.canUpload) {
      e.badge_url = 'La imagen del certificado es requerida.';
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    let badgeUrl;
    try {
      badgeUrl = await uploaderRef.current.upload();
    } catch {
      return;
    }

    onSave({
      name:             form.name.trim(),
      issuing_entity:   form.issuing_entity.trim(),
      verification_url: form.verification_url.trim(),
      badge_url:        badgeUrl,
    });
  }

  function handleFileStaged(file) {
    if (file) setErrors((e) => ({ ...e, badge_url: '' }));
  }

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del certificado <span className="text-red-500">*</span>
            </label>
            <ImageUploader
              ref={uploaderRef}
              uploadFn={uploadGeneralImage}
              onError={showError}
              onFileStaged={handleFileStaged}
            />
            {errors.badge_url && (
              <p className="mt-1 text-xs text-red-500">{errors.badge_url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: Certificado de Comercio Justo"
              className={inputCls(errors.name)}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entidad emisora <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.issuing_entity}
              onChange={(e) => set('issuing_entity', e.target.value)}
              placeholder="Ej: Fairtrade International"
              className={inputCls(errors.issuing_entity)}
            />
            {errors.issuing_entity && (
              <p className="mt-1 text-xs text-red-500">{errors.issuing_entity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de verificación <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.verification_url}
              onChange={(e) => set('verification_url', e.target.value)}
              placeholder="https://certificadora.org/verificar/..."
              className={inputCls(errors.verification_url)}
            />
            {errors.verification_url && (
              <p className="mt-1 text-xs text-red-500">{errors.verification_url}</p>
            )}
          </div>

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
              {loading ? 'Enviando…' : 'Enviar certificación'}
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


function EmptyCertifications({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-softest border border-edge flex items-center justify-center mb-4">
        <Award className="w-8 h-8 text-primary-mid/60" />
      </div>
      <h3 className="text-base font-semibold text-body mb-1">Sin certificaciones aún</h3>
      <p className="text-sm text-muted max-w-xs mb-6">
        Agrega tus certificados de sostenibilidad para mostrarlos en tu perfil.
        Cada envío pasa por revisión del administrador.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar certificación
      </button>
    </div>
  );
}

export default function BusinessCertifications() {
  const { success: showSuccess, error: showError } = useToastContext();

  const [certs, setCerts]                 = useState([]);
  const [pageLoading, setPageLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [deletingCert, setDeletingCert]   = useState(null);

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
      setCerts((prev) =>
        prev.filter((c) => c.id_certification !== deletingCert.id_certification),
      );
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
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
            >
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
            <CertCard
              key={cert.id_certification}
              cert={cert}
              onDelete={setDeletingCert}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CertFormModal
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          loading={actionLoading}
        />
      )}

      {deletingCert && (
        <DeleteConfirmModal
          cert={deletingCert}
          onClose={() => setDeletingCert(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
