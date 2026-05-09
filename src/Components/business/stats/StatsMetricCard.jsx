import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsMetricCard({ icon: Icon, label, value, trend }) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-card-bg rounded-2xl border border-edge p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-primary-softest flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-dark" />
        </div>
        {trend != null && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isPositive
              ? 'bg-primary-softest text-primary-dark'
              : 'bg-red-50 text-red-600'
          }`}>
            {isPositive
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-2xl font-bold text-heading mt-0.5">{value}</p>
      </div>
    </div>
  );
}
