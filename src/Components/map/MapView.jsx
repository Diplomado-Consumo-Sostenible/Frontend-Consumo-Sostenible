import L from 'leaflet';
import { ArrowRight, Building2, ChevronLeft, ChevronRight, List, Loader2, MapPin, Navigation, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { getPublicBusinesses } from '../../services/business/explore.service';
import { formatDistance, haversine } from './haversine';
import { useGeolocacion } from './useGeolocacion';

// Leaflet necesita iconos manuales con bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [1.1523, -76.6508];
const PAGE_SIZE = 5;

const TILE_LAYERS = {
  calles: {
    label: 'Calles',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  relieve: {
    label: 'Relieve',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  satelite: {
    label: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
    maxZoom: 18,
  },
};

function LayerControl({ active, onChange }) {
  return (
    <div className="absolute bottom-8 left-3 z-[1000] flex gap-1 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow p-1">
      {Object.entries(TILE_LAYERS).map(([key, { label }]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
            active === key ? 'bg-primary-dark text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}" stroke="${color === '#c75b3f' ? '#a04530' : '#2E6B47'}" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

const iconDefault = makeIcon('#4A9C6D');
const iconActive  = makeIcon('#c75b3f');
const iconUser    = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

function InfoCard({ biz }) {
  const rating = Number(biz.average_rating ?? 0);
  return (
    <div className="flex flex-col gap-1.5 min-w-[170px] max-w-[210px]">
      {biz.logo && (
        <img src={biz.logo} alt={biz.businessName} className="w-full h-14 object-cover rounded-lg" />
      )}
      <p className="font-semibold text-sm text-heading leading-tight">{biz.businessName}</p>
      {biz.category?.category && (
        <span className="inline-block w-fit px-2 py-0.5 rounded-full bg-primary-softest text-primary-dark text-[10px] font-medium border border-primary-light/40">
          {biz.category.category}
        </span>
      )}
      {biz.address && (
        <p className="flex items-start gap-1 text-[11px] text-muted">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
          {biz.address}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 flex-wrap mt-0.5">
        {rating > 0 && (
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((n) => (
              <Star key={n} className={`w-3 h-3 ${n <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-edge fill-edge'}`} />
            ))}
            <span className="text-[10px] text-muted ml-0.5">{rating.toFixed(1)}</span>
          </div>
        )}
        {biz.distance !== null && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-primary-dark bg-primary-softest px-2 py-0.5 rounded-full">
            <Navigation className="w-2.5 h-2.5" />
            {formatDistance(biz.distance)}
          </span>
        )}
      </div>
      <Link
        to={`/negocio/${biz.id_business}`}
        onClick={() => window.scrollTo(0, 0)}
        className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-primary-dark hover:bg-primary-darkest text-on-dark-active text-[11px] font-semibold transition-colors"
      >
        Ver detalles <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function BizListItem({ biz, isSelected, hasCoords, onClick }) {
  const rating = Number(biz.average_rating ?? 0);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-3 transition-all duration-200 flex items-start gap-3 group ${
        isSelected
          ? 'border-primary-dark bg-primary-softest shadow-sm ring-1 ring-primary-dark/20'
          : hasCoords
          ? 'border-edge bg-card-bg hover:border-primary-mid hover:shadow-sm'
          : 'border-edge bg-card-bg opacity-60 cursor-default'
      }`}
    >
      <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-primary-softest flex items-center justify-center">
        {biz.logo
          ? <img src={biz.logo} alt={biz.businessName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
          : <Building2 className="w-5 h-5 text-primary-mid" />}
      </div>

      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-semibold text-heading leading-tight line-clamp-1 flex-1">{biz.businessName}</p>
          {!hasCoords && <span className="shrink-0 text-[9px] text-muted bg-edge px-1.5 py-0.5 rounded-full">Sin mapa</span>}
        </div>

        {biz.category?.category && (
          <span className="inline-block w-fit px-2 py-0.5 rounded-full bg-primary-softest border border-edge text-[9px] font-medium text-primary-dark">
            {biz.category.category}
          </span>
        )}

        {biz.address && (
          <p className="text-[10px] text-muted line-clamp-1 flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5 shrink-0" />{biz.address}
          </p>
        )}

        <div className="flex items-center justify-between gap-1 mt-0.5">
          {rating > 0 ? (
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((n) => (
                <Star key={n} className={`w-2.5 h-2.5 ${n <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
              ))}
              <span className="text-[10px] text-muted ml-0.5">{rating.toFixed(1)}</span>
            </div>
          ) : <span className="text-[10px] text-muted">Sin reseñas</span>}

          {hasCoords && biz.distance !== null && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary-dark bg-primary-softest px-2 py-0.5 rounded-full shrink-0">
              <Navigation className="w-2.5 h-2.5" />{formatDistance(biz.distance)}
            </span>
          )}
        </div>

        <Link
          to={`/negocio/${biz.id_business}`}
          onClick={(e) => { e.stopPropagation(); window.scrollTo(0, 0); }}
          className="mt-1.5 flex items-center justify-center gap-1 w-full py-1.5 rounded-lg border border-primary-light text-primary-dark text-[10px] font-semibold hover:bg-primary-softest transition-colors"
        >
          Ver detalles <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </button>
  );
}

function BusinessList({ allSorted, paginated, page, totalPages, setPage, selected, handleListClick, geoDenied, userPos, withCoords }) {
  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs font-medium text-muted">
          {allSorted.length} negocio{allSorted.length !== 1 ? 's' : ''}
          {userPos && withCoords.length > 0 && <span className="text-primary-dark"> · por cercanía</span>}
        </p>
        {totalPages > 1 && <span className="text-[10px] text-muted">{page + 1} / {totalPages}</span>}
      </div>

      {geoDenied && (
        <div className="shrink-0 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <Navigation className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-700 leading-tight">
            Permite la ubicación para ver distancias. Clic en el candado de la URL → Ubicación → Permitir.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
        {paginated.map((biz) => (
          <BizListItem
            key={biz.id_business}
            biz={biz}
            isSelected={selected?.id_business === biz.id_business}
            hasCoords={biz.hasCoords}
            onClick={() => handleListClick(biz)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between gap-2 pt-2 border-t border-edge">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-edge bg-card-bg text-xs text-body hover:bg-primary-softest disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />Anterior
          </button>
          <span className="text-[11px] text-muted">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, allSorted.length)} de {allSorted.length}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-edge bg-card-bg text-xs text-body hover:bg-primary-softest disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Siguiente<ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function MapView({ className = '' }) {
  const [businesses, setBusinesses]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(null);
  const [selected, setSelected]       = useState(null);
  const [panTarget, setPanTarget]     = useState(null);
  const [page, setPage]               = useState(0);
  const [mobileTab, setMobileTab]     = useState('map');
  const [tileKey, setTileKey]         = useState('calles');
  const markerRefs                    = useRef({});
  const { pos: userPos, denied: geoDenied } = useGeolocacion();

  useEffect(() => {
    getPublicBusinesses()
      .then(setBusinesses)
      .catch((e) => setFetchError(e.message ?? 'Error al cargar negocios'))
      .finally(() => setLoading(false));
  }, []);

  const { withCoords, allSorted } = useMemo(() => {
    const mapped = businesses.map((b) => {
      const hasCoords = Boolean(b.latitude && b.longitude);
      return {
        ...b,
        _lat: hasCoords ? Number(b.latitude) : null,
        _lng: hasCoords ? Number(b.longitude) : null,
        hasCoords,
        distance: hasCoords && userPos
          ? haversine(userPos.lat, userPos.lng, Number(b.latitude), Number(b.longitude))
          : null,
      };
    });
    const wc  = mapped.filter((b) => b.hasCoords).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    const all = [
      ...mapped.filter((b) => b.hasCoords).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)),
      ...mapped.filter((b) => !b.hasCoords),
    ];
    return { withCoords: wc, allSorted: all };
  }, [businesses, userPos]);

  const defaultCenter = useMemo(
    () => withCoords[0] ? [withCoords[0]._lat, withCoords[0]._lng] : DEFAULT_CENTER,
    [withCoords]
  );

  const totalPages = Math.ceil(allSorted.length / PAGE_SIZE);
  const paginated  = allSorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function handleListClick(biz) {
    if (!biz.hasCoords) return;
    setSelected(biz);
    setPanTarget([biz._lat, biz._lng]);
    setMobileTab('map');
    setTimeout(() => markerRefs.current[biz.id_business]?.openPopup(), 300);
  }

  function handleMarkerClick(biz) {
    setSelected(biz);
    setPanTarget([biz._lat, biz._lng]);
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full rounded-2xl bg-primary-softest border border-edge ${className}`}>
        <Loader2 className="w-6 h-6 text-primary-dark animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={`flex items-center justify-center h-full rounded-2xl bg-primary-softest border border-edge ${className}`}>
        <p className="text-sm text-muted">{fetchError}</p>
      </div>
    );
  }

  const tile = TILE_LAYERS[tileKey];

  const mapEl = (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="w-full h-full"
        zoomControl={true}
      >
      <TileLayer
        key={tileKey}
        url={tile.url}
        attribution={tile.attribution}
        maxZoom={tile.maxZoom}
      />
      <MapController center={panTarget} />

      {userPos && (
        <Marker position={[userPos.lat, userPos.lng]} icon={iconUser} />
      )}

      {withCoords.map((biz) => (
        <Marker
          key={biz.id_business}
          position={[biz._lat, biz._lng]}
          icon={selected?.id_business === biz.id_business ? iconActive : iconDefault}
          ref={(r) => { if (r) markerRefs.current[biz.id_business] = r; }}
          eventHandlers={{ click: () => handleMarkerClick(biz) }}
        >
          <Popup>
            <InfoCard biz={biz} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
      <LayerControl active={tileKey} onChange={setTileKey} />
    </div>
  );

  const listProps = { allSorted, paginated, page, totalPages, setPage, selected, handleListClick, geoDenied, userPos, withCoords };

  return (
    <div className={`h-full flex flex-col ${className}`}>

      {/* Tabs mobile */}
      <div className="flex md:hidden shrink-0 bg-card-bg border-b border-edge rounded-t-2xl overflow-hidden">
        <button onClick={() => setMobileTab('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === 'map' ? 'text-primary-dark border-b-2 border-primary-dark bg-primary-softest' : 'text-muted hover:text-body'
          }`}>
          <MapPin className="w-4 h-4" />Mapa
        </button>
        <button onClick={() => setMobileTab('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === 'list' ? 'text-primary-dark border-b-2 border-primary-dark bg-primary-softest' : 'text-muted hover:text-body'
          }`}>
          <List className="w-4 h-4" />Negocios ({allSorted.length})
        </button>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div className={`rounded-b-2xl md:rounded-2xl overflow-hidden border border-edge shadow-sm md:flex-[7] ${
          mobileTab === 'list' ? 'hidden md:block' : 'flex-1'
        }`}>
          {mapEl}
        </div>

        <div className={`md:flex-[3] p-1 md:p-0 ${
          mobileTab === 'map' ? 'hidden md:flex md:flex-col' : 'flex flex-col flex-1'
        }`}>
          <BusinessList {...listProps} />
        </div>
      </div>
    </div>
  );
}
