const fmt = (date) =>
  date
    ? new Date(date).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

function MetaItem({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-body">{value}</p>
    </div>
  );
}

export default function BusinessMetadata({ id, createdAt, updatedAt }) {
  return (
    <div className="bg-card-bg border border-edge rounded-2xl p-6">
      <div className="grid grid-cols-3 gap-4">
        <MetaItem label="Creado el" value={fmt(createdAt)} />
        <MetaItem label="Última actualización" value={fmt(updatedAt)} />
      </div>
    </div>
  );
}
