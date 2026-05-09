import { MessageSquare, Star, Users } from 'lucide-react';

function StatItem({ icon: Icon, value, label, iconCls }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      <Icon className={`w-6 h-6 ${iconCls}`} />
      <span className="text-xl font-bold text-heading">
        {value ?? '—'}
      </span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export default function BusinessStatsBar({ followers, rating, reviews }) {
  return (
    <div className="bg-card-bg border border-edge rounded-2xl p-6">
      <div className="flex items-stretch divide-x divide-edge">
        <div className="flex-1 flex justify-center">
          <StatItem
            icon={Users}
            value={followers?.toLocaleString('es-CO')}
            label="Seguidores"
            iconCls="text-primary-mid"
          />
        </div>
        <div className="flex-1 flex justify-center">
          <StatItem
            icon={Star}
            value={Number(rating).toFixed(1)}
            label="Puntuación"
            iconCls="text-amber-400"
          />
        </div>
        <div className="flex-1 flex justify-center">
          <StatItem
            icon={MessageSquare}
            value={reviews?.toLocaleString('es-CO')}
            label="Reseñas"
            iconCls="text-primary-mid"
          />
        </div>
      </div>
    </div>
  );
}
