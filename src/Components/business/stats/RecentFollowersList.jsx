import { Users } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-primary-softest text-primary-dark',
  'bg-earth-cream text-earth-dark',
  'bg-blue-50 text-blue-700',
  'bg-violet-50 text-violet-700',
];

function Avatar({ name }) {
  const initials = (name ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
  const colorClass = AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${colorClass}`}>
      {initials}
    </div>
  );
}

function relativeDate(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem.`;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function RecentFollowersList({ followers = [] }) {
  // El backend ya retorna orden DESC (más reciente primero)
  const recent = followers.slice(0, 5);

  if (!recent.length) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-4 text-muted">
        <Users className="w-7 h-7 opacity-30" />
        <p className="text-xs">Sin seguidores aún</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
        Últimos seguidores
      </p>
      <div className="space-y-3">
        {recent.map((follower, i) => {
          const name = follower.perfil?.nombre ?? 'Usuario EcoVida';
          return (
            <div key={follower.id_usuario ?? i} className="flex items-center gap-2.5">
              <Avatar name={name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-heading truncate">{name}</p>
                <p className="text-xs text-muted">{relativeDate(follower.fecha_seguimiento)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
