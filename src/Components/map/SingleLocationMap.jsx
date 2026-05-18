import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function SingleLocationMap({ latitude, longitude, className = '' }) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!lat || !lng) return null;

  return (
    <div className={`rounded-2xl overflow-hidden border border-edge ${className}`} style={{ height: 200 }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="w-full h-full"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
