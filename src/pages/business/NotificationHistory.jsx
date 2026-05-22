import {
  AlertCircle,
  AlertTriangle,
  Award,
  BadgeCheck,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  RotateCcw,
  Trash2,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNotificationsContext } from '../../context/NotificationsContext';
import {
  getMyNotificationsPaginated,
  deleteNotification,
} from '../../services/notifications/notifications.service';

const PAGE_SIZE = 10;

const ALERT_CONFIG = {
  critical_rating: {
    Icon: TrendingDown,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
    label: 'Calificación crítica',
  },
  accumulated_negatives: {
    Icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    label: 'Reseñas negativas acumuladas',
  },
  weekly_summary: {
    Icon: Calendar,
    color: 'text-primary-dark',
    bg: 'bg-primary-softest',
    border: 'border-primary-light/40',
    label: 'Reporte semanal',
  },
  business_created: {
    Icon: Clock,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    label: 'Negocio en revisión',
  },
  business_approved: {
    Icon: BadgeCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    label: 'Negocio aprobado',
  },
  business_rejected: {
    Icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    label: 'Negocio rechazado',
  },
  business_resubmitted: {
    Icon: RotateCcw,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    label: 'Solicitud reenviada',
  },
  certification_approved: {
    Icon: Award,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    label: 'Certificación aprobada',
  },
  certification_rejected: {
    Icon: Award,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    label: 'Certificación rechazada',
  },
};

const FALLBACK_CONFIG = {
  Icon: Bell,
  color: 'text-muted',
  bg: 'bg-edge/40',
  border: 'border-edge',
  label: 'Notificación',
};

function NotificationCard({ notification, onDelete, onRead, deleting }) {
  const cfg     = ALERT_CONFIG[notification.alertType] ?? FALLBACK_CONFIG;
  const date    = new Date(notification.createdAt ?? notification.timestamp);
  const dateStr = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const payload = notification.payload ?? {};

  const handleCardClick = () => {
    if (!notification.isRead) onRead?.(notification.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
        notification.isRead
          ? 'bg-slate-100 border-slate-200'
          : `bg-white ${cfg.border}`
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
        <cfg.Icon className={`h-5 w-5 ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
          {!notification.isRead && (
            <span className="inline-block w-2 h-2 rounded-full bg-primary-dark" />
          )}
        </div>

        {notification.alertType === 'critical_rating' && payload.currentRating != null && (
          <p className="text-sm text-red-500 mt-1">
            Calificación actual: <strong>{Number(payload.currentRating).toFixed(2)} ★</strong>
            {' '}— cayó por debajo de 3.5
          </p>
        )}
        {notification.alertType === 'accumulated_negatives' && payload.totalNegatives != null && (
          <p className="text-sm text-orange-600 mt-1">
            <strong>{payload.totalNegatives}</strong> reseñas negativas en los últimos 30 días
          </p>
        )}
        {notification.alertType === 'weekly_summary' && payload.stats && (
          <p className="text-sm text-muted mt-1">
            {payload.stats.total ?? 0} reseñas · {payload.stats.positive ?? 0} positivas ·{' '}
            {payload.stats.negative ?? 0} negativas
          </p>
        )}

        {notification.alertType === 'business_created' && (
          <p className="text-sm text-indigo-700 mt-1">
            Tu negocio <strong>{payload.businessName}</strong> fue registrado y está pendiente de
            revisión. Nuestro equipo evaluará si cumple con los requisitos de la plataforma y te
            notificaremos la decisión.
          </p>
        )}

        {notification.alertType === 'business_approved' && (
          <p className="text-sm text-emerald-700 mt-1">
            ¡Tu negocio <strong>{payload.businessName}</strong> ha sido aprobado! Ya puedes
            configurar tu perfil, agregar productos y comenzar a recibir reseñas de tus clientes.
          </p>
        )}

        {notification.alertType === 'business_rejected' && (
          <div className="mt-1 space-y-0.5">
            <p className="text-sm text-red-700">
              Tu negocio <strong>{payload.businessName}</strong> fue rechazado.
            </p>
            {payload.rejectionReason && (
              <p className="text-sm text-red-600">
                <span className="font-semibold">Motivo:</span> {payload.rejectionReason}
              </p>
            )}
            <p className="text-xs text-muted">
              Puedes corregir la información de tu negocio y reenviar la solicitud para una nueva revisión.
            </p>
          </div>
        )}

        {notification.alertType === 'business_resubmitted' && (
          <p className="text-sm text-blue-700 mt-1">
            Tu solicitud para <strong>{payload.businessName}</strong> fue reenviada a revisión.
            Te notificaremos cuando nuestro equipo tome una decisión.
          </p>
        )}

        {notification.alertType === 'certification_approved' && (
          <p className="text-sm text-emerald-700 mt-1">
            Tu certificación <strong>{payload.certificationName}</strong>
            {payload.issuingEntity ? ` (${payload.issuingEntity})` : ''} ha sido <strong>aprobada</strong> y ya es visible en tu perfil.
          </p>
        )}

        {notification.alertType === 'certification_rejected' && (
          <p className="text-sm text-red-700 mt-1">
            Tu certificación <strong>{payload.certificationName}</strong>
            {payload.issuingEntity ? ` (${payload.issuingEntity})` : ''} fue <strong>rechazada</strong>. Puedes editarla y reenviarla para revisión.
          </p>
        )}

        <p className="text-xs text-muted mt-1.5">{dateStr} · {timeStr}</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
        disabled={deleting}
        aria-label="Eliminar notificación"
        className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40 cursor-pointer"
      >
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        aria-label="Página anterior"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-edge/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-muted">
        Página <span className="font-semibold text-heading">{page}</span> de{' '}
        <span className="font-semibold text-heading">{totalPages}</span>
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted hover:bg-edge/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [deletingId, setDeletingId]       = useState(null);

  const { deleteAlert, markRead: markReadCtx } = useNotificationsContext() ?? {};


  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
  const showPaginator = total > PAGE_SIZE;

  const load = async (p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyNotificationsPaginated({ page: p, limit: PAGE_SIZE });
      setNotifications(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setError('No se pudo cargar el historial de notificaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleRead = async (id) => {
    if (markReadCtx) await markReadCtx(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      if (deleteAlert) {
        await deleteAlert(id);
      } else {
        await deleteNotification(id);
      }

      const remaining = notifications.filter((n) => n.id !== id);
      setNotifications(remaining);
      setTotal((prev) => Math.max(0, prev - 1));

      if (remaining.length === 0 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch {

    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="pl-14 pr-4 py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Historial de Notificaciones</h1>
        <p className="text-sm text-muted mt-0.5">
          Todas las alertas recibidas sobre tu negocio, ordenadas por fecha.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-primary-mid" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-muted">{error}</p>
          <button onClick={() => load(page)} className="text-sm text-primary-dark underline cursor-pointer">
            Reintentar
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted">
          <Bell className="w-10 h-10 opacity-25" />
          <p className="text-sm">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Sección: No leídas */}
          {notifications.some((n) => !n.isRead) && (
            <>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide px-1">
                No leídas · {notifications.filter((n) => !n.isRead).length}
              </p>
              {notifications.filter((n) => !n.isRead).map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onDelete={handleDelete}
                  onRead={handleRead}
                  deleting={deletingId === n.id}
                />
              ))}
            </>
          )}

          {/* Sección: Leídas */}
          {notifications.some((n) => n.isRead) && (
            <>
              <p className={`text-[10px] font-semibold text-muted uppercase tracking-wide px-1 ${
                notifications.some((n) => !n.isRead) ? 'pt-2 border-t border-edge/40' : ''
              }`}>
                Leídas · {notifications.filter((n) => n.isRead).length}
              </p>
              {notifications.filter((n) => n.isRead).map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onDelete={handleDelete}
                  onRead={handleRead}
                  deleting={deletingId === n.id}
                />
              ))}
            </>
          )}

          {showPaginator && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          )}

          {}
          <p className="text-center text-xs text-muted pt-1">
            {total} notificación{total !== 1 ? 'es' : ''} en total
          </p>
        </div>
      )}
    </div>
  );
}
