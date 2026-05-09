/**
 * MapView — Componente de mapa interactivo
 *
 * ESTADO ACTUAL: Placeholder — muestra "Próximamente"
 *
 * ═══════════════════════════════════════════════════════════
 * GUÍA DE INTEGRACIÓN — Google Maps
 * ═══════════════════════════════════════════════════════════
 *
 * 1. Instalar dependencia:
 *      npm install @react-google-maps/api
 *
 * 2. Variables de entorno (.env):
 *      VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
 *
 * 3. Habilitar en Google Cloud Console:
 *      ✓ Maps JavaScript API
 *      ✓ Places API         (para autocompletado de búsqueda)
 *      ✓ Geocoding API      (para convertir dirección → coordenadas)
 *
 * 4. Implementación básica:
 *
 *      import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
 *
 *      const { isLoaded } = useJsApiLoader({
 *        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
 *      });
 *
 *      if (!isLoaded) return <LoadingSpinner />;
 *
 *      return (
 *        <GoogleMap
 *          mapContainerStyle={{ width: '100%', height: '100%' }}
 *          center={{ lat: 4.7110, lng: -74.0721 }}   // Bogotá por defecto
 *          zoom={12}
 *        >
 *          {businesses.map(biz => (
 *            <Marker
 *              key={biz.id_business}
 *              position={{ lat: biz.lat, lng: biz.lng }}
 *              icon={{ fillColor: getPinColor(biz), ... }}
 *              onClick={() => onSelect(biz.id_business)}
 *            />
 *          ))}
 *          {selectedId && (
 *            <InfoWindow position={...} onCloseClick={() => onSelect(null)}>
 *              <BusinessInfoCard business={...} />
 *            </InfoWindow>
 *          )}
 *        </GoogleMap>
 *      );
 *
 * 5. Colores de pines por tipo de certificación:
 *      Verde   #2E6B47  →  Certificación Verde
 *      Ámbar   #8C5A0A  →  Eco-amigable
 *      Azul    #1d4ed8  →  Artesanal
 *      Gris    #5B8A6F  →  Sin certificación
 *
 * 6. Geocodificación de negocios (una vez por negocio, cachear resultado):
 *      const geocoder = new window.google.maps.Geocoder();
 *      geocoder.geocode({ address: business.address }, (results, status) => {
 *        if (status === 'OK') {
 *          const { lat, lng } = results[0].geometry.location;
 *          // Guardar lat/lng junto al negocio o en estado local
 *        }
 *      });
 * ═══════════════════════════════════════════════════════════
 *
 * @param {Array}    businesses   
 * @param {string}   selectedId
 * @param {Function} onSelect    
 * @param {string}   className   
 * @param {boolean}  compact    
 * @param {boolean}  showLegend   
 */

import { Map, MapPin } from 'lucide-react';

const PIN_LEGEND = [
  { color: 'bg-primary-dark',  label: 'Cert. Verde' },
  { color: 'bg-amber-700',     label: 'Eco-amigable' },
  { color: 'bg-blue-600',      label: 'Artesanal' },
];

export default function MapView({
  businesses = [],
  selectedId = null,
  onSelect,
  className = '',
  compact = false,
  showLegend = false,
}) {
  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        bg-primary-softest border border-edge overflow-hidden
        ${compact ? 'min-h-[180px] rounded-2xl' : 'h-full min-h-[360px] rounded-2xl'}
        ${className}
      `}
    >
      {/* Cuadrícula decorativa */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#4A9C6D 1px, transparent 1px), linear-gradient(90deg, #4A9C6D 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Pines decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { top: '20%', left: '15%', size: 'w-5 h-5', color: 'text-primary-dark', opacity: 'opacity-20' },
          { top: '55%', left: '35%', size: 'w-4 h-4', color: 'text-amber-700',    opacity: 'opacity-15' },
          { top: '30%', left: '65%', size: 'w-6 h-6', color: 'text-blue-600',     opacity: 'opacity-20' },
          { top: '70%', left: '75%', size: 'w-4 h-4', color: 'text-primary-mid',  opacity: 'opacity-15' },
          { top: '80%', left: '20%', size: 'w-5 h-5', color: 'text-primary-dark', opacity: 'opacity-10' },
        ].map((pin, i) => (
          <MapPin
            key={i}
            className={`absolute ${pin.size} ${pin.color} ${pin.opacity}`}
            style={{ top: pin.top, left: pin.left }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-2xl bg-white/60 border border-primary-mid/20 shadow-sm flex items-center justify-center">
          <Map className="w-6 h-6 text-primary-dark" />
        </div>

        <div>
          <p className="text-sm font-semibold text-heading">Mapa interactivo</p>
          <p className="text-xs text-muted mt-1 max-w-[200px] leading-relaxed">
            Visualización geográfica de negocios disponible próximamente
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warn-bg border border-warn-text/20 text-warn-text text-xs font-medium">
          Próximamente
        </span>

        {/* Leyenda de pines */}
        {(showLegend || !compact) && (
          <div className="flex items-center gap-4 mt-1 flex-wrap justify-center">
            {PIN_LEGEND.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-muted">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
