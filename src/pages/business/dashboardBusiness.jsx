import { AlertCircle, AlertTriangle, Award, BarChart2, Building2, CalendarDays, Camera, CheckCircle2, Clock, Edit, Globe, ImagePlus, LayoutDashboard, Leaf, Lightbulb, Lock, Mail, MapPin, Phone, Plus, Tag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import BusinessProductsCarousel from '../../Components/business/BusinessProductsCarousel';
import { getMyBusinesses } from '../../services/business/busienss.service';

const POLL_INTERVAL = 15_000;

const DAY_LABELS = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const STATUS_CONFIG = {
  Active:   { label: 'Aprobado',  bg: 'bg-ok-bg   text-ok-text   border-ok-text/30'  },
  Pending:  { label: 'Pendiente', bg: 'bg-warn-bg  text-warn-text border-warn-text/30' },
  Rejected: { label: 'Rechazado', bg: 'bg-red-50   text-red-700   border-red-200'      },
};

const QUICK_LINKS = [
  { label: 'Estadísticas',   desc: 'Métricas y rendimiento', icon: BarChart2, to: '/dashboardBusiness/estadisticas',  color: 'bg-blue-50 text-blue-600'     },
  { label: 'Certificaciones', desc: 'Sellos y certificados', icon: Award,     to: '/dashboardBusiness/certificaciones', color: 'bg-violet-50 text-violet-600' },
];

const QUICK_ACTIONS = [
  { label: 'Editar negocio',  icon: Edit,   color: 'bg-primary-softest text-primary-dark', to: null },
  { label: 'Subir fotos',     icon: Camera, color: 'bg-blue-50 text-blue-600',              to: null },
  { label: 'Certificaciones', icon: Award,  color: 'bg-violet-50 text-violet-600',          to: '/dashboardBusiness/certificaciones' },
  { label: 'Ubicación',       icon: MapPin, color: 'bg-primary-softest text-primary-mid',   to: null },
];

function LoadingState() {
  return (
    <div className="px-4 py-5 sm:px-6 lg:pl-10 lg:pr-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-edge rounded-full" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-edge" />
          <div className="space-y-1.5">
            <div className="h-4 w-40 bg-edge rounded-full" />
            <div className="h-3 w-56 bg-edge rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 bg-edge rounded-2xl" />
          <div className="h-32 bg-edge rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-edge rounded-2xl" />
          <div className="h-32 bg-edge rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[220px] bg-card-bg rounded-2xl shadow p-6 text-center">
      <div className="w-14 h-14 bg-primary-softest rounded-2xl flex items-center justify-center mb-4">
        <Building2 className="w-7 h-7 text-muted" />
      </div>
      <h2 className="text-base font-semibold text-body">Aún no tienes un negocio</h2>
      <p className="text-sm text-muted mt-1 max-w-xs">Registra tu negocio para comenzar a gestionarlo desde este panel.</p>
      <button
        onClick={() => navigate('/dashboardBusiness/crear-negocio')}
        className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
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

function BusinessCard({ business }) {
  const statusCfg   = STATUS_CONFIG[business.status] ?? STATUS_CONFIG.Pending;
  const hasSocial   = business.instagramUrl || business.facebookUrl || business.xUrl;
  const hasSchedule = business.schedule && Object.keys(business.schedule).length > 0;
  const hasTags     = business.tags?.length > 0;

  return (
    <div className="relative bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-1.5 flex-wrap justify-end">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusCfg.bg}`}>{statusCfg.label}</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${business.isActive ? 'bg-ok-bg text-ok-text border-ok-text/30' : 'bg-primary-softest text-muted border-edge'}`}>
          {business.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="flex items-center gap-3 pr-36 sm:pr-44">
        {business.logo ? (
          <img src={business.logo} alt={business.businessName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-muted" />
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-heading leading-tight">{business.businessName}</h2>
          {business.category?.category && (
            <span className="inline-block text-xs text-muted bg-primary-softest border border-edge rounded-full px-2 py-0.5 mt-1">
              {business.category.category}
            </span>
          )}
        </div>
      </div>

      {business.description && <p className="text-sm text-body leading-relaxed">{business.description}</p>}

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

      {business.status === 'Rejected' && business.rejectionReason && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 rounded-xl border border-red-100">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-700">Motivo de rechazo</p>
            <p className="text-xs text-red-600 mt-0.5">{business.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-edge/40">
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
          <div className="flex items-center gap-2 text-xs text-body min-w-0">
            <Globe className="w-3.5 h-3.5 text-muted shrink-0" />
            <a href={business.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-heading transition-colors">
              {business.website}
            </a>
          </div>
        )}
      </div>

      {hasSocial && (
        <div className="flex items-center gap-4 flex-wrap pt-1">
          {business.instagramUrl && (
            <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted hover:text-pink-600 transition-colors">
              <FaInstagram className="w-3.5 h-3.5" /><span>Instagram</span>
            </a>
          )}
          {business.facebookUrl && (
            <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted hover:text-blue-600 transition-colors">
              <FaFacebook className="w-3.5 h-3.5" /><span>Facebook</span>
            </a>
          )}
          {business.xUrl && (
            <a href={business.xUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted hover:text-heading transition-colors">
              <FaXTwitter className="w-3.5 h-3.5" /><span>X</span>
            </a>
          )}
        </div>
      )}

      <div className="pt-3 border-t border-edge/40 space-y-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted" />
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Horario</p>
        </div>
        {hasSchedule ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
            {Object.entries(business.schedule).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-body">{DAY_LABELS[day] ?? day}</span>
                <span className="text-muted">{hours}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted italic">Horario no especificado</p>
        )}
      </div>

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
    </div>
  );
}

function calcProgress(biz) {
  if (!biz) return { pct: 0, items: [] };
  const checks = [
    { label: 'Nombre del negocio', done: !!biz.businessName },
    { label: 'Descripción',        done: !!biz.description },
    { label: 'Logo',               done: !!biz.logo },
    { label: 'Imágenes',           done: !!(biz.images?.length > 0) },
    { label: 'Dirección',          done: !!biz.address },
    { label: 'Teléfono o email',   done: !!(biz.phone || biz.emailBusiness) },
    { label: 'Horarios',           done: !!(biz.schedule && Object.keys(biz.schedule).length > 0) },
    { label: 'Categoría',          done: !!biz.category },
    { label: 'Etiquetas',          done: !!(biz.tags?.length > 0) },
    { label: 'Sitio web o redes',  done: !!(biz.website || biz.instagramUrl || biz.facebookUrl || biz.xUrl) },
  ];
  const done = checks.filter((c) => c.done).length;
  return { pct: Math.round((done / checks.length) * 100), items: checks };
}

function ProfileStatus({ business, isBlocked }) {
  const { pct, items } = calcProgress(business);
  const barColor = pct >= 80 ? 'bg-primary-mid' : pct >= 50 ? 'bg-earth-mid' : 'bg-red-400';
  const pctColor = pct >= 80 ? 'text-primary-dark' : pct >= 50 ? 'text-earth-mid' : 'text-red-500';
  const blockedMsg = business?.status === 'Pending'
    ? 'Tu negocio está pendiente de aprobación.'
    : 'Tu negocio fue rechazado. Revisa el motivo e intenta nuevamente.';

  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <h3 className="text-sm font-semibold text-heading">Estado de negocio</h3>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Información completada</span>
          <span className={`text-xs font-semibold ${pctColor}`}>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-edge rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((v) => (
          <li key={v.label} className="flex items-center gap-2 text-xs">
            {v.done
              ? <CheckCircle2 className="w-4 h-4 text-primary-dark shrink-0" />
              : <AlertCircle className="w-4 h-4 text-muted shrink-0" />}
            <span className={v.done ? 'text-body' : 'text-muted'}>{v.label}</span>
          </li>
        ))}
      </ul>
      {isBlocked ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2 px-3 py-2.5 bg-warn-bg border border-warn-text/20 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-warn-text shrink-0 mt-0.5" />
            <p className="text-xs text-warn-text leading-snug">{blockedMsg}</p>
          </div>
          <button disabled className="w-full text-xs font-medium py-2 px-4 bg-edge text-muted rounded-xl cursor-not-allowed opacity-60">
            Completar negocio
          </button>
        </div>
      ) : (
        <button className="w-full text-xs font-medium py-2 px-4 bg-primary-dark text-on-dark-active rounded-xl hover:bg-primary-darkest transition-colors">
          Completar negocio
        </button>
      )}
    </div>
  );
}

function Recommendations() {
  const tips = [
    'Agrega imágenes de calidad a tu galería',
    'Completa la descripción de tu negocio',
    'Añade categorías y etiquetas relevantes',
  ];
  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-primary-mid" />
        <h3 className="text-sm font-semibold text-heading">Recomendaciones</h3>
      </div>
      <ul className="space-y-2.5">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-body">
            <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-primary-softest text-primary-dark flex items-center justify-center font-semibold text-[10px]">
              {i + 1}
            </span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertBadge() {
  const practices = ['Uso de materiales reciclados', 'Reducción de emisiones CO₂', 'Comercio local y justo'];
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
      <Link to="/dashboardBusiness/certificaciones" className="block text-center text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors">
        Ver todas →
      </Link>
    </div>
  );
}

function Gallery({ isBlocked }) {
  return (
    <div className={`bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4 ${isBlocked ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold text-heading">Galería</h3>
        </div>
        {isBlocked && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Lock className="w-3.5 h-3.5" />
            <span>Bloqueado</span>
          </div>
        )}
      </div>
      {isBlocked ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <div className="w-10 h-10 rounded-xl bg-edge flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted" />
          </div>
          <p className="text-xs text-muted text-center max-w-xs">
            La galería estará disponible una vez que tu negocio sea aprobado.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-primary-softest rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-muted" />
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-2 text-xs font-medium py-2 px-4 border border-dashed border-edge text-muted rounded-xl hover:border-primary-mid hover:text-primary-dark transition-colors">
            <ImagePlus className="w-4 h-4" />
            Agregar imágenes
          </button>
        </>
      )}
    </div>
  );
}

function QuickActions({ isBlocked }) {
  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
      <h3 className="text-sm font-semibold text-heading">Acciones rápidas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => {
          const blocked = isBlocked && action.label === 'Subir fotos';
          const inner = blocked ? (
            <div className="relative flex flex-col items-center gap-2 p-3 rounded-xl border border-edge text-center w-full opacity-50 cursor-not-allowed">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-muted leading-tight">{action.label}</span>
              <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-muted" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-edge hover:border-primary-light hover:shadow-sm transition-all text-center w-full">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-body leading-tight">{action.label}</span>
            </div>
          );

          if (blocked) return <div key={action.label}>{inner}</div>;
          return action.to ? (
            <Link key={action.label} to={action.to}>{inner}</Link>
          ) : (
            <button key={action.label} type="button" className="w-full">{inner}</button>
          );
        })}
      </div>
    </div>
  );
}

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
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} />;

  const biz       = businesses[0] ?? null;
  const isBlocked = biz?.status === 'Pending' || biz?.status === 'Rejected';

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:pl-10 lg:pr-8 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="text-body font-medium">Mi Negocio</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary-dark" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-heading">Panel de mi negocio</h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">Gestiona y monitorea tu negocio · Consumo Sostenible</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Accesos rápidos</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {QUICK_LINKS.map((item) => (
                <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-3 border border-edge hover:border-primary-light hover:shadow-sm rounded-2xl transition-all group w-full sm:w-auto">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-body group-hover:text-heading transition-colors">{item.label}</p>
                    <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Resumen del negocio</p>
            {businesses.length === 0
              ? <EmptyState />
              : businesses.map((b) => <BusinessCard key={b.id_business} business={b} />)
            }
          </div>

          {biz && !isBlocked && (
            <BusinessProductsCarousel businessId={biz.id_business} />
          )}

          <Gallery isBlocked={isBlocked} />

          <QuickActions isBlocked={isBlocked} />
        </div>

        <div className="space-y-6">
          <ProfileStatus business={biz} isBlocked={isBlocked} />
          <Recommendations />
          <CertBadge />
        </div>
      </div>
    </div>
  );
}
