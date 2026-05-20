import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications/notifications.service';

const WS_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

/**
 * Normaliza una notificación persistida (BD) al mismo shape
 * que usan las alertas en tiempo real del WebSocket.
 */
export function normalizePersistedNotification(n) {
  const payload = n.payload ?? {};
  return {
    // campos de identidad
    id:           n.id,
    isRead:       n.isRead ?? false,
    // campos de alerta (copiados del payload o directos)
    alertType:    n.alertType ?? payload.alertType,
    businessId:   n.businessId ?? payload.businessId,
    businessName: payload.businessName ?? n.businessName ?? '',
    currentRating: payload.currentRating ?? null,
    totalNegatives: payload.totalNegatives ?? null,
    reviewId:     payload.reviewId ?? null,
    urgency:      payload.urgency ?? null,
    timestamp:    n.createdAt ?? payload.timestamp ?? new Date().toISOString(),
    // campos de resumen semanal
    stats:        payload.stats ?? null,
    // flag de origen
    persisted:    true,
  };
}

export default function useSentimentSocket({ businessId = null, enabled = false } = {}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected]     = useState(false);
  const [alerts, setAlerts]               = useState([]);       // historial completo (persistido + tiempo real)
  const [liveStream, setLiveStream]       = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [unreadCount, setUnreadCount]     = useState(0);

  // ── Carga inicial inyectada desde NotificationsContext ──────────
  const loadPersisted = useCallback((persistedList) => {
    const normalized = persistedList.map(normalizePersistedNotification);
    setAlerts(normalized.slice(0, 30));
    setUnreadCount(normalized.filter((n) => !n.isRead).length);
  }, []);

  // ── Marcar una como leída ────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
    } catch { /* silencioso */ }
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // ── Limpiar bandeja: marca como leídas en BD y vacía la lista local ─
  const clearAlerts = useCallback(async () => {
    try {
      await markAllNotificationsRead();
    } catch { /* silencioso */ }
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  const dismissWeeklySummary = useCallback(() => setWeeklySummary(null), []);

  // ── WebSocket ────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const socket = io(`${WS_URL}/notifications`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('sentiment:update', (data) => {
      setLiveStream((prev) => [data, ...prev].slice(0, 50));
    });

    socket.on('sentiment:alert', (data) => {
      // El backend ya persistió — adjuntamos el id que nos devuelva
      const alert = { ...data, isRead: false, persisted: true };
      setAlerts((prev) => [alert, ...prev].slice(0, 30));
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('sentiment:weekly_summary', (data) => {
      setWeeklySummary(data);
      const alert = { ...data, alertType: 'weekly_summary', isRead: false };
      setAlerts((prev) => [alert, ...prev].slice(0, 30));
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [enabled]);

  // ── Room del negocio ─────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !businessId) return;
    socket.emit('join_business_room', { businessId });
    return () => socket.emit('leave_business_room', { businessId });
  }, [businessId]);

  return {
    isConnected,
    alerts,
    liveStream,
    weeklySummary,
    unreadCount,
    loadPersisted,
    markRead,
    clearAlerts,
    dismissWeeklySummary,
  };
}
