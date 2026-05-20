import {
  AlertTriangle,
  Bell,
  Calendar,
  ShieldAlert,
  Star,
  TrendingDown,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useToastContext } from '../../context/ToastContext';
import { useNotificationsContext } from '../../context/NotificationsContext';

const ALERT_CONFIG = {
  critical_rating:       { Icon: TrendingDown, color: 'text-red-500',    bg: 'bg-red-50',           label: 'Calificación crítica'         },
  accumulated_negatives: { Icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50',        label: 'Reseñas negativas acumuladas' },
  suspicious_review:     { Icon: ShieldAlert,  color: 'text-yellow-600', bg: 'bg-yellow-50',        label: 'Reseña sospechosa'            },
  negative_review:       { Icon: Star,         color: 'text-red-400',    bg: 'bg-red-50',           label: 'Reseña negativa'              },
  weekly_summary:        { Icon: Calendar,     color: 'text-primary-dark', bg: 'bg-primary-softest', label: 'Reporte semanal'              },
};

const AUTO_CLEAR_THRESHOLD = 5;

// ── Card flotante arrastrable (renderizada en <body> via portal) ──────────────
function AlertDetailCard({ alert, anchorRef, onClose }) {
  const cfg     = ALERT_CONFIG[alert.alertType] ?? ALERT_CONFIG.negative_review;
  const date    = new Date(alert.timestamp);
  const dateStr = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // Posición inicial: justo a la izquierda del dropdown (w-80 = 320px)
  const getInitialPos = () => {
    if (!anchorRef?.current) return { x: window.innerWidth - 700, y: 72 };
    const rect     = anchorRef.current.getBoundingClientRect();
    const cardW    = 288; // w-72
    const dropdownW = 320; // w-80
    const gap      = 8;
    // borde derecho del dropdown = rect.right; borde izquierdo = rect.right - dropdownW
    // card queda gap px a la izquierda del borde izquierdo del dropdown
    const x = Math.max(8, rect.right - dropdownW - gap - cardW);
    const y = rect.bottom + gap;
    return { x, y };
  };

  const [pos, setPos]       = useState(getInitialPos);
  const dragging            = useRef(false);
  const dragOffset          = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e) => {
    // No iniciar drag desde el botón X
    if (e.target.closest('button')) return;
    dragging.current  = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const cardW = 288;
      const cardH = 300; // estimado
      const newX  = Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth  - cardW);
      const newY  = Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - cardH);
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
      {/* Cabecera — zona de arrastre */}
      <div
        onMouseDown={onMouseDown}
        className={`flex items-center gap-2 px-4 py-3 ${cfg.bg} cursor-grab active:cursor-grabbing`}
      >
        <div className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
          <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </div>
        <p className={`text-xs font-bold flex-1 ${cfg.color}`}>{cfg.label}</p>
        <button
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="text-muted hover:text-body transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cuerpo */}
      <div className="px-4 py-3 space-y-2">
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wide">Negocio</p>
          <p className="text-xs font-semibold text-heading">{alert.businessName || '—'}</p>
        </div>

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

        {alert.alertType === 'suspicious_review' && (
          <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg px-2 py-1.5">
            Se detectó incongruencia entre la calificación del usuario y el análisis de IA.
          </p>
        )}

        {alert.alertType === 'negative_review' && alert.urgency === 'high' && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1.5">
            Reseña con alta probabilidad negativa — revisión recomendada.
          </p>
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

        <p className="text-[10px] text-muted pt-1 border-t border-edge/40">{dateStr} · {timeStr}</p>
      </div>
    </div>,
    document.body,
  );
}

// ── Fila de alerta ────────────────────────────────────────────────────────────
function AlertItem({ alert, onSelect }) {
  const cfg  = ALERT_CONFIG[alert.alertType] ?? ALERT_CONFIG.negative_review;
  const time = new Date(alert.timestamp).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit',
  });

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
      <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${alert.isRead ? 'text-muted' : 'text-heading'}`}>
          {cfg.label}
        </p>
        <p className="text-xs text-muted truncate">{alert.businessName}</p>
      </div>
      <span className="text-[10px] text-muted shrink-0 mt-1">{time}</span>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function NotificationBell() {
  const context  = useNotificationsContext();
  const { error: showError } = useToastContext();

  const [open, setOpen]               = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const ref      = useRef(null);
  const shownRef = useRef(new Set());

  const alerts        = context?.alerts        ?? [];
  const unreadCount   = context?.unreadCount   ?? 0;
  const clearAlerts   = context?.clearAlerts   ?? (() => {});
  const markRead      = context?.markRead      ?? (() => {});
  const weeklySummary = context?.weeklySummary ?? null;

  const unread = alerts.filter((a) => !a.isRead);
  const read   = alerts.filter((a) =>  a.isRead);

  // Cerrar dropdown al clic fuera (la card flotante es independiente)
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape cierra dropdown y card flotante
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Toast automático para alertas nuevas no leídas (WS)
  useEffect(() => {
    if (!alerts.length) return;
    const latest = alerts[0];
    if (latest.isRead) return;
    const key = `${latest.id ?? latest.reviewId ?? ''}-${latest.alertType ?? ''}-${latest.timestamp}`;
    if (shownRef.current.has(key)) return;
    shownRef.current.add(key);

    if (latest.urgency === 'high') {
      showError(`Reseña negativa urgente en ${latest.businessName}`);
    } else if (latest.alertType === 'critical_rating') {
      showError(`⚠️ ${latest.businessName}: calificación bajó a ${Number(latest.currentRating ?? 0).toFixed(2)} ★`);
    }
  }, [alerts, showError]);

  // Auto-limpiar en múltiplos de 5
  useEffect(() => {
    if (alerts.length > 0 && alerts.length % AUTO_CLEAR_THRESHOLD === 0) {
      clearAlerts();
      setSelectedAlert(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts.length]);

  if (!context?.isOwner && !context?.isAdmin) return null;

  const handleSelect = (alert) => {
    setSelectedAlert((prev) => prev?.id === alert.id ? null : alert);
    if (!alert.isRead && alert.id) markRead(alert.id);
  };

  return (
    <>
      {/* Card flotante — posicionada a la izquierda del dropdown */}
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
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-card-bg rounded-2xl shadow-2xl border border-edge z-50 overflow-hidden">
            {/* Cabecera */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-edge/50">
              <div>
                <p className="text-sm font-semibold text-heading">Notificaciones</p>
                {alerts.length > 0 && (
                  <p className="text-[10px] text-muted">
                    Se limpian cada {AUTO_CLEAR_THRESHOLD} · {alerts.length}/{AUTO_CLEAR_THRESHOLD}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {alerts.length > 0 && (
                  <button
                    onClick={() => { clearAlerts(); setSelectedAlert(null); }}
                    className="text-xs text-muted hover:text-body transition-colors"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar notificaciones"
                  className="text-muted hover:text-body transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
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
                <p className="text-xs">Sin notificaciones</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
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
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
