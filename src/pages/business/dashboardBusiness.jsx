import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart2,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  Edit,
  Globe,
  ImagePlus,
  LayoutDashboard,
  Leaf,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Star,
  Tag,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import BusinessProductsCarousel from '../../Components/business/BusinessProductsCarousel';
import PendingBanner from '../../Components/business/PendingBanner';
import RejectionBanner from '../../Components/business/RejectionBanner';
import { getMyBusinesses } from '../../services/business/busienss.service';

const POLL_INTERVAL = 15_000;

const DAY_LABELS = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};

const STATUS_CONFIG = {
  Active:   { label: 'Aprobado',  bg: 'bg-ok-bg   text-ok-text   border-ok-text/30'   },
  Pending:  { label: 'Pendiente', bg: 'bg-warn-bg  text-warn-text border-warn-text/30' },
  Rejected: { label: 'Rechazado', bg: 'bg-red-50   text-red-700   border-red-200'      },
};

// alwaysAccessible: true → nunca se bloquea aunque el negocio esté pendiente/rechazado
const QUICK_LINKS = [
  { label: 'Estadísticas',    desc: 'Métricas y rendimiento',  icon: BarChart2, to: '/dashboardBusiness/estadisticas',  iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   lockable: true  },
  { label: 'Certificaciones', desc: 'Sellos y certificados',   icon: Award,     to: '/dashboardBusiness/certificaciones', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', lockable: true  },
  { label: 'Productos',       desc: 'Gestiona tu catálogo',    icon: Package,   to: '/dashboardBusiness/productos',      iconBg: 'bg-orange-100', iconColor: 'text-orange-600', lockable: true  },
  { label: 'Mi perfil',       desc: 'Datos de tu cuenta',      icon: User,      to: '/dashboard/profile',               iconBg: 'bg-primary-softest', iconColor: 'text-primary-dark', lockable: false },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="px-4 py-5 sm:px-6 lg:pl-10 lg:pr-8 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-edge" />
        <div className="space-y-1.5">
          <div className="h-4 w-44 bg-edge rounded-full" />
          <div className="h-3 w-60 bg-edge rounded-full" />
        </div>
      </div>
      <div className="h-28 bg-edge rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-edge rounded-2xl" />)}
          </div>
          <div className="h-56 bg-edge rounded-2xl" />
          <div className="h-32 bg-edge rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-44 bg-edge rounded-2xl" />
          <div className="h-32 bg-edge rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] bg-card-bg rounded-2xl shadow p-8 text-center">
      <div className="w-16 h-16 bg-primary-softest rounded-2xl flex items-center justify-center mb-4">
        <Building2 className="w-8 h-8 text-muted" />
      </div>
      <h2 className="text-base font-semibold text-body">Aún no tienes un negocio</h2>
      <p className="text-sm text-muted mt-1.5 max-w-xs leading-relaxed">
        Registra tu negocio sostenible para comenzar a gestionarlo y llegar a más personas.
      </p>
      <button
        onClick={() => navigate('/dashboardBusiness/crear-negocio')}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-dark hover:bg-primary-darkest text-white text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Crear negocio
      </button>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[220px] bg-card-bg rounded-2xl shadow p-6 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <h2 className="text-base font-semibold text-body">Error al cargar</h2>
      <p className="text-sm text-muted mt-1 max-w-xs">{message}</p>
    </div>
  );
}

// ─── Quick Links ──────────────────────────────────────────────────────────────

function QuickLinksSection({ isBlocked }) {
  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Accesos rápidos</p>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map((item) => {
          const locked = isBlocked && item.lockable;

          const card = (
            <div className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all ${
              locked
                ? 'border-edge opacity-50 cursor-not-allowed select-none'
                : 'border-edge hover:border-primary-light hover:shadow-sm hover:bg-primary-softest/30 cursor-pointer'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                <item.icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-body leading-tight">{item.label}</p>
                <p className="text-xs text-muted mt-0.5 leading-tight">{item.desc}</p>
              </div>
              {locked && <Lock className="w-3.5 h-3.5 text-muted shrink-0" />}
            </div>
          );

          return locked ? (
            <div key={item.to}>{card}</div>
          ) : (
            <Link key={item.to} to={item.to}>{card}</Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Business Card ────────────────────────────────────────────────────────────

function BusinessCard({ business }) {
  const statusCfg   = STATUS_CONFIG[business.status] ?? STATUS_CONFIG.Pending;
  const hasSocial   = business.instagramUrl || business.facebookUrl || business.xUrl;
  const hasSchedule = business.schedule && Object.keys(business.schedule).length > 0;
  const hasTags     = business.tags?.length > 0;
  const isActive    = business.status === 'Active';

  return (
    <div className="bg-card-bg rounded-2xl shadow overflow-hidden">

      {/* Identity header */}
      <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <div className="flex items-start gap-4">
          {business.logo ? (
            <img src={business.logo} alt={business.businessName} className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-muted" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-heading leading-tight truncate">{business.businessName}</h2>
                {business.category?.category && (
                  <span className="inline-block text-xs text-muted bg-primary-softest border border-edge rounded-full px-2 py-0.5 mt-1">
                    {business.category.category}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusCfg.bg}`}>{statusCfg.label}</span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${business.isActive ? 'bg-ok-bg text-ok-text border-ok-text/30' : 'bg-primary-softest text-muted border-edge'}`}>
                  {business.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip — solo cuando está activo */}
      {isActive && (
        <div className="px-5 sm:px-6 pb-4 flex items-center gap-6 border-b border-edge/40">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-heading leading-none">{business.followers_count ?? 0}</p>
              <p className="text-[10px] text-muted mt-0.5">Seguidores</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
              <Star className="w-3.5 h-3.5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-heading leading-none">
                {business.average_rating ? Number(business.average_rating).toFixed(1) : '—'}
              </p>
              <p className="text-[10px] text-muted mt-0.5">Calificación</p>
            </div>
          </div>
          {business.total_reviews != null && (
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <BarChart2 className="w-3.5 h-3.5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-heading leading-none">{business.total_reviews}</p>
                <p className="text-[10px] text-muted mt-0.5">Reseñas</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="px-5 sm:px-6 py-4 space-y-4">
        {business.description && (
          <p className="text-sm text-body leading-relaxed">{business.description}</p>
        )}

        {hasTags && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-muted shrink-0" />
            {business.tags.map((t) => (
              <span key={t.id_tags} className="text-xs px-2 py-0.5 bg-primary-softest border border-edge rounded-full text-body">
                {t.name ?? t.tagName ?? t.tag ?? '—'}
              </span>
            ))}
          </div>
        )}

        {/* Contact grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
          {business.address && (
            <div className="flex items-start gap-2 text-xs text-body min-w-0">
              <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
              <span className="break-words">{business.address}</span>
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
              <span className="truncate">{business.emailBusiness}</span>
            </div>
          )}
          {business.website && (
            <div className="flex items-center gap-2 text-xs min-w-0">
              <Globe className="w-3.5 h-3.5 text-muted shrink-0" />
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="truncate text-primary-dark hover:text-primary-darkest transition-colors">
                {business.website}
              </a>
            </div>
          )}
        </div>

        {/* Social */}
        {hasSocial && (
          <div className="flex items-center gap-3 flex-wrap">
            {business.instagramUrl && (
              <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-edge text-muted hover:text-pink-600 hover:border-pink-200 transition-colors">
                <FaInstagram className="w-3 h-3" /> Instagram
              </a>
            )}
            {business.facebookUrl && (
              <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-edge text-muted hover:text-blue-600 hover:border-blue-200 transition-colors">
                <FaFacebook className="w-3 h-3" /> Facebook
              </a>
            )}
            {business.xUrl && (
              <a href={business.xUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-edge text-muted hover:text-heading hover:border-edge transition-colors">
                <FaXTwitter className="w-3 h-3" /> X
              </a>
            )}
          </div>
        )}

        {/* Schedule */}
        <div className="pt-3 border-t border-edge/40 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted" />
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Horario</p>
          </div>
          {hasSchedule ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
              {Object.entries(business.schedule).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-body font-medium">{DAY_LABELS[day] ?? day}</span>
                  <span className="text-muted">{hours}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted italic">Sin horario especificado</p>
          )}
        </div>

        {business.createdAt && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-edge/40">
            <CalendarDays className="w-3.5 h-3.5 text-muted" />
            <p className="text-xs text-muted">
              Registrado el{' '}
              {new Date(business.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
        <Link
          to="/dashboardBusiness/perfil"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary-dark hover:bg-primary-darkest text-on-dark-active text-sm font-medium transition-colors"
        >
          <Edit className="w-4 h-4" />
          Editar negocio
        </Link>
      </div>
    </div>
  );
}

// ─── Profile Completion ───────────────────────────────────────────────────────

function calcProgress(biz) {
  if (!biz) return { pct: 0, items: [] };
  const checks = [
    { label: 'Nombre',          done: !!biz.businessName },
    { label: 'Descripción',     done: !!biz.description  },
    { label: 'Logo',            done: !!biz.logo         },
    { label: 'Imágenes',        done: !!(biz.images?.length > 0) },
    { label: 'Dirección',       done: !!biz.address      },
    { label: 'Contacto',        done: !!(biz.phone || biz.emailBusiness) },
    { label: 'Horarios',        done: !!(biz.schedule && Object.keys(biz.schedule).length > 0) },
    { label: 'Categoría',       done: !!biz.category     },
    { label: 'Etiquetas',       done: !!(biz.tags?.length > 0) },
    { label: 'Web o redes',     done: !!(biz.website || biz.instagramUrl || biz.facebookUrl || biz.xUrl) },
  ];
  const done = checks.filter((c) => c.done).length;
  return { pct: Math.round((done / checks.length) * 100), items: checks };
}

function ProfileCompletion({ business }) {
  const { pct, items } = calcProgress(business);
  const barColor = pct >= 80 ? 'bg-primary-mid'    : pct >= 50 ? 'bg-earth-mid'   : 'bg-red-400';
  const pctColor = pct >= 80 ? 'text-primary-dark'  : pct >= 50 ? 'text-earth-mid' : 'text-red-500';
  const pending  = items.filter((i) => !i.done);
  const done     = items.filter((i) => i.done);

  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-heading">Perfil del negocio</h3>
        <span className={`text-sm font-bold ${pctColor}`}>{pct}%</span>
      </div>

      <div className="space-y-1">
        <div className="w-full h-2.5 bg-edge rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-muted">{done.length} de {items.length} campos completos</p>
      </div>

      {pending.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted">Pendiente:</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {pending.map((v) => (
              <div key={v.label} className="flex items-center gap-1.5 text-xs text-muted">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-primary-dark font-medium">
          <CheckCircle2 className="w-4 h-4" />
          ¡Perfil completo al 100%!
        </div>
      )}

      <Link
        to="/dashboardBusiness/perfil"
        className="block text-center text-xs font-medium py-2 px-4 border border-primary-dark text-primary-dark rounded-xl hover:bg-primary-dark hover:text-on-dark-active transition-colors"
      >
        Completar perfil
      </Link>
    </div>
  );
}

// ─── Sidebar widgets ──────────────────────────────────────────────────────────

function Recommendations() {
  const tips = [
    { text: 'Agrega imágenes de calidad a tu galería',      icon: Camera   },
    { text: 'Completa la descripción de tu negocio',         icon: Edit     },
    { text: 'Añade categorías y etiquetas relevantes',       icon: Tag      },
  ];
  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-primary-mid" />
        <h3 className="text-sm font-semibold text-heading">Recomendaciones</h3>
      </div>
      <ul className="space-y-3">
        {tips.map(({ text, icon: Icon }, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className="w-6 h-6 shrink-0 rounded-lg bg-primary-softest flex items-center justify-center mt-0.5">
              <Icon className="w-3 h-3 text-primary-dark" />
            </div>
            <span className="text-xs text-body leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertBadge() {
  const practices = ['Materiales reciclados', 'Reducción de CO₂', 'Comercio local y justo'];
  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-primary-mid" />
          <h3 className="text-sm font-semibold text-heading">Certificaciones</h3>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 bg-ok-bg text-ok-text border border-ok-text/30 rounded-full">Intermedio</span>
      </div>
      <ul className="space-y-2">
        {practices.map((p) => (
          <li key={p} className="flex items-center gap-2 text-xs text-body">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary-mid shrink-0" />
            {p}
          </li>
        ))}
      </ul>
      <Link to="/dashboardBusiness/certificaciones" className="flex items-center justify-center gap-1 text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors">
        Ver todas <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function BlockedSideWidget({ status }) {
  const isRejected = status === 'Rejected';
  const steps = isRejected
    ? ['Revisa el motivo de rechazo', 'Corrige la información de tu negocio', 'Espera la nueva revisión']
    : ['Tu negocio fue enviado', 'El equipo lo está revisando', 'Recibirás una notificación'];

  return (
    <div className={`rounded-2xl p-5 space-y-4 border ${isRejected ? 'bg-red-50 border-red-200' : 'bg-warn-bg border-warn-text/25'}`}>
      <div className="flex items-start gap-2.5">
        <Lock className={`w-4 h-4 shrink-0 mt-0.5 ${isRejected ? 'text-red-500' : 'text-warn-text'}`} />
        <div>
          <p className={`text-xs font-semibold ${isRejected ? 'text-red-700' : 'text-warn-text'}`}>
            {isRejected ? '¿Qué hacer ahora?' : 'Próximos pasos'}
          </p>
        </div>
      </div>

      <ol className="space-y-2 pl-1">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
              isRejected ? 'bg-red-200 text-red-700' : 'bg-warn-text/20 text-warn-text'
            }`}>
              {i + 1}
            </span>
            <span className={`text-xs leading-relaxed ${isRejected ? 'text-red-700' : 'text-warn-text/90'}`}>{step}</span>
          </li>
        ))}
      </ol>

      <Link
        to="/dashboardBusiness/perfil"
        className={`block text-center text-xs font-medium py-2 px-3 rounded-xl transition-colors ${
          isRejected ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-warn-text hover:opacity-90 text-white'
        }`}
      >
        {isRejected ? 'Editar negocio' : 'Completar información'}
      </Link>
    </div>
  );
}

// ─── Active-only: Gallery + Quick Actions ─────────────────────────────────────

function Gallery() {
  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold text-heading">Galería</h3>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors">
          <ImagePlus className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-primary-softest rounded-xl flex items-center justify-center hover:bg-primary-light/40 transition-colors cursor-pointer group">
            <Camera className="w-5 h-5 text-muted group-hover:text-primary-dark transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: 'Editar',          icon: Edit,    color: 'bg-primary-softest text-primary-dark', to: '/dashboardBusiness/perfil'          },
    { label: 'Subir fotos',     icon: Camera,  color: 'bg-blue-50 text-blue-600',              to: null                                 },
    { label: 'Certificaciones', icon: Award,   color: 'bg-violet-50 text-violet-600',          to: '/dashboardBusiness/certificaciones' },
    { label: 'Productos',       icon: Package, color: 'bg-orange-50 text-orange-600',          to: '/dashboardBusiness/productos'       },
  ];
  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <h3 className="text-sm font-semibold text-heading">Acciones rápidas</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => {
          const inner = (
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-edge hover:border-primary-light hover:shadow-sm hover:bg-primary-softest/30 transition-all text-center w-full">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-body leading-tight">{action.label}</span>
            </div>
          );
          return action.to
            ? <Link key={action.label} to={action.to}>{inner}</Link>
            : <button key={action.label} type="button" className="w-full">{inner}</button>;
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardBusiness() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const mountedRef                  = useRef(true);

  const fetchBusinesses = (isInitial = false) => {
    getMyBusinesses()
      .then((data) => {
        if (!mountedRef.current) return;
        setBusinesses(Array.isArray(data) ? data : []);
        if (isInitial) setError(null);
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        if (isInitial) setError(err.message || 'No se pudo cargar la información');
      })
      .finally(() => {
        if (mountedRef.current && isInitial) setLoading(false);
      });
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchBusinesses(true);
    const interval = setInterval(() => fetchBusinesses(false), POLL_INTERVAL);
    return () => { mountedRef.current = false; clearInterval(interval); };
  }, []);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} />;

  const biz        = businesses[0] ?? null;
  const status     = biz?.status ?? null;
  const isBlocked  = status === 'Pending' || status === 'Rejected';
  const isRejected = status === 'Rejected';
  const isPending  = status === 'Pending';

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:pl-10 lg:pr-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-primary-dark" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <LayoutDashboard className="w-3 h-3 text-muted" />
            <span className="text-xs text-muted">Mi Negocio</span>
          </div>
          <h1 className="text-lg sm:text-xl font-serif text-heading leading-tight">Panel de mi negocio</h1>
        </div>
      </div>

      {/* Status banners */}
      {isRejected && <RejectionBanner rejectionReason={biz?.rejectionReason} />}
      {isPending  && <PendingBanner />}

      {/* Empty */}
      {businesses.length === 0 && <EmptyState />}

      {/* ── BLOCKED (Pending / Rejected) ── */}
      {biz && isBlocked && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <QuickLinksSection isBlocked />
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Resumen del negocio</p>
              <BusinessCard business={biz} />
            </div>
          </div>
          <div className="space-y-5">
            <ProfileCompletion business={biz} />
            <BlockedSideWidget status={status} />
          </div>
        </div>
      )}

      {/* ── ACTIVE ── */}
      {biz && !isBlocked && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <QuickLinksSection isBlocked={false} />
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Resumen del negocio</p>
              {businesses.map((b) => <BusinessCard key={b.id_business} business={b} />)}
            </div>
            <BusinessProductsCarousel businessId={biz.id_business} />
            <Gallery />
            <QuickActions />
          </div>
          <div className="space-y-5">
            <ProfileCompletion business={biz} />
            <Recommendations />
            <CertBadge />
          </div>
        </div>
      )}
    </div>
  );
}
