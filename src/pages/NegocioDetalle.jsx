import {
  AlertTriangle, Award, Building2, Clock,
  Globe, Loader2, MapPin, Package,
  RefreshCw, Star, Tag, UserCheck, UserPlus, Users,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContactDisplay } from '../Components/business/profile/BusinessContactCard';
import { ScheduleDisplay } from '../Components/business/profile/BusinessScheduleCard';
import ReviewsSection from '../Components/landing/ReviewsSection';
import PublicCertRow from '../Components/landing/PublicCertRow';
import PublicProductCard from '../Components/landing/PublicProductCard';
import usePublicBusinessById from '../hooks/usePublicBusinessById';
import { usePublicCertifications, usePublicProducts } from '../hooks/usePublicBusinessContent';
import useFollow from '../hooks/useFollow';
import { useToastContext } from '../context/ToastContext';

const TABS = [
  { id: 'info',  label: 'Información',    icon: Globe   },
  { id: 'prods', label: 'Productos',      icon: Package },
  { id: 'certs', label: 'Certificaciones',icon: Award   },
];

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-7 h-7 animate-spin text-primary-mid" />
    </div>
  );
}

function PageError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-sm font-semibold text-heading">{message}</p>
      <button onClick={onRetry} className="flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-xl bg-primary-dark text-on-dark-active hover:bg-primary-darkest transition-colors">
        <RefreshCw className="w-4 h-4" />Reintentar
      </button>
    </div>
  );
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-5 h-5 animate-spin text-primary-mid" />
    </div>
  );
}

function Empty({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <div className="w-12 h-12 bg-primary-softest rounded-2xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted" />
      </div>
      <p className="text-sm text-muted max-w-xs">{message}</p>
    </div>
  );
}

function BusinessHeader({ business }) {
  const { success, error: toastError } = useToastContext();
  const { isFollowing, toggle, loading, initializing, isAuthenticated } =
    useFollow(business.id_business);

  const handleFollow = async () => {
    if (!isAuthenticated) { toastError('Inicia sesión para seguir negocios'); return; }
    try {
      const result = await toggle();
      if (result?.nowFollowing) success(`¡Ahora sigues a ${business.businessName}!`);
      else if (result)           success(`Dejaste de seguir a ${business.businessName}`);
    } catch { toastError('No se pudo completar la acción'); }
  };

  return (
    <div className="bg-card-bg border border-edge rounded-2xl p-6">
      <div className="flex items-start gap-5 flex-wrap">
        <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden bg-primary-softest flex items-center justify-center border border-edge">
          {business.logo
            ? <img src={business.logo} alt={business.businessName} className="w-full h-full object-cover" />
            : <Building2 className="w-10 h-10 text-muted" />}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl sm:text-2xl font-serif text-heading">{business.businessName}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {business.category?.category && (
                  <span className="text-xs px-2.5 py-0.5 bg-primary-softest border border-edge rounded-full text-body">
                    {business.category.category}
                  </span>
                )}
                {business.certifications?.length > 0 && (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 bg-ok-bg border border-ok-text/30 rounded-full text-ok-text font-medium">
                    <Award className="w-3 h-3" />Certificado
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleFollow}
              disabled={initializing || loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                isFollowing
                  ? 'bg-primary-softest text-primary-dark border border-edge hover:bg-primary-light'
                  : 'bg-primary-dark text-on-dark-active hover:bg-primary-darkest'
              }`}
            >
              {initializing || loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isFollowing
                  ? <><UserCheck className="w-4 h-4" />Siguiendo</>
                  : <><UserPlus className="w-4 h-4" />Seguir</>}
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />{business.followers_count ?? 0} seguidores
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              {business.average_rating ? Number(business.average_rating).toFixed(1) : '—'}
              {' · '}{business.total_reviews ?? 0} reseñas
            </span>
            {business.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />{business.address}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabInfo({ business }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {business.description && (
          <div className="bg-card-bg border border-edge rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Descripción</p>
            <p className="text-sm text-body leading-relaxed">{business.description}</p>
          </div>
        )}
        {business.images?.length > 0 && (
          <div className="bg-card-bg border border-edge rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Galería</p>
            <div className="grid grid-cols-3 gap-2">
              {business.images.slice(0, 6).map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-primary-softest">
                  <img src={img} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
        {business.tags?.length > 0 && (
          <div className="bg-card-bg border border-edge rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted" />
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Etiquetas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {business.tags.map((t) => (
                <span key={t.id_tags ?? t.tagName}
                  className="text-xs px-2.5 py-1 bg-primary-softest border border-edge rounded-full text-body">
                  {t.tagName ?? t.name ?? t.tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-card-bg border border-edge rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-muted" />
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Contacto</p>
          </div>
          <ContactDisplay
            address={business.address} phone={business.phone}
            emailBusiness={business.emailBusiness} website={business.website}
            instagramUrl={business.instagramUrl} facebookUrl={business.facebookUrl}
            xUrl={business.xUrl}
          />
        </div>
        {business.schedule && Object.keys(business.schedule).length > 0 && (
          <div className="bg-card-bg border border-edge rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted" />
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Horario</p>
            </div>
            <ScheduleDisplay schedule={business.schedule} />
          </div>
        )}
      </div>
    </div>
  );
}

function TabProducts({ businessId }) {
  const { products, loading, error, retry } = usePublicProducts(businessId);
  if (loading) return <SectionLoader />;
  if (error)   return <PageError message={error} onRetry={retry} />;
  if (!products.length) return <Empty icon={Package} message="Este negocio aún no tiene productos publicados." />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p, i) => <PublicProductCard key={p.id_product ?? i} product={p} />)}
    </div>
  );
}

function TabCertifications({ businessId }) {
  const { certifications, loading, error, retry } = usePublicCertifications(businessId);
  if (loading) return <SectionLoader />;
  if (error)   return <PageError message={error} onRetry={retry} />;
  if (!certifications.length) return (
    <Empty icon={Award} message="Este negocio no tiene certificaciones activas registradas." />
  );
  return (
    <div className="bg-card-bg border border-edge rounded-2xl p-5 max-w-2xl">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
        {certifications.length} certificación{certifications.length !== 1 ? 'es' : ''} verificada{certifications.length !== 1 ? 's' : ''}
      </p>
      {certifications.map((c, i) => <PublicCertRow key={c.id_certification ?? i} cert={c} />)}
    </div>
  );
}

export default function NegocioDetalle() {
  const { id }     = useParams();
  const location   = useLocation();
  const navigate   = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  const fromState = location.state?.business;
  const { business: fetched, loading, error, retry } = usePublicBusinessById(
    fromState ? null : id,
  );
  const business = fromState ?? fetched;

  if (loading && !business) return <PageLoader />;
  if (error && !business)   return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <PageError message={error} onRetry={retry} />
    </div>
  );
  if (!business) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <button onClick={() => navigate(-1)} className="hover:text-body transition-colors">
          ← Volver
        </button>
        <span>/</span>
        <span className="text-body truncate">{business.businessName}</span>
      </nav>

      <BusinessHeader business={business} />

      <div className="flex items-center gap-1 border-b border-edge overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-primary-dark text-primary-dark'
                : 'border-transparent text-muted hover:text-body'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'info'  && <TabInfo business={business} />}
        {activeTab === 'prods' && <TabProducts businessId={Number(id)} />}
        {activeTab === 'certs' && <TabCertifications businessId={Number(id)} />}
      </div>

      {/* Reseñas — siempre visibles al fondo */}
      <div className="border-t border-edge pt-8">
        <ReviewsSection businessId={Number(id)} />
      </div>

    </div>
  );
}
