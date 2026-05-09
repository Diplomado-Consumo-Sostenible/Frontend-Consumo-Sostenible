import { Award, Heart, Lightbulb, Map as MapIcon, MapPin, Recycle, ShoppingBag, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import MapView from '../map/MapView';

function BusinessListItem({ business }) {
  const name     = business.businessName ?? business.nombre ?? 'Sin nombre';
  const category = business.category?.category ?? business.tipo_negocio ?? null;
  const address  = business.address ?? business.direccion ?? null;
  const hasCert  = business.certifications?.length > 0;
  const logo     = business.logoUrl ?? business.imageUrl ?? null;

  return (
    <li className="flex items-center gap-3 py-2.5 border-b border-edge/50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary-softest flex items-center justify-center shrink-0 overflow-hidden">
        {logo
          ? <img src={logo} alt={name} className="w-full h-full object-cover" />
          : <Store className="w-4 h-4 text-primary-dark" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-heading truncate">{name}</p>
        {category && <p className="text-[11px] text-muted truncate">{category}</p>}
        {address && (
          <p className="flex items-center gap-1 text-[10px] text-muted/70 truncate mt-0.5">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            {address}
          </p>
        )}
      </div>
      {hasCert && <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Certificado" />}
    </li>
  );
}

const MAX_LIST = 5;

function MapWidget({ businesses }) {
  const preview = businesses.slice(0, MAX_LIST);

  return (
    <div className="bg-card-bg rounded-2xl shadow p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-primary-mid" />
          <h3 className="text-sm font-semibold text-heading">Negocios cerca de ti</h3>
        </div>
        <Link to="/dashboard/mapa" className="text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors">
          Ver mapa →
        </Link>
      </div>

      <MapView businesses={businesses} compact className="min-h-[440px] rounded-xl" />

      <div className="flex items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-mid inline-block" />
          Negocios
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
          Tu ubicación
        </span>
      </div>

      {preview.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Listado</p>
          <ul>
            {preview.map((biz) => (
              <BusinessListItem key={biz.id_business ?? biz.id} business={biz} />
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/dashboard/mapa"
        className="flex items-center justify-center gap-2 w-full text-xs font-medium py-2 px-4 border border-dashed border-edge text-muted rounded-xl hover:border-primary-mid hover:text-primary-dark transition-colors"
      >
        <MapIcon className="w-3.5 h-3.5" />
        {businesses.length > MAX_LIST ? `Ver los ${businesses.length} negocios en el mapa` : 'Abrir mapa completo'}
      </Link>
    </div>
  );
}

function FollowingWidget({ followedBusinesses, loading }) {
  const preview = followedBusinesses.slice(0, MAX_LIST);

  return (
    <div className="bg-card-bg rounded-2xl shadow p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-heading">Negocios que sigo</h3>
        </div>
        <Link to="/dashboard/favoritos" className="text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors">
          Ver todos →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-xl bg-edge shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 bg-edge rounded-full" />
                <div className="h-2.5 w-20 bg-edge rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : followedBusinesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-5 gap-2 text-center">
          <Heart className="w-7 h-7 text-muted/30" />
          <p className="text-xs text-muted">Aún no sigues ningún negocio</p>
          <Link
            to="/dashboard/explorar"
            className="text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors"
          >
            Explorar negocios →
          </Link>
        </div>
      ) : (
        <>
          <ul>
            {preview.map((biz) => (
              <BusinessListItem key={biz.id_business ?? biz.id} business={biz} />
            ))}
          </ul>
          {followedBusinesses.length > MAX_LIST && (
            <Link
              to="/dashboard/favoritos"
              className="flex items-center justify-center gap-2 w-full text-xs font-medium py-2 px-4 border border-dashed border-edge text-muted rounded-xl hover:border-primary-mid hover:text-primary-dark transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              Ver los {followedBusinesses.length} negocios que sigo
            </Link>
          )}
        </>
      )}
    </div>
  );
}

const TIPS = [
  { Icon: ShoppingBag, text: 'Explora categorías para encontrar negocios de tu interés' },
  { Icon: Recycle,     text: 'Sigue tus negocios favoritos para acceder fácilmente'     },
  { Icon: Lightbulb,   text: 'Completa tu perfil para una experiencia personalizada'    },
];

function TipsWidget() {
  return (
    <div className="bg-card-bg rounded-2xl shadow p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-primary-mid" />
        <h3 className="text-sm font-semibold text-heading">Consejos eco</h3>
      </div>
      <ul className="space-y-2.5">
        {TIPS.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-body">
            <div className="w-5 h-5 rounded-full bg-primary-softest flex items-center justify-center shrink-0 mt-0.5">
              <tip.Icon className="w-3 h-3 text-primary-dark" />
            </div>
            <span className="leading-snug">{tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashSidePanel({ businesses, followedBusinesses = [], loadingFollows = false }) {
  return (
    <div className="space-y-5">
      <MapWidget businesses={businesses} />
      <FollowingWidget followedBusinesses={followedBusinesses} loading={loadingFollows} />
      <TipsWidget />
    </div>
  );
}
