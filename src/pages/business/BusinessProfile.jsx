import {
  AlertTriangle, Award, Building2, Camera, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Compass, FileText, Globe, Images, Info, LayoutDashboard,
  Leaf, Loader2, MapPin, Package, Pencil, Plus, Send, Share2,
  ShieldCheck, Star, Trash2, Users, X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToastContext } from '../../context/ToastContext';
import EditableSection from '../../Components/business/profile/EditableSection';
import { HeaderForm } from '../../Components/business/profile/BusinessProfileHeader';
import { GeneralInfoForm } from '../../Components/business/profile/BusinessGeneralInfo';
import { ContactDisplay, ContactForm } from '../../Components/business/profile/BusinessContactCard';
import { LocationDisplay, LocationForm } from '../../Components/business/profile/BusinessLocationCard';
import { ScheduleDisplay, ScheduleForm } from '../../Components/business/profile/BusinessScheduleCard';
import { GalleryForm } from '../../Components/business/profile/BusinessImageGallery';
import BusinessCertificationsCard from '../../Components/business/profile/BusinessCertificationsCard';
import BusinessStatsBar from '../../Components/business/profile/BusinessStatsBar';
import BusinessMetadata from '../../Components/business/profile/BusinessMetadata';
import PublicProductCard from '../../Components/landing/PublicProductCard';
import ProductsSlider from '../../Components/landing/ProductsSlider';
import PublicCertRow from '../../Components/landing/PublicCertRow';
import useBusinessProfile from '../../hooks/useBusinessProfile';
import { usePublicProducts } from '../../hooks/usePublicBusinessContent';
import { updateMyBusiness } from '../../services/business/busienss.service';
import { uploadDocument } from '../../services/upload/upload.service';
import { getMyCertifications } from '../../services/certifications/certifications.service';
import { getTiposNegocio } from '../../services/types/tiposNegocio.service';
import { getTags } from '../../services/types/tags.service';
import { uploadGeneralImage } from '../../services/upload/upload.service';

/* ── Helpers ──────────────────────────────────────────────── */
const DAY_JS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function calcOpenStatus(schedule) {
  if (!schedule || !Object.keys(schedule).length) return null;
  const key   = DAY_JS[new Date().getDay()];
  const entry = schedule[key];
  if (!entry || entry === 'Cerrado') return { open: false, label: 'Cerrado hoy' };
  const parts = entry.split(' - ');
  if (parts.length !== 2) return null;
  const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const now    = new Date().getHours() * 60 + new Date().getMinutes();
  const isOpen = now >= toMins(parts[0]) && now < toMins(parts[1]);
  return { open: isOpen, label: isOpen ? `Abierto · cierra ${parts[1]}` : `Cerrado · abre ${parts[0]}` };
}

const ALLOWED_IMG = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/* ── Shared states ────────────────────────────────────────── */

/* renderProps: gestiona estado edición + guardado sin imponer estilo visual */
function SectionEdit({ initialValues, onSave, children }) {
  const canEdit = typeof onSave === 'function';
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [draft,   setDraft]   = useState(initialValues);
  const { success, error: showError } = useToastContext();

  useEffect(() => { if (!editing) setDraft(initialValues); }, [initialValues, editing]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
      success('Cambios guardados correctamente.');
    } catch (err) {
      showError(err?.message || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  return children({
    draft, setDraft, editing, setEditing, saving, canEdit,
    handleSave,
    handleCancel: () => { setDraft(initialValues); setEditing(false); },
  });
}

/* botones Editar / Guardar / Cancelar flotantes en la esquina de la sección */
function SectionEditButtons({ editing, saving, onEdit, onSave, onCancel }) {
  if (!editing) {
    return (
      <button
        onClick={onEdit}
        className="flex items-center gap-1 text-xs font-medium text-muted hover:text-primary-mid px-2.5 py-1 rounded-lg hover:bg-primary-softest transition-colors"
      >
        <Pencil className="w-3 h-3" />Editar
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onCancel}
        disabled={saving}
        className="flex items-center gap-1 text-xs font-medium text-muted hover:text-body px-2.5 py-1 rounded-lg hover:bg-edge/40 transition-colors disabled:opacity-50"
      >
        <X className="w-3 h-3" />Cancelar
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1 text-xs font-medium text-white bg-primary-dark hover:bg-primary-darkest px-3 py-1.5 rounded-lg transition-colors disabled:opacity-70"
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}

/* ── StatusBanner ─────────────────────────────────────────── */
function StatusBanner({ status, rejectionReason }) {
  if (status === 'Active') return null;
  const isPending = status === 'Pending';
  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm ${
      isPending
        ? 'bg-amber-50 border-amber-200 text-amber-800'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      {isPending
        ? <Clock className="w-4 h-4 shrink-0 mt-0.5" />
        : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      }
      <div>
        <p className="font-semibold">
          {isPending ? 'Negocio en revisión' : 'Negocio rechazado'}
        </p>
        <p className="text-xs mt-0.5 opacity-80">
          {isPending
            ? 'Tu negocio está siendo revisado. La edición de galería y gestión de productos están bloqueadas.'
            : rejectionReason
              ? `Motivo: ${rejectionReason}. Actualiza tu información básica y el documento de cámara de comercio para volver a revisión.`
              : 'Actualiza tu información básica y el documento de cámara de comercio para volver a enviar a revisión.'
          }
        </p>
      </div>
    </div>
  );
}

/* ── Cover ────────────────────────────────────────────────── */
function BusinessCover({ business, onSave }) {
  const year    = business.createdAt ? new Date(business.createdAt).getFullYear() : null;
  const mapsUrl = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
    : null;

  const { success, error: showError } = useToastContext();
  const fileInputRef   = useRef(null);
  const [localBanner,   setLocalBanner]   = useState(null);
  const [bannerLoading, setBannerLoading] = useState(false);

  const bannerSrc = localBanner ?? business.banner_image ?? null;

  async function handleBannerChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';                                   // permite re-seleccionar el mismo archivo
    if (!ALLOWED_IMG.includes(file.type)) { showError('Formato no permitido. Usa PNG, JPG o WEBP.'); return; }
    if (file.size > 5 * 1024 * 1024)     { showError('La imagen no puede superar los 5 MB.'); return; }

    const preview = URL.createObjectURL(file);
    setLocalBanner(preview);
    setBannerLoading(true);
    try {
      const { url } = await uploadGeneralImage(file);
      await onSave({ banner_image: url });
      success('Portada actualizada correctamente.');
    } catch (err) {
      URL.revokeObjectURL(preview);
      setLocalBanner(null);
      showError(err?.message || 'Error al subir la portada.');
    } finally {
      setBannerLoading(false);
    }
  }

  async function handleBannerRemove() {
    setBannerLoading(true);
    try {
      await onSave({ banner_image: '' });
      if (localBanner) URL.revokeObjectURL(localBanner);
      setLocalBanner(null);
      success('Portada eliminada.');
    } catch (err) {
      showError(err?.message || 'Error al eliminar la portada.');
    } finally {
      setBannerLoading(false);
    }
  }

  return (
    <div
      className="relative h-52 sm:h-72 rounded-3xl overflow-hidden group"
      style={!bannerSrc ? { background: 'linear-gradient(160deg, var(--color-primary-mid) 0%, var(--color-primary-darkest) 100%)' } : undefined}
    >
      {/* Imagen de banner */}
      {bannerSrc && (
        <img
          src={bannerSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {/* Overlays decorativos — gradiente cuando no hay banner, oscuro cuando hay foto */}
      {bannerSrc ? (
        <div className="absolute inset-0 bg-black/35" />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 22% 30%, rgba(231,206,160,0.14) 0%, transparent 48%),' +
                'radial-gradient(circle at 78% 68%, rgba(91,138,102,0.25) 0%, transparent 52%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </>
      )}

      {/* Hoja decorativa */}
      <div className="absolute right-[-50px] top-[-50px] opacity-[0.07] pointer-events-none select-none text-white">
        <Leaf style={{ width: 320, height: 320 }} strokeWidth={0.4} />
      </div>

      {/* Chips: mapa + año */}
      <div className="absolute top-4 right-4 flex gap-2">
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <MapPin className="w-3 h-3" />Ver en mapa
          </a>
        )}
        {year && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-body backdrop-blur-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />Desde {year}
          </span>
        )}
      </div>

      {/* Controles de portada (solo owner) */}
      {onSave && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleBannerChange}
          />
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={bannerLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm hover:bg-black/75 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {bannerLoading
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Camera className="w-3 h-3" />
              }
              {bannerLoading ? 'Subiendo…' : 'Cambiar portada'}
            </button>
            {bannerSrc && !bannerLoading && (
              <button
                type="button"
                onClick={handleBannerRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm hover:bg-red-600/80 transition-colors"
              >
                <Trash2 className="w-3 h-3" />Eliminar portada
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Header con logo solapando el cover ───────────────────── */
const STATUS_BADGE = {
  Active:   { label: 'Aprobado',    cls: 'bg-ok-bg text-ok-text border-ok-text/30' },
  Pending:  { label: 'En revisión', cls: 'bg-warn-bg text-warn-text border-warn-text/30' },
  Rejected: { label: 'Rechazado',   cls: 'bg-red-50 text-red-700 border-red-200' },
};

function OwnerProfileHeader({ business, categories, onSave }) {
  const { success, error: showError } = useToastContext();

  const [logoMenuOpen, setLogoMenuOpen] = useState(false);
  const [localLogo,    setLocalLogo]    = useState(null);
  const [logoLoading,  setLogoLoading]  = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [draft,   setDraft]   = useState({
    businessName: business.businessName,
    categoryId:   business.category?.id_category ?? null,
  });

  const docInputRef                     = useRef(null);
  const [pendingDoc,   setPendingDoc]   = useState(null);   // File seleccionado aún no subido
  const [docUploading, setDocUploading] = useState(false);
  const [docProgress,  setDocProgress]  = useState(0);
  const [docError,     setDocError]     = useState(null);
  const [docSuccess,   setDocSuccess]   = useState(false);

  useEffect(() => {
    if (!editing) setDraft({ businessName: business.businessName, categoryId: business.category?.id_category ?? null });
  }, [business, editing]);

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMG.includes(file.type)) { showError('Formato no permitido. Usa PNG, JPG o WEBP.'); return; }
    const preview = URL.createObjectURL(file);
    setLocalLogo(preview);
    setLogoMenuOpen(false);
    setLogoLoading(true);
    try {
      const { url } = await uploadGeneralImage(file);
      await onSave({ logo: url });
      success('Logo actualizado correctamente.');
    } catch (err) {
      URL.revokeObjectURL(preview);
      setLocalLogo(null);
      showError(err?.message || 'Error al subir el logo.');
    } finally {
      setLogoLoading(false);
    }
  }

  async function handleLogoRemove() {
    setLogoMenuOpen(false);
    setLogoLoading(true);
    try {
      await onSave({ logo: '' });
      if (localLogo) URL.revokeObjectURL(localLogo);
      setLocalLogo(null);
      success('Logo eliminado.');
    } catch (err) {
      showError(err?.message || 'Error al eliminar el logo.');
    } finally {
      setLogoLoading(false);
    }
  }

  function handleDocSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.type !== 'application/pdf') { setDocError('Solo se permiten archivos PDF.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setDocError('El archivo no puede superar los 5 MB.'); return; }
    setDocError(null);
    setDocSuccess(false);
    setPendingDoc(file);
  }

  async function handleInfoSave() {
    setSaving(true);
    try {
      const payload = { businessName: draft.businessName, categoryId: draft.categoryId };

      if (pendingDoc) {
        setDocUploading(true);
        setDocProgress(0);
        try {
          const result = await uploadDocument(pendingDoc, { onProgress: setDocProgress });
          payload.legal_document_url = result.url;
          setDocSuccess(true);
          setPendingDoc(null);
        } catch (err) {
          setDocError(err?.message || 'No se pudo subir el documento.');
          setDocUploading(false);
          setDocProgress(0);
          setSaving(false);
          return;
        } finally {
          setDocUploading(false);
          setDocProgress(0);
        }
      }

      await onSave(payload);
      setEditing(false);
      success('Cambios guardados correctamente.');
    } catch (err) {
      showError(err?.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  const displayLogo = localLogo ?? business.logo ?? null;
  const badge = STATUS_BADGE[business.status] ?? STATUS_BADGE.Pending;
  const status = calcOpenStatus(business.schedule);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: business.businessName, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href)
        .then(() => success('Enlace copiado al portapapeles'))
        .catch(() => {});
    }
  };

  return (
    <div className="flex items-start gap-5 flex-wrap">

      {/* Logo — solapa el cover */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setLogoMenuOpen((o) => !o)}
          disabled={logoLoading}
          className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl border-[5px] border-app-bg bg-primary-softest flex items-center justify-center overflow-hidden group focus:outline-none disabled:cursor-wait"
          style={{ marginTop: '-80px', boxShadow: '0 4px 20px 0 rgb(31 61 43 / 0.18)' }}
        >
          {displayLogo
            ? <img src={displayLogo} alt={business.businessName} className="w-full h-full object-cover" />
            : <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-muted" />
          }
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {logoLoading
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Camera className="w-5 h-5 text-white" />
            }
          </div>
        </button>

        {logoMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => !logoLoading && setLogoMenuOpen(false)} />
            <div className="absolute left-0 top-[calc(100%+8px)] z-20 bg-white rounded-2xl shadow-2xl border border-edge overflow-hidden w-52 py-1.5">
              <label className={`flex items-center gap-3 px-4 py-2.5 hover:bg-primary-softest transition-colors ${logoLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                <Camera className="w-4 h-4 text-primary-dark shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-heading">Subir logo</span>
                  <span className="text-[10px] text-muted">PNG, JPG, WEBP · máx. 5 MB</span>
                </div>
                <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={handleLogoUpload} disabled={logoLoading} />
              </label>
              {displayLogo && (
                <button
                  type="button"
                  onClick={handleLogoRemove}
                  disabled={logoLoading}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-sm font-medium text-red-600">Eliminar logo</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Info + CTAs */}
      <div className="flex-1 min-w-[200px] space-y-3 pt-2">
        {/* Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.cls}`}>
            {badge.label}
          </span>
          {business.category?.category && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary-dark text-on-dark-active">
              <Leaf className="w-3 h-3" />{business.category.category}
            </span>
          )}
          {business.certifications?.length > 0 && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-ok-bg text-ok-text border border-ok-text/20">
              <ShieldCheck className="w-3 h-3" />Certificado
            </span>
          )}
        </div>

        {/* Nombre */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-heading leading-[1.05] tracking-tight">
          {business.businessName}
        </h1>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-sm text-muted flex-wrap">
          {status && (
            <>
              <span className={`flex items-center gap-1.5 font-medium ${status.open ? 'text-ok-text' : 'text-muted'}`}>
                <span className={`w-2 h-2 rounded-full ${status.open ? 'bg-ok-text animate-pulse' : 'bg-muted'}`} />
                {status.label}
              </span>
              <span className="w-px h-4 bg-edge shrink-0" />
            </>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <strong className="text-heading font-semibold">{business.followers_count ?? 0}</strong> seguidores
          </span>
          {business.average_rating != null && (
            <>
              <span className="w-px h-4 bg-edge shrink-0" />
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <strong className="text-heading font-semibold">{Number(business.average_rating).toFixed(1)}</strong>
                <span>· {business.total_reviews ?? 0} reseñas</span>
              </span>
            </>
          )}
          {business.address && (
            <>
              <span className="w-px h-4 bg-edge shrink-0" />
              <span className="flex items-center gap-1 min-w-0">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[220px]">{business.address}</span>
              </span>
            </>
          )}
        </div>

        {/* CTAs */}
        {!editing ? (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              onClick={handleShare}
              aria-label="Compartir"
              className="w-9 h-9 rounded-xl border border-edge bg-card-bg flex items-center justify-center text-body hover:border-muted transition-colors shrink-0"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {typeof onSave === 'function' && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-dark text-on-dark-active hover:bg-primary-darkest transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />Editar información
              </button>
            )}
          </div>
        ) : (
          <div className="pt-1 space-y-4">
            <HeaderForm values={draft} onChange={setDraft} categories={categories} />

            {/* Actualizar cámara de comercio */}
            <div className="pt-3 border-t border-edge space-y-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Cámara de comercio</p>
              <input
                ref={docInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleDocSelect}
              />

              {docSuccess ? (
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-ok-bg border border-ok-text/10">
                  <span className="flex items-center gap-2 text-xs font-medium text-ok-text">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Documento subido correctamente
                  </span>
                  <button
                    type="button"
                    onClick={() => { setDocSuccess(false); docInputRef.current?.click(); }}
                    disabled={saving}
                    className="text-xs text-ok-text/70 hover:text-ok-text underline underline-offset-2 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    Cambiar
                  </button>
                </div>
              ) : pendingDoc ? (
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-primary-softest border border-primary-light/40">
                  <span className="flex items-center gap-2 text-xs font-medium text-heading min-w-0">
                    <FileText className="w-4 h-4 shrink-0 text-primary-dark" />
                    <span className="truncate">{pendingDoc.name}</span>
                    <span className="shrink-0 text-muted">({(pendingDoc.size / 1024).toFixed(0)} KB)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setPendingDoc(null); setDocError(null); }}
                    disabled={saving || docUploading}
                    className="text-xs text-muted hover:text-red-500 transition-colors shrink-0 disabled:opacity-50"
                    aria-label="Quitar documento"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={docUploading || saving}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-edge hover:border-primary-light text-xs font-medium text-muted hover:text-body transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  <FileText className="w-3.5 h-3.5" />Seleccionar documento PDF
                </button>
              )}

              {/* Barra de progreso visible mientras sube (al guardar) */}
              {docUploading && (
                <div className="space-y-1">
                  <div className="relative h-1.5 bg-edge rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary-dark rounded-full transition-all duration-150"
                      style={{ width: `${docProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted text-right">Subiendo… {docProgress}%</p>
                </div>
              )}

              {docError && <p className="text-xs text-red-500">{docError}</p>}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setDraft({ businessName: business.businessName, categoryId: business.category?.id_category ?? null }); setPendingDoc(null); setDocError(null); setDocSuccess(false); setEditing(false); }}
                disabled={saving || docUploading}
                className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-body px-3 py-2 rounded-lg border border-edge hover:bg-edge/40 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />Cancelar
              </button>
              <button
                onClick={handleInfoSave}
                disabled={saving || docUploading}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-primary-dark hover:bg-primary-darkest px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Image lightbox ───────────────────────────────────────── */
function ImageLightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex ?? 0);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % images.length);
      if (e.key === 'ArrowLeft')  setCurrent((c) => (c - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
        <Images className="w-3.5 h-3.5 text-white/70" />
        <span className="text-xs text-white/80">{current + 1} / {images.length}</span>
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Image */}
      <img
        src={images[current]}
        alt={`Foto ${current + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Gallery mosaic ───────────────────────────────────────── */
function GalleryMosaic({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const items = images.slice(0, 5);
  if (!items.length) return null;

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gridTemplateRows: '150px 150px',
          gap: '8px',
        }}
      >
        {items.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="relative overflow-hidden bg-primary-softest group focus:outline-none"
            style={{ gridRow: i === 0 ? '1 / 3' : 'auto' }}
          >
            <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {i === 4 && images.length > 5 ? (
              <div className="absolute inset-0 bg-primary-darkest/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <span className="font-serif text-3xl leading-none">+{images.length - 4}</span>
                <span className="text-xs text-white/80 mt-1">fotos</span>
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

/* ── Products carousel ────────────────────────────────────── */
function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-14">
      <Loader2 className="w-5 h-5 animate-spin text-primary-mid" />
    </div>
  );
}

function Empty({ icon, message }) {
  const EmptyIcon = icon;
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <div className="w-12 h-12 bg-primary-softest rounded-2xl flex items-center justify-center">
        <EmptyIcon className="w-6 h-6 text-muted" />
      </div>
      <p className="text-sm text-muted max-w-xs">{message}</p>
    </div>
  );
}

/* ── Product preview modal (read-only, public view) ──────── */
function ProductPreviewModal({ product, onClose }) {
  const price = product.price != null
    ? Number(product.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-52 bg-primary-softest">
          {product.image
            ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Package className="w-14 h-14 text-muted/40" /></div>
          }
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-heading text-base leading-tight">{product.name}</h3>
            {price && <span className="shrink-0 text-sm font-bold text-primary-dark">{price}</span>}
          </div>
          {product.description && <p className="text-sm text-muted leading-relaxed">{product.description}</p>}
        </div>
      </div>
    </div>
  );
}

/* Wrapper local que gestiona el modal de detalle del producto */
function ProductsSection({ businessId, onGoToProducts }) {
  const [viewingProduct, setViewingProduct] = useState(null);
  return (
    <>
      <ProductsSlider
        businessId={businessId}
        onView={setViewingProduct}
        onSeeAll={onGoToProducts}
        emptyMessage="Aún no tienes productos publicados."
      />
      {viewingProduct && (
        <ProductPreviewModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </>
  );
}

/* ── TagsForm ─────────────────────────────────────────────── */
function TagsForm({ selectedIds, onChange, allTags }) {
  const toggle = (id) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );

  if (!allTags.length) return (
    <p className="text-xs text-muted italic">Cargando etiquetas…</p>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((t) => {
        const id = t.id_tags ?? t.id;
        const name = t.tagName ?? t.name ?? t.tag;
        const active = selectedIds.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              active
                ? 'bg-primary-dark text-on-dark-active border-primary-dark'
                : 'bg-card-bg text-body border-edge hover:border-primary-light hover:text-primary-dark'
            }`}
          >
            <Leaf className="w-3 h-3" />
            {name}
          </button>
        );
      })}
    </div>
  );
}

/* ── Tab: Información ─────────────────────────────────────── */
function TabInfo({ business, save, basicSave, canManage, allTags, onGoToProducts }) {
  return (
    <div className="space-y-10">

      {/* Sobre el negocio */}
      <SectionEdit
        initialValues={{ description: business.description ?? '' }}
        onSave={basicSave ? (v) => basicSave({ description: v.description }) : null}
      >
        {({ draft, setDraft, editing, setEditing, saving, canEdit, handleSave, handleCancel }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-primary-mid uppercase tracking-wider flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5" />Sobre el negocio
              </p>
              {canEdit && (
                <SectionEditButtons
                  editing={editing} saving={saving}
                  onEdit={() => setEditing(true)}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
            </div>
            {editing ? (
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={5}
                placeholder="Describe tu negocio…"
                className="w-full px-4 py-3 border border-edge rounded-2xl text-sm text-body bg-card-bg outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-colors resize-none"
              />
            ) : business.description ? (
              <div
                className="rounded-2xl p-6 sm:p-8 border border-primary-softest"
                style={{ background: 'linear-gradient(135deg, rgba(200,219,191,0.22) 0%, var(--color-app-bg) 100%)' }}
              >
                <p className="font-serif text-xl sm:text-2xl text-heading leading-relaxed">
                  {business.description}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted italic">Sin descripción. Haz clic en Editar para agregar una.</p>
            )}
          </div>
        )}
      </SectionEdit>

      {/* Galería */}
      <SectionEdit
        initialValues={{ images: business.images ?? [] }}
        onSave={canManage ? (v) => save({ images: v.images }) : null}
      >
        {({ draft, setDraft, editing, setEditing, saving, canEdit, handleSave, handleCancel }) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-heading">Galería</h2>
                <p className="text-sm text-muted mt-0.5">
                  {(draft.images?.length ?? 0)} foto{draft.images?.length !== 1 ? 's' : ''} del espacio
                </p>
              </div>
              {canEdit && (
                <SectionEditButtons
                  editing={editing} saving={saving}
                  onEdit={() => setEditing(true)}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
            </div>
            {editing ? (
              <GalleryForm values={draft} onChange={setDraft} />
            ) : draft.images?.length > 0 ? (
              <GalleryMosaic images={draft.images} />
            ) : (
              <Empty icon={Info} message="Sin imágenes. Haz clic en Editar para agregar fotos." />
            )}
          </div>
        )}
      </SectionEdit>

      {/* Productos (preview carousel) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-heading">Productos</h2>
            <p className="text-sm text-muted mt-0.5">Lo que ofrece tu negocio</p>
          </div>
          {canManage ? (
            <Link
              to="/dashboardBusiness/productos"
              className="flex items-center gap-1.5 text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors"
            >
              <Package className="w-3.5 h-3.5" />Gestionar
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted opacity-40 cursor-not-allowed select-none">
              <Package className="w-3.5 h-3.5" />Gestionar
            </span>
          )}
        </div>
        <ProductsSection businessId={business.id_business} onGoToProducts={onGoToProducts} />
      </div>

      {/* Etiquetas sostenibles */}
      <SectionEdit
        initialValues={{ tagIds: (business.tags ?? []).map((t) => t.id_tags ?? t.id) }}
        onSave={basicSave ? (v) => basicSave({ tagIds: v.tagIds }) : null}
      >
        {({ draft, setDraft, editing, setEditing, saving, canEdit, handleSave, handleCancel }) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-heading">Etiquetas sostenibles</h2>
                <p className="text-sm text-muted mt-0.5">
                  {editing
                    ? 'Selecciona las etiquetas que describen tu negocio'
                    : 'Tipos de producto que ofrece tu negocio'}
                </p>
              </div>
              {canEdit && (
                <SectionEditButtons
                  editing={editing} saving={saving}
                  onEdit={() => setEditing(true)}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
            </div>

            {editing ? (
              <TagsForm
                selectedIds={draft.tagIds}
                onChange={(ids) => setDraft({ tagIds: ids })}
                allTags={allTags}
              />
            ) : (business.tags?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-2">
                {business.tags.map((t) => (
                  <span
                    key={t.id_tags ?? t.tagName}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary-softest text-primary-dark border border-primary-softest"
                  >
                    <Leaf className="w-3 h-3" />
                    {t.tagName ?? t.name ?? t.tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted italic">
                Sin etiquetas. {canEdit ? 'Haz clic en Editar para agregar.' : ''}
              </p>
            )}
          </div>
        )}
      </SectionEdit>

      <BusinessStatsBar
        followers={business.followers_count}
        rating={business.average_rating}
        reviews={business.total_reviews}
      />

      <BusinessMetadata
        createdAt={business.createdAt}
        updatedAt={business.updatedAt}
      />
    </div>
  );
}

/* ── Tab: Productos ───────────────────────────────────────── */
function TabProducts({ businessId, canManage }) {
  const { products, loading, error, retry } = usePublicProducts(businessId);
  const [viewingProduct, setViewingProduct] = useState(null);

  if (loading) return <SectionLoader />;
  if (error) return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-muted">{error}</p>
      <button onClick={retry} className="text-sm font-medium text-primary-mid hover:text-primary-dark transition-colors">Reintentar</button>
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-heading">Productos</h2>
            <p className="text-sm text-muted mt-0.5">
              {products.length} producto{products.length !== 1 ? 's' : ''} publicado{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          {canManage ? (
            <Link
              to="/dashboardBusiness/productos"
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-dark text-on-dark-active hover:bg-primary-darkest transition-colors"
            >
              <Package className="w-4 h-4" />Gestionar
            </Link>
          ) : (
            <span className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-edge text-muted opacity-50 cursor-not-allowed select-none">
              <Package className="w-4 h-4" />Gestionar
            </span>
          )}
        </div>
        {products.length === 0 ? (
          <Empty icon={Package} message="Aún no tienes productos publicados. Ve a Gestionar para agregar." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p, i) => (
              <button key={p.id_product ?? i} type="button" onClick={() => setViewingProduct(p)} className="text-left focus:outline-none">
                <PublicProductCard product={p} />
              </button>
            ))}
          </div>
        )}
      </div>
      {viewingProduct && <ProductPreviewModal product={viewingProduct} onClose={() => setViewingProduct(null)} />}
    </>
  );
}

/* ── Tab: Certificaciones ─────────────────────────────────── */
function TabCertifications({ certifications }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-heading">Certificaciones</h2>
          <p className="text-sm text-muted mt-0.5">
            {certifications.length > 0
              ? `${certifications.length} certificación${certifications.length !== 1 ? 'es' : ''} registrada${certifications.length !== 1 ? 's' : ''}`
              : 'Sin certificaciones registradas'}
          </p>
        </div>
        <Link
          to="/dashboardBusiness/certificaciones"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-dark text-on-dark-active hover:bg-primary-darkest transition-colors"
        >
          <Award className="w-4 h-4" />Gestionar
        </Link>
      </div>
      {certifications.length === 0 ? (
        <Empty icon={Award} message="Aún no tienes certificaciones. Ve a Gestionar para subir documentos." />
      ) : (
        <div className="bg-card-bg border border-edge rounded-2xl p-5 max-w-2xl">
          {certifications.map((c, i) => <PublicCertRow key={c.id_certification ?? i} cert={c} />)}
        </div>
      )}
    </div>
  );
}

/* ── Sidebar ──────────────────────────────────────────────── */
function SidebarCard({ title, icon, children }) {
  const SidebarIcon = icon;
  return (
    <div className="bg-card-bg border border-edge rounded-2xl p-5 space-y-4">
      <h4 className="flex items-center gap-2 text-[11px] font-semibold text-muted uppercase tracking-wider">
        <SidebarIcon className="w-3.5 h-3.5" />{title}
      </h4>
      {children}
    </div>
  );
}

function ScheduleCard({ business, save }) {
  const status = calcOpenStatus(business.schedule);
  return (
    <EditableSection
      title="Horario de atención"
      icon={Clock}
      initialValues={{ schedule: business.schedule ?? {} }}
      onSave={save ? (v) => save({ schedule: v.schedule }) : null}
    >
      {({ values, setValues, editing }) => (
        <>
          {!editing && status && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${status.open ? 'bg-ok-bg text-ok-text' : 'bg-edge text-muted'}`}>
              <span className={`w-2 h-2 rounded-full ${status.open ? 'bg-ok-text animate-pulse' : 'bg-muted'}`} />
              {status.label}
            </span>
          )}
          {editing
            ? <ScheduleForm values={values} onChange={setValues} />
            : <ScheduleDisplay schedule={values.schedule} />
          }
        </>
      )}
    </EditableSection>
  );
}

function MiniMapCard({ address }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return (
    <SidebarCard title="Ubicación" icon={MapPin}>
      <div
        className="relative h-40 rounded-xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #E8E1CB 0%, #DCD4B8 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(31,61,43,0.06) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(31,61,43,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute w-10 h-10 rounded-full bg-terracotta/20 animate-pulse" style={{ top: '-8px', left: '-8px' }} />
            <div className="relative w-6 h-6 rounded-full bg-terracotta border-2 border-white shadow-warm-sm flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-edge text-sm text-body hover:border-primary-mid hover:text-primary-dark transition-colors"
      >
        <Compass className="w-4 h-4" />Cómo llegar
      </a>
    </SidebarCard>
  );
}

function OwnerSidebar({ business, certifications, basicSave, fullSave, canManage }) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">

      <EditableSection
        title="Contacto"
        icon={Globe}
        initialValues={{
          address:       business.address,
          phone:         business.phone,
          emailBusiness: business.emailBusiness,
          website:       business.website,
          instagramUrl:  business.instagramUrl,
          facebookUrl:   business.facebookUrl,
          xUrl:          business.xUrl,
        }}
        onSave={basicSave ? (v) => basicSave({
          address:       v.address,
          phone:         v.phone,
          emailBusiness: v.emailBusiness,
          website:       v.website,
          instagramUrl:  v.instagramUrl,
          facebookUrl:   v.facebookUrl,
          xUrl:          v.xUrl,
        }) : null}
      >
        {({ values, setValues, editing }) =>
          editing
            ? <ContactForm values={values} onChange={setValues} />
            : <ContactDisplay
                address={values.address}
                phone={values.phone}
                emailBusiness={values.emailBusiness}
                website={values.website}
                instagramUrl={values.instagramUrl}
                facebookUrl={values.facebookUrl}
                xUrl={values.xUrl}
              />
        }
      </EditableSection>

      <ScheduleCard business={business} save={fullSave} />

      <EditableSection
        title="Ubicación geográfica"
        icon={MapPin}
        initialValues={{ latitude: business.latitude, longitude: business.longitude }}
        onSave={fullSave ? (v) => fullSave({ latitude: v.latitude, longitude: v.longitude }) : null}
      >
        {({ values, setValues, editing }) =>
          editing
            ? <LocationForm values={values} onChange={setValues} />
            : <LocationDisplay latitude={values.latitude} longitude={values.longitude} />
        }
      </EditableSection>

      <BusinessCertificationsCard certifications={certifications} canManage={canManage} />
    </aside>
  );
}

/* ── Tabs ─────────────────────────────────────────────────── */
const TABS = [
  { id: 'info',  label: 'Información',     icon: Info    },
  { id: 'prods', label: 'Productos',       icon: Package },
  { id: 'certs', label: 'Certificaciones', icon: Award   },
];

/* ── Main ─────────────────────────────────────────────────── */
export default function BusinessProfile() {
  const { business, loading, error, retry } = useBusinessProfile();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToastContext();
  const [certifications, setCertifications] = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [allTags,        setAllTags]        = useState([]);
  const [activeTab,      setActiveTab]      = useState('info');
  const [localDraft,     setLocalDraft]     = useState({});
  const [submitting,     setSubmitting]     = useState(false);

  useEffect(() => {
    getMyCertifications().then((d) => setCertifications(Array.isArray(d?.data) ? d.data : [])).catch(() => {});
    getTiposNegocio().then((d) => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    getTags().then((d) => setAllTags(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-primary-mid" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-softest border border-edge flex items-center justify-center mb-4">
          <Building2 className="w-7 h-7 text-primary-mid" />
        </div>
        <h3 className="text-base font-semibold text-body mb-1">
          {error ? 'No se pudo cargar la información' : 'Sin negocio registrado'}
        </h3>
        <p className="text-sm text-muted max-w-xs mb-5">
          {error ? 'Intenta de nuevo o crea tu negocio si aún no tienes uno.' : 'Crea tu negocio para comenzar a gestionar tu perfil.'}
        </p>
        {error && (
          <button onClick={retry} className="text-sm font-medium text-primary-mid hover:text-primary-dark underline transition-colors mb-3">
            Reintentar
          </button>
        )}
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

  const id         = business.id_business;
  const isActive   = business.status === 'Active';
  const isRejected = business.status === 'Rejected';

  async function save(fields) { await updateMyBusiness(id, fields); retry(); }

  // Rejected: acumula cambios localmente hasta que el owner pulse "Enviar petición"
  const localSave = (fields) => setLocalDraft((prev) => ({ ...prev, ...fields }));

  const hasPendingChanges = isRejected && Object.keys(localDraft).length > 0;

  const handleSubmitPetition = async () => {
    setSubmitting(true);
    try {
      await save(localDraft);   // PATCH → backend cambia status a Pending
      setLocalDraft({});
      toastSuccess('Petición enviada. Tu negocio está en revisión nuevamente.');
    } catch (err) {
      toastError(err?.message || 'No se pudo enviar la petición.');
    } finally {
      setSubmitting(false);
    }
  };

  const basicSave     = isActive ? save : (isRejected ? localSave : null);
  const fullSave      = isActive ? save : null;
  const canManage     = isActive;
  const displayBusiness = isRejected ? { ...business, ...localDraft } : business;

  const certsCount = certifications.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span>Mi negocio</span>
        <span className="opacity-50">/</span>
        <span className="text-body font-medium">Perfil</span>
      </nav>

      {/* Banner de estado */}
      <StatusBanner status={business.status} rejectionReason={business.rejectionReason} />

      {/* Panel de reenvío — solo visible cuando está rechazado */}
      {isRejected && (
        <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-card-bg border border-edge">
          <div className="min-w-0">
            <p className="text-sm font-medium text-body">¿Listo para reenviar tu negocio a revisión?</p>
            <p className="text-xs text-muted mt-0.5">
              {hasPendingChanges
                ? 'Tienes cambios pendientes. Edita todo lo necesario antes de enviar.'
                : 'Edita la información necesaria y luego pulsa "Enviar petición".'}
            </p>
          </div>
          <button
            onClick={handleSubmitPetition}
            disabled={submitting}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-dark hover:bg-primary-darkest text-white text-sm font-medium transition-colors disabled:opacity-70"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando…</>
              : <><Send className="w-4 h-4" />Enviar petición</>
            }
          </button>
        </div>
      )}

      {/* Cover */}
      <BusinessCover business={displayBusiness} onSave={fullSave} />

      {/* Header con logo solapando el cover */}
      <OwnerProfileHeader business={displayBusiness} categories={categories} onSave={basicSave} />

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-edge overflow-hidden">
        {TABS.map((tab) => {
          const count = tab.id === 'certs' && certsCount > 0 ? certsCount : null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px shrink-0 ${
                activeTab === tab.id
                  ? 'border-primary-dark text-primary-dark'
                  : 'border-transparent text-muted hover:text-body'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {count !== null && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-primary-softest text-primary-dark' : 'bg-edge text-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido principal + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-10">
        <div>
          {activeTab === 'info'  && <TabInfo business={displayBusiness} save={save} basicSave={basicSave} canManage={canManage} allTags={allTags} onGoToProducts={() => setActiveTab('prods')} />}
          {activeTab === 'prods' && <TabProducts businessId={id} canManage={canManage} />}
          {activeTab === 'certs' && <TabCertifications certifications={certifications} />}
        </div>
        <OwnerSidebar business={displayBusiness} certifications={certifications} basicSave={basicSave} fullSave={fullSave} canManage={canManage} />
      </div>

    </div>
  );
}
