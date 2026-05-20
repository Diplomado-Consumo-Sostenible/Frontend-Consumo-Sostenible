import {
  AlertTriangle,
  Ban,
  BadgeCheck,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  EyeOff,
  Package,
  RotateCcw,
  ShieldCheck,
  TrendingDown,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useToastContext } from '../../context/ToastContext';
import { useNotificationsContext } from '../../context/NotificationsContext';

const ALERT_CONFIG = {
  critical_rating:       { Icon: TrendingDown,  color: 'text-red-500',      bg: 'bg-red-50',           label: 'Calificación crítica'         },
  accumulated_negatives: { Icon: AlertTriangle,  color: 'text-orange-500',   bg: 'bg-orange-50',        label: 'Reseñas negativas acumuladas' },
  weekly_summary:        { Icon: Calendar,       color: 'text-primary-dark', bg: 'bg-primary-softest',  label: 'Reporte semanal'              },
  new_product:           { Icon: Package,        color: 'text-emerald-600',  bg: 'bg-emerald-50',       label: 'Nuevo producto'               },
  review_hidden:         { Icon: EyeOff,         color: 'text-amber-600',    bg: 'bg-amber-50',         label: 'Reseña oculta'              },
  review_deleted:        { Icon: Ban,             color: 'text-red-600',      bg: 'bg-red-50',           label: 'Reseña eliminada'             },
  review_restored:       { Icon: ShieldCheck,     color: 'text-green-600',    bg: 'bg-green-50',         label: 'Reseña restaurada'            },
  business_created:      { Icon: Clock,           color: 'text-indigo-600',   bg: 'bg-indigo-50',        label: 'Negocio en revisión'          },
  business_approved:     { Icon: BadgeCheck,      color: 'text-emerald-600',  bg: 'bg-emerald-50',       label: 'Negocio aprobado'             },
  business_rejected:     { Icon: XCircle,         color: 'text-red-600',      bg: 'bg-red-50',           label: 'Negocio rechazado'            },
  business_resubmitted:  { Icon: RotateCcw,       color: 'text-blue-600',     bg: 'bg-blue-50',          label: 'Solicitud reenviada'          },
};

const HIDDEN_TYPES = new Set(['negative_review', 'suspicious_review']);

// ── Card flotante arrastrable ────
function AlertDetailCard({ alert, anchorRef, onClose }) {
  const cfg     = ALERT_CONFIG[alert.alertType] ?? ALERT_CONFIG.critical_rating;
  const date    = new Date(alert.timestamp);
  const dateStr = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const [pos, setPos] = useState({ x: window.innerWidth - 700, y: 72 });
  const dragging      = useRef(false);
  const dragOffset    = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!anchorRef?.current) return;
    const rect      = anchorRef.current.getBoundingClientRect();
    const cardW     = 288;
    const dropdownW = 320;
    const gap       = 8;
    setPos({
      x: Math.max(8, rect.right - dropdownW - gap - cardW),
      y: rect.bottom + gap,
    });
  }, [anchorRef]);

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return;
    dragging.current   = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const newX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth  - 288);
      const newY = Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 300);
      setPos({ x: newX, y: newY });
    };
    const onUp = () => { dragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };
  }, []);

  return createPortal(
    <div
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-[9999] w-72 bg-card-bg rounded-2xl shadow-2xl border border-edge overflow-hidden select-none"
      role="dialog"
      aria-label="Detalle de notificación"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        onMouseDown={onMouseDown}
        className={`flex items-center gap-2 px-4 py-3 ${cfg.bg} cursor-grab active:cursor-grabbing`}
      >
        <div className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
          <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </div>
        <p className={`text-xs font-bold flex-1 ${cfg.color}`}>{cfg.label}</p>
        <button onClick={onClose} aria-label="Cerrar detalle" className="text-muted hover:text-body transition-colors cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-2">
        {alert.alertType === 'critical_rating' && alert.currentRating != null && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Calificación actual</p>
            <p className="text-sm font-bold text-red-500">{Number(alert.currentRating).toFixed(2)} ★</p>
            <p className="text-[10px] text-muted mt-0.5">El promedio cayó por debajo de 3.5</p>
          </div>
        )}

        {alert.alertType === 'accumulated_negatives' && alert.totalNegatives != null && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Reseñas negativas (últimos 30 días)</p>
            <p className="text-sm font-bold text-orange-500">{alert.totalNegatives}</p>
          </div>
        )}

        {alert.alertType === 'weekly_summary' && alert.stats && (
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Total',     value: alert.stats.total    ?? 0 },
              { label: 'Positivas', value: alert.stats.positive ?? 0 },
              { label: 'Negativas', value: alert.stats.negative ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-primary-softest rounded-lg py-1.5">
                <p className="text-xs font-bold text-primary-dark">{value}</p>
                <p className="text-[10px] text-muted">{label}</p>
              </div>
            ))}
          </div>
        )}

        {alert.alertType === 'new_product' && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Nuevo producto disponible</p>
            <p className="text-sm font-bold text-emerald-600">{alert.productName}</p>
          </div>
        )}

        {alert.alertType === 'review_hidden' && alert.businessName && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Negocio</p>
            <p className="text-sm font-bold text-amber-600">{alert.businessName}</p>
            <p className="text-[10px] text-muted mt-0.5">
              Tu reseña fue ocultada temporalmente por múltiples reportes y está en revisión.
            </p>
          </div>
        )}

        {alert.alertType === 'review_deleted' && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Incumplimiento de normas</p>
            {alert.businessName && (
              <p className="text-sm font-bold text-red-600">{alert.businessName}</p>
            )}
            <p className="text-[10px] text-muted mt-0.5">
              Tu reseña fue eliminada por el equipo de moderación.
            </p>
            {alert.penaltyCount != null && (
              <p className={`text-[10px] font-semibold mt-1 ${alert.isBanned ? 'text-red-600' : 'text-orange-500'}`}>
                {alert.isBanned
                  ? '⚠️ Tu cuenta ha sido suspendida por acumular 3 penalizaciones.'
                  : `Penalización ${alert.penaltyCount} de 3. Con 3 tu cuenta será suspendida.`}
              </p>
            )}
          </div>
        )}

        {alert.alertType === 'review_restored' && alert.businessName && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Negocio</p>
            <p className="text-sm font-bold text-green-600">{alert.businessName}</p>
            <p className="text-[10px] text-muted mt-0.5">
              Tu reseña fue revisada por nuestro equipo y está visible nuevamente. Los reportes
              recibidos no ameritaban penalización.
            </p>
          </div>
        )}

        {alert.alertType === 'business_created' && alert.businessName && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Negocio registrado</p>
            <p className="text-sm font-bold text-indigo-600">{alert.businessName}</p>
            <p className="text-[10px] text-muted mt-0.5">
              Tu negocio fue creado con éxito y está pendiente de revisión. Nuestro equipo evaluará
              si cumple con los requisitos de la plataforma y te notificaremos la decisión.
            </p>
          </div>
        )}

        {alert.alertType === 'business_approved' && alert.businessName && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">¡Negocio aprobado!</p>
            <p className="text-sm font-bold text-emerald-600">{alert.businessName}</p>
            <p className="text-[10px] text-muted mt-0.5">
              Tu negocio ha sido aprobado. Ya puedes configurar tu perfil, agregar productos y
              comenzar a recibir reseñas de tus clientes.
            </p>
          </div>
        )}

        {alert.alertType === 'business_rejected' && alert.businessName && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Negocio rechazado</p>
            <p className="text-sm font-bold text-red-600">{alert.businessName}</p>
            {alert.rejectionReason && (
              <p className="text-[10px] text-red-500 mt-0.5">
                <span className="font-semibold">Motivo:</span> {alert.rejectionReason}
              </p>
            )}
            <p className="text-[10px] text-muted mt-1">
              Puedes corregir la información de tu negocio y reenviar la solicitud para una nueva revisión.
            </p>
          </div>
        )}

        {alert.alertType === 'business_resubmitted' && alert.businessName && (
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wide">Solicitud reenviada</p>
            <p className="text-sm font-bold text-blue-600">{alert.businessName}</p>
            <p className="text-[10px] text-muted mt-0.5">
              Tu solicitud fue reenviada a revisión. Te notificaremos cuando nuestro equipo tome una
              decisión sobre tu negocio.
            </p>
          </div>
        )}

        <p className="text-[10px] text-muted pt-1 border-t border-edge/40">{dateStr} · {timeStr}</p>
      </div>
    </div>,
    document.body,
  );
}

// ── Fila de alerta ────
function AlertItem({ alert, onSelect, onDelete }) {
  const cfg  = ALERT_CONFIG[alert.alertType] ?? ALERT_CONFIG.critical_rating;
  const time = new Date(alert.timestamp).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit',
  });

  const isNewProduct    = alert.alertType === 'new_product';
  const isReviewAlert   = alert.alertType === 'review_hidden'
                       || alert.alertType === 'review_restored'
                       || alert.alertType === 'review_deleted';
  const businessLogo    = alert.businessLogo ?? null;
  const businessName    = alert.businessName ?? null;
  const productName     = alert.productName  ?? null;

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(alert.id);
  };

  return (
    <div
      onClick={() => onSelect(alert)}
      className={`relative flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
        alert.isRead
          ? 'hover:bg-primary-softest/20'
          : 'bg-primary-softest/40 hover:bg-primary-softest/60'
      }`}
    >
      {!alert.isRead && (
        <span className="absolute left-2 top-4 w-1.5 h-1.5 rounded-full bg-primary-dark" />
      )}

      {/* Icono: logo del negocio para new_product*/}
      {isNewProduct ? (
        businessLogo ? (
          <img
            src={businessLogo}
            alt={businessName ?? 'Negocio'}
            className="w-10 h-10 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
            <cfg.Icon className={`w-5 h-5 ${cfg.color}`} />
          </div>
        )
      ) : (
        <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${alert.isRead ? 'text-muted' : 'text-heading'}`}>
          {cfg.label}
        </p>
        {isNewProduct && businessName && (
          <p className="text-xs text-muted truncate">{businessName}</p>
        )}
        {isNewProduct && productName && (
          <p className={`text-xs truncate ${alert.isRead ? 'text-muted' : cfg.color}`}>{productName}</p>
        )}
        {isReviewAlert && businessName && (
          <p className={`text-xs truncate ${alert.isRead ? 'text-muted' : cfg.color}`}>{businessName}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 mt-0.5">
        <span className="text-[10px] text-muted">{time}</span>
        {alert.id && (
          <button
            onClick={handleDelete}
            aria-label="Eliminar notificación"
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ────
export default function NotificationBell() {
  const context  = useNotificationsContext();
  const navigate = useNavigate();
  const { error: showError } = useToastContext();

  const [open, setOpen]               = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const ref      = useRef(null);
  const shownRef = useRef(new Set());

  const rawAlerts     = context?.alerts        ?? [];
  const markRead      = context?.markRead      ?? (() => {});
  const deleteAlert   = context?.deleteAlert   ?? (() => {});
  const weeklySummary = context?.weeklySummary ?? null;
  const isUser        = context?.isUser        ?? false;

  const historyPath = isUser ? '/notificaciones' : '/dashboardBusiness/notificaciones';

  const alerts = rawAlerts.filter((a) => !HIDDEN_TYPES.has(a.alertType));
  const unread = alerts.filter((a) => !a.isRead);
  const read   = alerts.filter((a) =>  a.isRead);
  const visibleUnreadCount = unread.length;

  // Cuando las alertas se vacían (cambio de usuario) cerrar dropdown y detalle flotante
  useEffect(() => {
    if (rawAlerts.length === 0) {
      setOpen(false);
      setSelectedAlert(null);
    }
  }, [rawAlerts.length]);

  // Cerrar al clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape cierra
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);


  useEffect(() => {
    if (!alerts.length) return;
    const latest = alerts[0];
    if (latest.isRead) return;
    const key = `${latest.id ?? latest.reviewId ?? ''}-${latest.alertType ?? ''}-${latest.timestamp}`;
    if (shownRef.current.has(key)) return;
    shownRef.current.add(key);
    if (latest.alertType === 'critical_rating') {
      showError(`⚠️ ${latest.businessName}: calificación bajó a ${Number(latest.currentRating ?? 0).toFixed(2)} ★`);
    }
  }, [alerts, showError]);

  const handleSelect = (alert) => {
    if (!alert.isRead && alert.id) markRead(alert.id);
    if (alert.alertType === 'new_product' && alert.businessId) {
      setOpen(false);
      navigate(`/negocio/${alert.businessId}`);
      return;
    }
    setSelectedAlert((prev) => prev?.id === alert.id ? null : alert);
  };

  const handleDelete = (id) => {
    if (selectedAlert?.id === id) setSelectedAlert(null);
    deleteAlert(id);
  };

  return (
    <>
      {selectedAlert && (
        <AlertDetailCard alert={selectedAlert} anchorRef={ref} onClose={() => setSelectedAlert(null)} />
      )}

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Notificaciones"
          aria-expanded={open}
          className="relative w-9 h-9 rounded-xl hover:bg-edge/60 transition-colors flex items-center justify-center"
        >
          <Bell className="w-4 h-4 text-body" />
          {visibleUnreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {visibleUnreadCount > 9 ? '9+' : visibleUnreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-card-bg rounded-2xl shadow-2xl border border-edge z-50 overflow-hidden">
            {/* Cabecera */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-edge/50">
              <p className="text-sm font-semibold text-heading">Notificaciones</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar notificaciones"
                className="text-muted hover:text-body transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Banner de reporte semanal */}
            {weeklySummary && (
              <div className="mx-3 my-2 p-3 bg-primary-softest rounded-xl border border-primary-light/40">
                <p className="text-xs font-semibold text-primary-dark">Reporte semanal disponible</p>
                <p className="text-xs text-muted mt-0.5">
                  {weeklySummary.businessName} — {weeklySummary.stats?.total ?? 0} reseñas esta semana
                </p>
              </div>
            )}

            {/* Lista */}
            {alerts.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-muted">
                <Bell className="w-6 h-6 opacity-30" />
                <p className="text-xs">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {unread.length > 0 && (
                  <>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted uppercase tracking-wide">
                      No leídas · {unread.length}
                    </p>
                    <div className="divide-y divide-edge/40">
                      {unread.map((a, idx) => (
                        <AlertItem
                          key={`u-${a.id ?? a.reviewId ?? idx}`}
                          alert={a}
                          onSelect={handleSelect}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </>
                )}

                {read.length > 0 && (
                  <>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted uppercase tracking-wide border-t border-edge/30">
                      Leídas · {read.length}
                    </p>
                    <div className="divide-y divide-edge/40">
                      {read.map((a, idx) => (
                        <AlertItem
                          key={`r-${a.id ?? a.reviewId ?? idx}`}
                          alert={a}
                          onSelect={handleSelect}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Footer — Ver todas */}
            <div className="border-t border-edge/50 px-4 py-2.5">
              <Link
                to={historyPath}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full text-xs font-medium text-primary-dark hover:text-primary-darkest transition-colors"
              >
                Ver todas las notificaciones
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
