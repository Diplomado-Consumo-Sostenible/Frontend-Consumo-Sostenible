import {
  AlertCircle,
  Ban,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Loader2,
  Package,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationsContext } from '../../context/NotificationsContext';
import {
  getMyNotificationsPaginated,
  deleteNotification,
} from '../../services/notifications/notifications.service';

const PAGE_SIZE = 10;

const ALERT_CONFIG = {
  new_product: {
    Icon: Package,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    label: 'Nuevo producto',
  },
  review_hidden: {
    Icon: EyeOff,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    label: 'Reseña oculta',
  },
  review_deleted: {
    Icon: Ban,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    label: 'Reseña eliminada',
  },
  review_restored: {
    Icon: ShieldCheck,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    label: 'Reseña restaurada',
  },
};

const FALLBACK_CONFIG = {
  Icon: Bell,
  color: 'text-muted',
  bg: 'bg-edge/40',
  border: 'border-edge',
  label: 'Notificación',
};

function BusinessAvatar({ logo, name, size = 'md' }) {
  const dim      = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const iconSize = size === 'lg' ? 'w-6 h-6'   : 'w-5 h-5';

  if (logo) {
    return (
      <img
        src={logo}
        alt={name ?? 'Negocio'}
        className={`${dim} shrink-0 rounded-xl object-cover`}
      />
    );
  }
  return (
    <div className={`${dim} shrink-0 rounded-xl bg-primary-softest flex items-center justify-center`}>
      <Building2 className={`${iconSize} text-primary-dark opacity-50`} />
    </div>
  );
}

function NotificationCard({ notification, onDelete, onRead, deleting }) {
  const cfg     = ALERT_CONFIG[notification.alertType] ?? FALLBACK_CONFIG;
  const date    = new Date(notification.createdAt ?? notification.timestamp);
  const dateStr = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const payload = notification.payload ?? {};

  const businessId   = notification.businessId ?? payload.businessId ?? null;
  const businessName = payload.businessName ?? null;
  const businessLogo = payload.businessLogo ?? null;
  const productName  = payload.productName  ?? null;
  const productImage = payload.productImage ?? null;
  const penaltyCount = payload.penaltyCount ?? null;
  const isBanned     = payload.isBanned     ?? false;

  const isNewProduct = notification.alertType === 'new_product';

  const handleCardClick = () => {
    if (!notification.isRead) onRead?.(notification.id);
  };

  const content = (
    <div
      onClick={handleCardClick}
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
        notification.isRead
          ? 'bg-slate-100 border-slate-200'
          : `bg-white ${cfg.border}`
      }`}
    >
      {/* Logo del negocio (o icono genérico) */}
      {isNewProduct ? (
        <BusinessAvatar logo={businessLogo} name={businessName} />
      ) : (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
          <cfg.Icon className={`h-5 w-5 ${cfg.color}`} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Badge tipo + punto no leído */}
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
          {!notification.isRead && (
            <span className="inline-block w-2 h-2 rounded-full bg-primary-dark" />
          )}
        </div>

        {/* Nombre del negocio */}
        {isNewProduct && businessName && (
          <p className="text-sm font-semibold text-heading truncate">{businessName}</p>
        )}

        {/* Nombre del producto */}
        {isNewProduct && productName && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="w-5 h-5 rounded object-cover shrink-0"
              />
            ) : (
              <Package className={`w-3.5 h-3.5 shrink-0 ${cfg.color}`} />
            )}
            <p className="text-sm text-body truncate">{productName}</p>
          </div>
        )}

        {/* Reseña ocultada */}
        {notification.alertType === 'review_hidden' && businessName && (
          <p className="text-sm text-amber-700 mt-0.5">
            Tu reseña en <span className="font-semibold">{businessName}</span> fue oculta
            temporalmente por múltiples reportes y está en revisión.
          </p>
        )}

        {/* Reseña restaurada por moderación */}
        {notification.alertType === 'review_restored' && businessName && (
          <p className="text-sm text-green-700 mt-0.5">
            Tu reseña en <span className="font-semibold">{businessName}</span> fue revisada y
            está visible nuevamente. Los reportes recibidos no ameritaban penalización.
          </p>
        )}

        {/* Reseña eliminada por moderación */}
        {notification.alertType === 'review_deleted' && (
          <div className="mt-0.5 space-y-0.5">
            {businessName && (
              <p className="text-sm text-red-700">
                Tu reseña en <span className="font-semibold">{businessName}</span> fue eliminada
                por incumplimiento de normas.
              </p>
            )}
            {penaltyCount != null && (
              <p className={`text-xs font-semibold ${isBanned ? 'text-red-600' : 'text-orange-500'}`}>
                {isBanned
                  ? '⚠️ Tu cuenta ha sido suspendida por acumular 3 penalizaciones.'
                  : `Penalización ${penaltyCount} de 3. Con 3 tu cuenta será suspendida.`}
              </p>
            )}
          </div>
        )}

        {/* Fecha y hora */}
        <p className="text-xs text-muted mt-1.5">{dateStr} · {timeStr}</p>
      </div>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(notification.id); }}
        disabled={deleting}
        aria-label="Eliminar notificación"
        className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40 cursor-pointer"
      >
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );

  if (isNewProduct && businessId) {
    return (
      <Link to={`/negocio/${businessId}`} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
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

export default function UserNotificationHistory() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [deletingId, setDeletingId]       = useState(null);

  const { deleteAlert, markRead: markReadCtx } = useNotificationsContext() ?? {};

  const totalPages    = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
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
      /* silencioso */
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-primary-dark" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-heading">Mis Notificaciones</h1>
          <p className="text-sm text-muted">Alertas sobre los negocios que sigues.</p>
        </div>
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
          <Building2 className="w-10 h-10 opacity-25" />
          <p className="text-sm">Sigue negocios para recibir notificaciones</p>
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

          <p className="text-center text-xs text-muted pt-1">
            {total} notificación{total !== 1 ? 'es' : ''} en total
          </p>
        </div>
      )}
    </div>
  );
}
