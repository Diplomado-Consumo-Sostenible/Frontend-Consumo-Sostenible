import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Store,
  Award,
  LayoutGrid,
  Tag,
  Compass,
  ArrowUpRight,
  ArrowRight,
  Check,
  X,
  Loader2,
  UserPlus,
  TrendingUp,
  CheckCircle2,
  XCircle,
  PowerOff,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { changeBusinessStatus } from '../../services/business/business.admin.service';
import { useToastContext } from '../../context/ToastContext';
import { buildCumulativeSeries, useAdminStats } from '../../hooks/useAdminStats';
import UserLineChart from '../../Components/admin/UserLineChart';

// ─── Hook: segundos desde la última actualización ────────────────────────────

function useSecondsSince(date) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!date) return;
    const tick = () => setSecs(Math.floor((Date.now() - date.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);
  return secs;
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

const QUICK_ACCESS = [
  {
    id: 'users',
    title: 'Gestión de usuarios',
    desc: 'Crear, editar y controlar acceso de usuarios y administradores.',
    icon: Users,
    to: '/adminDashboard/usuarios',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    statKey: 'totalUsers',
    statLabel: 'usuarios',
  },
  {
    id: 'biz',
    title: 'Moderación de negocios',
    desc: 'Aprobar, rechazar y verificar nuevos comercios sostenibles.',
    icon: Store,
    to: '/adminDashboard/negocios',
    iconBg: 'bg-primary-softest',
    iconColor: 'text-primary-dark',
    statKey: 'totalBiz',
    statLabel: 'negocios',
    pendingKey: 'pendingCount',
  },
  {
    id: 'cert',
    title: 'Certificaciones',
    desc: 'Administrar las verificaciones y certificados sostenibles.',
    icon: Award,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
    soon: true,
  },
  {
    id: 'cat',
    title: 'Categorías',
    desc: 'Definir tipos de negocio: Restaurante, Finca, Confecciones...',
    icon: LayoutGrid,
    iconBg: 'bg-terracotta-soft',
    iconColor: 'text-terracotta',
    soon: true,
  },
  {
    id: 'tags',
    title: 'Tags sostenibles',
    desc: 'Etiquetas: empaques biodegradables, productos locales, orgánicos...',
    icon: Tag,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-700',
    soon: true,
  },
  {
    id: 'gender',
    title: 'Géneros e identidades',
    desc: 'Configurar las opciones de identidad de género del registro.',
    icon: Compass,
    iconBg: 'bg-primary-softest',
    iconColor: 'text-primary-mid',
    soon: true,
  },
];

const PERIODS = ['7d', '30d', '90d', '1a'];

const PERIOD_LABEL = {
  '7d': 'los últimos 7 días',
  '30d': 'los últimos 30 días',
  '90d': 'los últimos 90 días',
  '1a': 'el último año',
};

// ─── Configuración de tipos de actividad ─────────────────────────────────────

const ACTIVITY_CONFIG = {
  'user-register': {
    Icon: UserPlus,
    bg: 'bg-blue-50',
    color: 'text-blue-700',
    label: name => (
      <>
        <span className="font-semibold">{name}</span> se registró en la plataforma
      </>
    ),
  },
  'biz-approved': {
    Icon: CheckCircle2,
    bg: 'bg-ok-bg',
    color: 'text-ok-text',
    label: name => (
      <>
        <span className="font-semibold">&ldquo;{name}&rdquo;</span> fue verificado y aprobado
      </>
    ),
  },
  'biz-pending': {
    Icon: Clock,
    bg: 'bg-warn-bg',
    color: 'text-warn-text',
    label: name => (
      <>
        <span className="font-semibold">&ldquo;{name}&rdquo;</span> solicitó registro como negocio
      </>
    ),
  },
  'biz-rejected': {
    Icon: XCircle,
    bg: 'bg-red-50',
    color: 'text-red-600',
    label: name => (
      <>
        <span className="font-semibold">&ldquo;{name}&rdquo;</span> fue rechazado por el administrador
      </>
    ),
  },
  'biz-revoked': {
    Icon: PowerOff,
    bg: 'bg-gray-100',
    color: 'text-gray-500',
    label: name => (
      <>
        <span className="font-semibold">&ldquo;{name}&rdquo;</span> fue revocado y desactivado
      </>
    ),
  },
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function QuickCard({ item, stats }) {
  const Icon = item.icon;
  const statValue = item.statKey ? (stats?.[item.statKey] ?? '—') : '—';
  const pending = item.pendingKey ? stats?.[item.pendingKey] : null;

  const inner = (
    <div
      className={`bg-card-bg border border-edge rounded-2xl p-5 flex flex-col gap-3 text-left transition-all duration-200 h-full ${
        item.soon
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:-translate-y-0.5 hover:shadow-warm hover:border-primary-softest cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </span>
        <span className="w-8 h-8 rounded-lg bg-app-bg flex items-center justify-center text-muted">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>

      <div>
        <p className="font-serif text-xl text-heading leading-snug">{item.title}</p>
        <p className="text-xs text-muted mt-1 leading-relaxed">{item.desc}</p>
      </div>

      <div className="flex items-center gap-2 pt-3 mt-auto border-t border-edge text-xs text-muted">
        {item.soon ? (
          <span className="px-2 py-0.5 rounded-full bg-app-bg text-muted text-[10px] font-medium tracking-wide uppercase">
            Próximamente
          </span>
        ) : (
          <>
            <span className="font-semibold text-sm text-heading">
              {typeof statValue === 'number' ? statValue.toLocaleString('es-CO') : statValue}
            </span>
            <span>{item.statLabel}</span>
            {pending != null && pending > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-terracotta-soft text-terracotta text-[11px] font-medium">
                {pending} pendientes
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (item.soon || !item.to) return <div>{inner}</div>;
  return (
    <Link to={item.to} className="group block">
      {inner}
    </Link>
  );
}

function MetricChart({ title, subtitle, series, color, statLabel, statValue, loading, period }) {
  return (
    <div className="bg-card-bg border border-edge rounded-2xl p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-serif text-xl text-heading">{title}</h3>
          <p className="text-xs text-muted mt-1">{loading ? '…' : subtitle}</p>
        </div>
        <span
          className="w-3 h-3 rounded-sm mt-1.5 shrink-0"
          style={{ background: color }}
        />
      </div>

      {loading ? (
        <div className="h-[200px] bg-app-bg rounded-xl animate-pulse" />
      ) : series.length >= 2 ? (
        <UserLineChart series={series} color={color} />
      ) : (
        <div className="h-[200px] flex flex-col items-center justify-center text-muted gap-2">
          <TrendingUp className="w-7 h-7 opacity-40" />
          <p className="text-xs text-center">Sin datos para {PERIOD_LABEL[period]}</p>
        </div>
      )}

      <div className="mt-4 p-3.5 bg-app-bg rounded-xl">
        <p className="text-[11px] text-muted uppercase tracking-wider">{statLabel}</p>
        <p className="font-serif text-2xl text-heading mt-1">
          {loading ? '—' : (typeof statValue === 'number' ? statValue.toLocaleString('es-CO') : '0')}
        </p>
      </div>
    </div>
  );
}

function ModQueueItem({ item, onApprove, onReject, loading }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-edge bg-card-bg hover:border-primary-softest transition-colors">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-serif text-lg"
        style={{ background: item.color }}
      >
        {item.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-heading truncate">{item.name}</p>
        <p className="text-xs text-muted mt-0.5">
          {item.category} · enviado {item.when}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onApprove(item.id)}
          disabled={!!loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-ok-bg text-ok-text hover:brightness-95 transition-all disabled:opacity-50"
        >
          {loading === 'approve' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          Aprobar
        </button>
        <button
          onClick={() => onReject(item.id)}
          disabled={!!loading}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-terracotta hover:bg-terracotta-soft transition-colors disabled:opacity-50"
        >
          {loading === 'reject' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
        </button>
        <Link
          to="/adminDashboard/negocios"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-app-bg transition-colors"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function ActivityItem({ item }) {
  const cfg = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG['user-register'];
  const { Icon, bg, color } = cfg;

  return (
    <div
      className="grid gap-3 py-3 border-b border-edge last:border-b-0 items-start"
      style={{ gridTemplateColumns: '36px 1fr auto' }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-heading leading-snug">{cfg.label(item.text)}</p>
        <span className="text-xs text-muted mt-0.5 block">{item.meta}</span>
      </div>
      <span className="text-[11px] text-muted whitespace-nowrap pt-0.5">{item.time}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card-bg border border-edge rounded-2xl p-5 animate-pulse flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="w-11 h-11 rounded-xl bg-app-bg" />
        <div className="w-8 h-8 rounded-lg bg-app-bg" />
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-app-bg rounded-lg w-3/4" />
        <div className="h-3 bg-app-bg rounded w-full" />
        <div className="h-3 bg-app-bg rounded w-2/3" />
      </div>
      <div className="pt-3 border-t border-edge">
        <div className="h-3 bg-app-bg rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { stats, loading, refreshing, lastUpdated, reload } = useAdminStats();
  const secondsSince = useSecondsSince(lastUpdated);
  const [period, setPeriod] = useState('30d');
  const [actionLoading, setActionLoading] = useState({});
  const toast = useToastContext();

  // Usar allProfiles porque GET /user no expone createdAt; GET /perfil sí lo incluye
  const userSeries = useMemo(
    () => buildCumulativeSeries(stats?.allProfiles ?? [], period),
    [stats?.allProfiles, period]
  );

  const bizSeries = useMemo(
    () =>
      buildCumulativeSeries(
        stats?.allBizList ?? [],
        period,
        b => b.status === 'Active'
      ),
    [stats?.allBizList, period]
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const handleApprove = async id => {
    setActionLoading(prev => ({ ...prev, [id]: 'approve' }));
    try {
      await changeBusinessStatus(id, 'Active');
      toast.success('Negocio aprobado correctamente');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Error al aprobar el negocio');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async id => {
    setActionLoading(prev => ({ ...prev, [id]: 'reject' }));
    try {
      await changeBusinessStatus(id, 'Rejected');
      toast.success('Negocio rechazado');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Error al rechazar el negocio');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">

      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 bg-gradient-to-br from-primary-softest/40 to-app-bg border border-primary-softest rounded-2xl p-5 lg:p-6">
        <div className="w-14 h-14 rounded-xl bg-primary-dark flex items-center justify-center shrink-0">
          <ShieldCheck className="w-7 h-7 text-on-dark-active" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl lg:text-3xl text-heading leading-tight">
            {greeting},{' '}
            <em className="text-primary-dark not-italic font-serif">
              {loading ? '…' : (stats?.adminName ?? 'Administrador')}
            </em>
          </h1>
          <p className="text-sm text-muted mt-1">Panel de administración · Consumo Sostenible</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/60 border border-white/40 text-body">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
              Sistema operativo
            </span>
            {!loading && (stats?.pendingCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/60 border border-white/40 text-body">
                <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                {stats.pendingCount} negocios esperan aprobación
              </span>
            )}
            {!loading && stats && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/60 border border-white/40 text-body">
                <strong className="text-heading">{stats.totalUsers.toLocaleString('es-CO')}</strong>
                &nbsp;usuarios registrados
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Accesos rápidos ────────────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-1">
            Accesos rápidos
          </p>
          <h2 className="font-serif text-2xl text-heading">Gestionar la plataforma</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : QUICK_ACCESS.map(item => (
                <QuickCard key={item.id} item={item} stats={stats} />
              ))}
        </div>
      </section>

      {/* ── Métricas ──────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-1">
              Métricas en vivo
            </p>
            <h2 className="font-serif text-2xl text-heading">Crecimiento de la comunidad</h2>
          </div>
          <div className="flex items-center gap-1 p-1 bg-app-bg border border-edge rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p
                    ? 'bg-card-bg shadow-warm-sm text-heading border border-edge'
                    : 'text-muted hover:text-body'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Usuarios totales */}
          <MetricChart
            title="Usuarios registrados"
            subtitle={`${stats?.totalUsers?.toLocaleString('es-CO') ?? 0} usuarios en total`}
            series={userSeries}
            color="#1F3D2B"
            statLabel="Total acumulado"
            statValue={stats?.totalUsers}
            loading={loading}
            period={period}
          />

          {/* Negocios aceptados */}
          <MetricChart
            title="Negocios aprobados"
            subtitle={`${stats?.totalBizActive?.toLocaleString('es-CO') ?? 0} negocios verificados`}
            series={bizSeries}
            color="#C76E4A"
            statLabel="Total aprobados"
            statValue={stats?.totalBizActive}
            loading={loading}
            period={period}
          />

          {/* Negocios por categoría */}
          <div className="bg-card-bg border border-edge rounded-2xl p-5">
            <div className="mb-4">
              <h3 className="font-serif text-xl text-heading">Por categoría</h3>
              <p className="text-xs text-muted mt-1">
                {loading ? '…' : `${stats?.totalBiz ?? 0} negocios en plataforma`}
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="flex justify-between">
                      <div className="h-3 bg-app-bg rounded w-1/2" />
                      <div className="h-3 bg-app-bg rounded w-10" />
                    </div>
                    <div className="h-2 bg-app-bg rounded-full" />
                  </div>
                ))}
              </div>
            ) : (stats?.bizByCategory?.length ?? 0) > 0 ? (
              <div className="flex flex-col gap-3.5">
                {stats.bizByCategory.map(cat => {
                  const maxCount = stats.bizByCategory[0]?.count || 1;
                  const pct = Math.round((cat.count / maxCount) * 100);
                  return (
                    <div key={cat.label} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-heading flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                            style={{ background: cat.color }}
                          >
                            {cat.label[0]}
                          </span>
                          {cat.label}
                        </span>
                        <span className="font-semibold text-heading">
                          {cat.count}
                          <small className="font-normal text-muted ml-1">neg.</small>
                        </span>
                      </div>
                      <div className="h-2 bg-app-bg rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted text-sm">
                Sin datos de categorías
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Moderación + Actividad ─────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Moderation queue */}
          <div className="bg-card-bg border border-edge rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-xl text-heading">Negocios por moderar</h3>
                <p className="text-xs text-muted mt-1">
                  {loading ? '…' : `${stats?.pendingCount ?? 0} pendientes · revisa antes de aprobar`}
                </p>
              </div>
              <Link
                to="/adminDashboard/negocios"
                className="flex items-center gap-1 text-xs font-medium text-primary-dark hover:text-primary-mid transition-colors whitespace-nowrap"
              >
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl border border-edge animate-pulse">
                    <div className="w-11 h-11 rounded-xl bg-app-bg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-app-bg rounded w-3/4" />
                      <div className="h-3 bg-app-bg rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (stats?.pendingQueue?.length ?? 0) > 0 ? (
              <div className="flex flex-col gap-2">
                {stats.pendingQueue.map(item => (
                  <ModQueueItem
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={actionLoading[item.id]}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-muted gap-2">
                <Check className="w-8 h-8 opacity-40" />
                <p className="text-sm">No hay negocios pendientes</p>
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="bg-card-bg border border-edge rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-serif text-xl text-heading">Actividad reciente</h3>
                <p className="text-xs text-muted mt-1">
                  {lastUpdated
                    ? `Actualizado hace ${secondsSince}s · se refresca cada 30s`
                    : 'Cargando…'}
                </p>
              </div>
              <button
                onClick={reload}
                disabled={loading || refreshing}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-edge text-xs font-medium text-muted hover:text-body hover:border-primary-light transition-colors disabled:opacity-40"
                title="Actualizar ahora"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando…' : 'Actualizar'}
              </button>
            </div>

            {loading ? (
              <div className="divide-y divide-edge">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 py-3 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-app-bg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-app-bg rounded w-full" />
                      <div className="h-3 bg-app-bg rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (stats?.activity?.length ?? 0) > 0 ? (
              <div>
                {stats.activity.map(item => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-muted gap-2">
                <UserPlus className="w-8 h-8 opacity-40" />
                <p className="text-sm">Sin actividad reciente</p>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
