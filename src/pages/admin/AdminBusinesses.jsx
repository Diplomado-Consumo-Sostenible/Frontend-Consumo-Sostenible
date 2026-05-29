import { AlertTriangle, Building2, CalendarDays, CheckCircle, ChevronLeft, ChevronRight, Edit2, Eye, Globe, LayoutDashboard, LayoutGrid, LayoutList, Loader2, Mail, MapPin, Phone, Search, Tag as TagIcon, Trash2, X, XCircle } from 'lucide-react';
import ModalOverlay from '../../Components/ui/ModalOverlay';
import { useCallback, useEffect, useState } from 'react';
import { MunicipioForm } from '../../Components/business/profile/BusinessLocationCard';
import Button from '../../Components/button';
import BusinessDetailModal from '../../Components/ui/BusinessDetailModal';
import API from '../../api/api';
import { useToastContext } from '../../context/ToastContext';
import { changeBusinessStatus, deleteBusiness, getBusinessesForAdmin, toggleBusinessActive, updateBusiness } from '../../services/business/business.admin.service';

const STATUS = { ALL: '', PENDING: 'Pending', ACTIVE: 'Active', REJECTED: 'Rejected' };
const STATUS_LABELS = { Pending: 'Pendiente', Active: 'Aprobado', Rejected: 'Rechazado' };
const STATUS_STYLES = { Pending: 'bg-amber-50 text-amber-700', Active: 'bg-primary-softest text-primary-dark', Rejected: 'bg-red-50 text-red-600' };
const STATUS_DOT = { Pending: 'bg-amber-500', Active: 'bg-primary-mid', Rejected: 'bg-red-500' };
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
  departamentoId: null, 
  municipioId: null,
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
    <div className="w-8 h-8 rounded-lg bg-primary-softest flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-primary-dark">{name?.charAt(0)?.toUpperCase() || '?'}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'bg-app-bg text-muted'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || 'bg-muted'}`} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg';
const sel = `${inp} cursor-pointer`;

function Field({ label, error, children, half }) {
  return (
    <div className={`flex flex-col gap-1.5 ${half ? '' : ''}`}>
      <label className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</label>
      {children}
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
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
    <ModalOverlay onClose={onCancel}>
      <div className="relative bg-card-bg rounded-2xl shadow-warm w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
          <h2 className="text-base font-semibold text-heading">Rechazar negocio</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-muted hover:text-body hover:bg-app-bg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted">
            Estás rechazando <span className="font-semibold text-body">{business?.businessName}</span>. Indica el motivo.
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
            <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg disabled:opacity-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar rechazo
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─── Delete confirm ─────────────────────────────────────────────────────── */
function DeleteConfirm({ business, onConfirm, onCancel, loading }) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="relative bg-card-bg rounded-2xl shadow-warm w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-heading">Eliminar negocio</h3>
            <p className="text-sm text-muted mt-1">
              ¿Eliminar permanentemente <span className="font-medium text-body">{business?.businessName}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg disabled:opacity-50 transition-colors">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Eliminar
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─── Business form drawer (solo edición) ───────────────────────────────── */
function BusinessFormDrawer({ open, onClose, onSaved, editTarget, categories, tags }) {
  const toast = useToastContext();
  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !editTarget) return;
    setForm({
      businessName:  editTarget.businessName  || '',
      description:   editTarget.description   || '',
      logo:          editTarget.logo          || '',
      address:       editTarget.address       || '',
      phone:         editTarget.phone         || '',
      emailBusiness: editTarget.emailBusiness || '',
      website:       editTarget.website       || '',
      instagramUrl:  editTarget.instagramUrl  || '',
      facebookUrl:   editTarget.facebookUrl   || '',
      xUrl:          editTarget.xUrl          || '',
      categoryId:    editTarget.category?.id_category?.toString() || '',
      tagIds:        editTarget.tags?.map((t) => t.id_tags) || [],
      departamentoId: editTarget.municipio?.departamento?.id_departamento ?? null,
      municipioId:    editTarget.municipio?.id_municipio ?? null,
    });
    setErrors({});
  }, [open, editTarget]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleTag = (id) => set('tagIds', form.tagIds.includes(id) ? form.tagIds.filter((t) => t !== id) : [...form.tagIds, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    setLoading(true);
    try {
      const payload = {
        businessName: form.businessName.trim(),
        description:  form.description.trim(),
        address:      form.address.trim(),
        categoryId:   parseInt(form.categoryId),
        tagIds:       form.tagIds,
        ...(form.logo          && { logo:          form.logo.trim() }),
        ...(form.phone         && { phone:         form.phone.trim() }),
        ...(form.emailBusiness && { emailBusiness: form.emailBusiness.trim() }),
        ...(form.website       && { website:       form.website.trim() }),
        ...(form.instagramUrl  && { instagramUrl:  form.instagramUrl.trim() }),
        ...(form.facebookUrl   && { facebookUrl:   form.facebookUrl.trim() }),
        ...(form.xUrl          && { xUrl:          form.xUrl.trim() }),
      };
      // Solo incluir municipioId si tiene valor (null causaría error en el backend)
      if (form.municipioId != null) payload.municipioId = form.municipioId;
      const res = await updateBusiness(editTarget.id_business, payload);
      toast.success(res?.message || 'Negocio actualizado exitosamente');
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
      <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-card-bg shadow-warm flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge shrink-0">
          <div>
            <h2 className="text-base font-semibold text-heading">Editar negocio</h2>
            <p className="text-xs text-muted mt-0.5">{editTarget?.businessName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-muted hover:text-body hover:bg-app-bg transition-colors">
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
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Información básica</p>
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
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Contacto y ubicación</p>
            <Field label="Dirección">
              <input type="text" placeholder="Calle 123 #45-67, Barrio Centro" value={form.address} onChange={(e) => set('address', e.target.value)} className={inp} />
            </Field>

            {/* Departamento / Municipio */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Departamento y municipio</p>
              <MunicipioForm
                values={{ departamentoId: form.departamentoId, municipioId: form.municipioId }}
                onChange={(v) => setForm((f) => ({ ...f, departamentoId: v.departamentoId, municipioId: v.municipioId }))}
              />
            </div>

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
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Redes sociales y web</p>
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
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Productos / etiquetas sostenibles</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const selected = form.tagIds.includes(t.id_tags);
                  return (
                    <button type="button" key={t.id_tags} onClick={() => toggleTag(t.id_tags)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected ? 'bg-primary-dark text-on-dark-active border-primary-dark' : 'bg-card-bg text-body border-edge hover:border-primary-light'}`}>
                      <TagIcon className="w-3 h-3" />
                      {t.tag}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted">{form.tagIds.length} seleccionados</p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-edge flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-dark text-sm font-medium text-on-dark-active hover:bg-primary-darkest transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Business review card (card view) ──────────────────────────────────── */
function BusinessReviewCard({ business, onApprove, onReject, onDetail, actionLoading }) {
  const isLoading = actionLoading === business.id_business;
  const { status, isActive } = business;
  const hasSocial = business.instagramUrl || business.facebookUrl || business.xUrl;

  const formattedDate = business.createdAt
    ? new Date(business.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="bg-card-bg rounded-2xl border border-edge shadow-warm-sm flex flex-col overflow-hidden">
      {/* Header: avatar + nombre + badge */}
      <div className="flex items-start justify-between p-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <BusinessAvatar logo={business.logo} name={business.businessName} onPreview={() => {}} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading truncate">{business.businessName}</p>
            <p className="text-xs text-muted truncate">{business.user?.email || '—'}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Motivo de rechazo */}
      {status === 'Rejected' && business.rejectionReason && (
        <div className="mx-4 mb-3 px-3 py-2 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{business.rejectionReason}</p>
        </div>
      )}

      <div className="px-4 pb-4 flex flex-col gap-3 flex-1">
        {/* Descripción */}
        {business.description && (
          <p className="text-xs text-muted line-clamp-3 leading-relaxed">{business.description}</p>
        )}

        {/* Categoría y tags */}
        {(business.category?.category || business.tags?.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {business.category?.category && (
              <span className="text-xs font-medium bg-primary-softest text-primary-dark px-2.5 py-0.5 rounded-full border border-edge">
                {business.category.category}
              </span>
            )}
            {business.tags?.map((t) => (
              <span key={t.id_tags} className="text-xs bg-app-bg text-body px-2 py-0.5 rounded-full border border-edge">
                {t.tag}
              </span>
            ))}
          </div>
        )}

        {/* Contacto */}
        {(business.address || business.municipio || business.phone || business.emailBusiness || business.website) && (
          <div className="space-y-1.5">
            {business.municipio?.nombre && (
              <div className="flex items-center gap-1.5 text-xs text-primary-dark font-medium">
                <MapPin className="w-3 h-3 text-primary-mid shrink-0" />
                <span>
                  {[business.municipio.departamento?.nombre, business.municipio.nombre]
                    .filter(Boolean).join(' · ')}
                </span>
              </div>
            )}
            {business.address && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="w-3 h-3 text-muted shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Phone className="w-3 h-3 text-muted shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.emailBusiness && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Mail className="w-3 h-3 text-muted shrink-0" />
                <span className="truncate">{business.emailBusiness}</span>
              </div>
            )}
            {business.website && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Globe className="w-3 h-3 text-muted shrink-0" />
                <span className="truncate">{business.website}</span>
              </div>
            )}
          </div>
        )}

        {/* Redes sociales */}
        <div className="flex items-center gap-3 flex-wrap">
          {hasSocial ? (
            <>
              {business.instagramUrl && (
                <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-pink-500 transition-colors">Instagram</a>
              )}
              {business.facebookUrl && (
                <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-blue-600 transition-colors">Facebook</a>
              )}
              {business.xUrl && (
                <a href={business.xUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-body transition-colors">X</a>
              )}
            </>
          ) : (
            <p className="text-xs text-muted italic">Sin redes registradas</p>
          )}
        </div>

        {/* Meta: fecha y estado activo */}
        <div className="flex items-center gap-4 text-xs text-muted border-t border-edge/40 pt-3 mt-auto">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formattedDate}
            </span>
          )}
          <span className={`flex items-center gap-1 ${isActive ? 'text-primary-mid' : 'text-muted'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary-mid' : 'bg-edge'}`} />
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-2">
          <Button
            className="!w-auto !py-1.5 !px-3 !text-xs !rounded-lg !bg-none !from-transparent !to-transparent bg-card-bg !text-body border border-edge hover:bg-app-bg"
            onClick={() => onDetail(business)}
          >
            <Eye className="w-3 h-3" /> Ver detalle
          </Button>

          {status === 'Pending' && (
            <>
              <Button
                className="!w-auto !py-1.5 !px-3 !text-xs !rounded-lg"
                onClick={() => onApprove(business)}
                loading={isLoading}
              >
                <CheckCircle className="w-3 h-3" /> Aprobar
              </Button>
              <Button
                className="!w-auto !py-1.5 !px-3 !text-xs !rounded-lg !from-red-500 !to-red-500 hover:!from-red-600 hover:!to-red-600"
                onClick={() => onReject(business)}
                loading={isLoading}
              >
                <XCircle className="w-3 h-3" /> Rechazar
              </Button>
            </>
          )}

          {status === 'Rejected' && (
            <Button
              className="!w-auto !py-1.5 !px-3 !text-xs !rounded-lg"
              onClick={() => onApprove(business)}
              loading={isLoading}
            >
              <CheckCircle className="w-3 h-3" /> Revertir y aprobar
            </Button>
          )}

          {status === 'Active' && (
            <Button
              className="!w-auto !py-1.5 !px-3 !text-xs !rounded-lg !from-red-500 !to-red-500 hover:!from-red-600 hover:!to-red-600"
              onClick={() => onReject(business)}
              loading={isLoading}
            >
              <XCircle className="w-3 h-3" /> Revocar
            </Button>
          )}
        </div>
      </div>
    </div>
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

  const [viewMode, setViewMode] = useState('table');
  const [detailBusiness, setDetailBusiness] = useState(null);

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
      setTotal(res.meta?.totalItems ?? res.total ?? 0);
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

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

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

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Administrador</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-body font-medium">Negocios</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-primary-dark" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-heading">Moderación de Negocios</h1>
              <p className="text-sm text-muted mt-0.5">Revisa y gestiona los negocios de la plataforma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-app-bg p-1 rounded-xl w-fit border border-edge">
        {TABS.map((tab) => (
          <button key={tab.value} onClick={() => handleTabChange(tab.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.value ? 'bg-card-bg text-heading shadow-warm-sm' : 'text-muted hover:text-body'}`}>
            {tab.label}
            {tab.value === STATUS.PENDING && activeTab === STATUS.PENDING && total > 0 && <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">{total}</span>}
          </button>
        ))}
      </div>

      {/* Search + toggle de vista */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Buscar por nombre, propietario o categoría..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-edge text-sm text-body placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid transition-all bg-card-bg" />
        </div>
        <div className="flex items-center gap-1 p-1 bg-app-bg rounded-xl shrink-0 border border-edge">
          <button
            onClick={() => setViewMode('table')}
            title="Vista tabla"
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-card-bg shadow-warm-sm text-heading' : 'text-muted hover:text-body'}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            title="Vista cards"
            className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-card-bg shadow-warm-sm text-heading' : 'text-muted hover:text-body'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenido: tabla o cards */}
      {viewMode === 'table' ? (
        <div className="bg-card-bg rounded-2xl border border-edge overflow-hidden shadow-warm-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando negocios...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
              <Building2 className="w-10 h-10 opacity-30" />
              <p className="text-sm">{search ? 'No se encontraron resultados' : `No hay negocios ${activeTab ? `en estado "${STATUS_LABELS[activeTab]}"` : 'registrados'}`}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-edge bg-app-bg/50">
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
                <tbody className="divide-y divide-edge/40">
                  {filtered.map((business, idx) => {
                    const isLoading = actionLoading === business.id_business;
                    const { status, isActive } = business;
                    return (
                      <tr key={business.id_business} className="hover:bg-app-bg/50 transition-colors">
                        <td className="px-4 py-3.5 text-xs text-muted font-mono">{(page - 1) * LIMIT + idx + 1}</td>
                        <td className="px-4 py-3.5 overflow-visible">
                          <div className="flex items-center gap-3">
                            <BusinessAvatar logo={business.logo} name={business.businessName} onPreview={(src, alt) => setPreview({ src, alt })} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-body truncate max-w-[140px]">{business.businessName}</p>
                              {status === 'Rejected' && business.rejectionReason && (
                                <p title={business.rejectionReason} className="text-xs text-red-400 flex items-center gap-1 mt-0.5 truncate max-w-[140px]">
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  {business.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted">{business.user?.email || '—'}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-medium text-body bg-app-bg px-2.5 py-1 rounded-full border border-edge">{business.category?.category || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5 max-w-[180px]">
                          {business.municipio?.nombre && (
                            <div className="flex items-center gap-1 text-xs text-primary-dark font-medium mb-0.5">
                              <MapPin className="w-3 h-3 text-primary-mid shrink-0" />
                              <span className="truncate">
                                {[business.municipio.departamento?.nombre, business.municipio.nombre]
                                  .filter(Boolean).join(' · ')}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-muted truncate block">{business.address || (!business.municipio?.nombre ? '—' : '')}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-primary-dark' : 'text-muted'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary-mid' : 'bg-edge'}`} />
                            {isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              title="Ver detalle"
                              onClick={() => setDetailBusiness(business)}
                              className="p-1.5 rounded-lg text-muted hover:text-primary-dark hover:bg-primary-softest/50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <div className="w-px h-4 bg-edge mx-0.5" />

                            <button
                              title="Editar"
                              onClick={() => openEdit(business)}
                              disabled={isLoading}
                              className="p-1.5 rounded-lg text-muted hover:text-primary-dark hover:bg-primary-softest/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              title="Eliminar"
                              onClick={() => setDeleteTarget(business)}
                              disabled={isLoading}
                              className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
            <div className="px-5 py-3 border-t border-edge flex items-center justify-between">
              <span className="text-xs text-muted">
                <span className="font-semibold text-body">{total}</span> negocio{total !== 1 ? 's' : ''} en total
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Página anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted px-1">
                  Página <span className="font-semibold text-body">{page}</span> de{' '}
                  <span className="font-semibold text-body">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Página siguiente"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Vista cards */
        <>
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando negocios...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
              <Building2 className="w-10 h-10 opacity-30" />
              <p className="text-sm">{search ? 'No se encontraron resultados' : `No hay negocios ${activeTab ? `en estado "${STATUS_LABELS[activeTab]}"` : 'registrados'}`}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((b) => (
                <BusinessReviewCard
                  key={b.id_business}
                  business={b}
                  onApprove={handleApprove}
                  onReject={setRejectTarget}
                  onDetail={setDetailBusiness}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted">
                <span className="font-semibold text-body">{total}</span> negocio{total !== 1 ? 's' : ''} en total
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Página anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted px-1">
                  Página <span className="font-semibold text-body">{page}</span> de{' '}
                  <span className="font-semibold text-body">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Página siguiente"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-app-bg hover:text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals & Drawer */}
      {rejectTarget && <RejectModal business={rejectTarget} onConfirm={handleRejectConfirm} onCancel={() => setRejectTarget(null)} loading={actionLoading === rejectTarget.id_business} />}
      {deleteTarget && <DeleteConfirm business={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} loading={actionLoading === deleteTarget.id_business} />}
      <BusinessFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSaved={() => fetchBusinesses(activeTab, page)} editTarget={editTarget} categories={categories} tags={tags} />

      {preview && <PhotoPreviewModal src={preview.src} alt={preview.alt} onClose={() => setPreview(null)} />}
      {detailBusiness && (
        <BusinessDetailModal
          business={detailBusiness}
          onClose={() => setDetailBusiness(null)}
          footerSlot={
            <>
              {(detailBusiness.status === 'Pending' || detailBusiness.status === 'Rejected') && (
                <button
                  onClick={() => { handleApprove(detailBusiness); setDetailBusiness(null); }}
                  disabled={actionLoading === detailBusiness.id_business}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-dark text-on-dark-active text-sm font-semibold hover:bg-primary-darkest disabled:opacity-60 transition-colors"
                >
                  {actionLoading === detailBusiness.id_business
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />}
                  {detailBusiness.status === 'Rejected' ? 'Revertir y aprobar' : 'Aprobar'}
                </button>
              )}
              {(detailBusiness.status === 'Pending' || detailBusiness.status === 'Active') && (
                <button
                  onClick={() => { setRejectTarget(detailBusiness); setDetailBusiness(null); }}
                  disabled={actionLoading === detailBusiness.id_business}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-semibold hover:bg-red-100 disabled:opacity-60 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  {detailBusiness.status === 'Active' ? 'Revocar' : 'Rechazar'}
                </button>
              )}
            </>
          }
        />
      )}
    </div>
  );
}
