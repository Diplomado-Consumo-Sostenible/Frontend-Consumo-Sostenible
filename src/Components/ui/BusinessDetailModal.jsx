import {
  Award,
  Building2,
  CalendarDays,
  Clock,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useToastContext } from '../../context/ToastContext';
import useFollow from '../../hooks/useFollow';

const DAY_LABELS = {
  monday:    'Lunes',
  tuesday:   'Martes',
  wednesday: 'Miércoles',
  thursday:  'Jueves',
  friday:    'Viernes',
  saturday:  'Sábado',
  sunday:    'Domingo',
};

const tagName = (t) => t.name ?? t.tagName ?? t.tag ?? '';

export default function BusinessDetailModal({ business, onClose }) {
  const { success, error: toastError } = useToastContext();
  const { isFollowing, toggle, loading, initializing, isAuthenticated } =
    useFollow(business.id_business);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toastError('Inicia sesión para seguir negocios');
      return;
    }
    try {
      const result = await toggle();
      if (result) {
        result.nowFollowing
          ? success(`¡Ahora sigues a ${business.businessName}!`)
          : success(`Dejaste de seguir a ${business.businessName}`);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) toastError('Sesión expirada. Inicia sesión de nuevo');
      else if (status === 409) toastError('Ya sigues a este negocio');
      else if (status === 404) toastError('Negocio no disponible');
      else toastError('No se pudo completar la acción');
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const hasSocial   = business.instagramUrl || business.facebookUrl || business.xUrl;
  const hasSchedule = business.schedule && Object.keys(business.schedule).length > 0;
  const hasTags     = business.tags?.length > 0;
  const hasCerts    = business.certifications?.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative bg-card-bg w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-edge" />
        </div>

        <div className="flex items-start justify-between px-5 pt-4 pb-4 shrink-0 border-b border-edge/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden bg-primary-softest flex items-center justify-center">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-7 h-7 text-muted" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-heading leading-tight">
                {business.businessName}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {business.category?.category && (
                  <span className="text-xs px-2 py-0.5 bg-primary-softest border border-edge rounded-full text-body">
                    {business.category.category}
                  </span>
                )}
                {hasCerts && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-ok-bg border border-ok-text/30 rounded-full text-ok-text">
                    <Award className="w-3 h-3" />
                    Certificado
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-xl hover:bg-edge transition-colors ml-3 mt-0.5"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {business.description && (
            <p className="text-sm text-body leading-relaxed">{business.description}</p>
          )}

          {(business.address || business.phone || business.emailBusiness || business.website) && (
            <div className="space-y-2 pt-1 border-t border-edge/40">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider pt-2">
                Contacto
              </p>
              <div className="space-y-2">
                {business.address && (
                  <div className="flex items-start gap-2 text-xs text-body">
                    <MapPin className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" />
                    <span>{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-2 text-xs text-body">
                    <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>{business.phone}</span>
                  </div>
                )}
                {business.emailBusiness && (
                  <div className="flex items-center gap-2 text-xs text-body min-w-0">
                    <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                    <a
                      href={`mailto:${business.emailBusiness}`}
                      className="truncate hover:text-primary-dark transition-colors"
                    >
                      {business.emailBusiness}
                    </a>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-2 text-xs text-body min-w-0">
                    <Globe className="w-3.5 h-3.5 text-muted shrink-0" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-primary-dark transition-colors"
                    >
                      {business.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasSocial && (
            <div className="flex items-center gap-4 flex-wrap pt-3 border-t border-edge/40">
              {business.instagramUrl && (
                <a
                  href={business.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-pink-600 transition-colors"
                >
                  <FaInstagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
              )}
              {business.facebookUrl && (
                <a
                  href={business.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-blue-600 transition-colors"
                >
                  <FaFacebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              )}
              {business.xUrl && (
                <a
                  href={business.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-heading transition-colors"
                >
                  <FaXTwitter className="w-3.5 h-3.5" />
                  <span>X</span>
                </a>
              )}
            </div>
          )}

          {hasSchedule && (
            <div className="space-y-2 pt-3 border-t border-edge/40">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted" />
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Horario</p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {Object.entries(business.schedule).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between text-xs">
                    <span className="text-body">{DAY_LABELS[day] ?? day}</span>
                    <span className="text-muted">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasTags && (
            <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-edge/40">
              <Tag className="w-3.5 h-3.5 text-muted shrink-0" />
              {business.tags.map((t) => (
                <span
                  key={t.id_tags ?? tagName(t)}
                  className="text-xs px-2 py-0.5 bg-primary-softest border border-edge rounded-full text-body"
                >
                  {tagName(t)}
                </span>
              ))}
            </div>
          )}

          {business.createdAt && (
            <div className="flex items-center gap-1.5 pt-3 border-t border-edge/40">
              <CalendarDays className="w-3.5 h-3.5 text-muted" />
              <p className="text-xs text-muted">
                Registrado el{' '}
                {new Date(business.createdAt).toLocaleDateString('es-CO', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-3 border-t border-edge/40">
            <Star className="w-3.5 h-3.5 text-muted" />
            <p className="text-xs text-muted italic">
              Valoraciones disponibles próximamente
            </p>
          </div>
        </div>

        {/* Footer: botón Seguir */}
        <div className="px-5 py-4 border-t border-edge/40 shrink-0">
          <button
            onClick={handleFollow}
            disabled={initializing || loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              isFollowing
                ? 'bg-primary-softest text-primary-dark border border-edge hover:bg-primary-light'
                : 'bg-primary-dark text-on-dark-active hover:bg-primary-darkest'
            }`}
          >
            {initializing || loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserCheck className="w-4 h-4" />
                Siguiendo
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Seguir negocio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
