import { MapPin } from 'lucide-react';
import MapView from '../../map/MapView';

const inputCls =
  'w-full px-3.5 py-2.5 border border-edge rounded-xl text-sm text-body bg-card-bg outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-colors';

export function LocationDisplay({ latitude, longitude }) {
  if (!latitude && !longitude) {
    return <p className="text-sm text-muted">Sin coordenadas registradas.</p>;
  }

  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      <MapView compact />

      <div className="flex items-center justify-between text-xs text-muted px-1">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary-mid" />
          Lat: {latitude} | Lon: {longitude}
        </span>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary-mid hover:text-primary-dark transition-colors"
        >
          Ver en Maps →
        </a>
      </div>
    </div>
  );
}

export function LocationForm({ values, onChange }) {
  function set(key, raw) {
    const parsed = parseFloat(raw);
    onChange({ ...values, [key]: isNaN(parsed) ? '' : parsed });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Latitud</label>
        <input
          type="number"
          step="any"
          value={values.latitude ?? ''}
          onChange={(e) => set('latitude', e.target.value)}
          placeholder="Ej: 4.710989"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Longitud</label>
        <input
          type="number"
          step="any"
          value={values.longitude ?? ''}
          onChange={(e) => set('longitude', e.target.value)}
          placeholder="Ej: -74.072090"
          className={inputCls}
        />
      </div>
      <p className="text-xs text-muted">
        Puedes obtener las coordenadas desde{' '}
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-mid hover:underline"
        >
          Google Maps
        </a>
        {' '}haciendo clic derecho sobre tu ubicación.
      </p>
    </div>
  );
}
