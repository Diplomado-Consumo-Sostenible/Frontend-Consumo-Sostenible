import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications/notifications.service';

const WS_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');


export function normalizePersistedNotification(n) {
  const payload = n.payload ?? {};
  return {
    id:           n.id,
    isRead:       n.isRead ?? false,
    alertType:    n.alertType ?? payload.alertType,
    businessId:   n.businessId ?? payload.businessId,
    businessName: payload.businessName ?? n.businessName ?? '',
    currentRating: payload.currentRating ?? null,
    totalNegatives: payload.totalNegatives ?? null,
    reviewId:     payload.reviewId ?? null,
    urgency:      payload.urgency ?? null,
    timestamp:    n.createdAt ?? payload.timestamp ?? new Date().toISOString(),
    stats:        payload.stats ?? null,
    productId:    payload.productId    ?? null,
    productName:  payload.productName  ?? null,
    productImage: payload.productImage ?? null,
    businessLogo: payload.businessLogo ?? null,
    penaltyCount:    payload.penaltyCount    ?? null,
    isBanned:        payload.isBanned        ?? false,
    rejectionReason: payload.rejectionReason ?? null,
    persisted:    true,
  };
}

export default function useSentimentSocket({ businessId = null, userId = null, enabled = false } = {}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected]     = useState(false);
  const [alerts, setAlerts]               = useState([]);       // historial completo (persistido + tiempo real)
  const [liveStream, setLiveStream]       = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [unreadCount, setUnreadCount]     = useState(0);

  // ── Limpiar todo el estado al cambiar de usuario o al desconectarse ──
  // Esto garantiza que al cerrar sesión e iniciar con otra cuenta no queden
  // notificaciones de la sesión anterior sin necesidad de recargar la página.
  useEffect(() => {
    setAlerts([]);
    setLiveStream([]);
    setWeeklySummary(null);
    setUnreadCount(0);
  }, [userId, enabled]);

  // ── Carga inicial inyectada desde NotificationsContext ──────────
  const loadPersisted = useCallback((persistedList) => {
    const normalized = persistedList.map(normalizePersistedNotification);
    setAlerts(normalized.slice(0, 30));
    setUnreadCount(normalized.filter((n) => !n.isRead).length);
  }, []);

  // ── Marcar una como leída ──────
  const markRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
    } catch {  }
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // ── Limpiar bandeja: marca como leídas en BD y vacía la lista local ─
  const clearAlerts = useCallback(async () => {
    try {
      await markAllNotificationsRead();
    } catch {  }
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  const dismissWeeklySummary = useCallback(() => setWeeklySummary(null), []);

  // ── Eliminar una notificación ────
  const deleteAlert = useCallback(async (id) => {
    try {
      await deleteNotification(id);
    } catch {  }
    setAlerts((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target && !target.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  // ── WebSocket ──────
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

    socket.on('product:new', (data) => {
      const alert = {
        ...data,
        alertType: 'new_product',
        isRead:    false,
        persisted: true,
        timestamp: data.timestamp ?? new Date().toISOString(),
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 30));
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('review:hidden', (data) => {
      const alert = {
        ...data,
        alertType: 'review_hidden',
        isRead:    false,
        persisted: true,
        timestamp: data.timestamp ?? new Date().toISOString(),
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 30));
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('review:deleted', (data) => {
      const alert = {
        ...data,
        alertType: 'review_deleted',
        isRead:    false,
        persisted: true,
        timestamp: data.timestamp ?? new Date().toISOString(),
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 30));
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('review:restored', (data) => {
      const alert = {
        ...data,
        alertType: 'review_restored',
        isRead:    false,
        persisted: true,
        timestamp: data.timestamp ?? new Date().toISOString(),
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 30));
      setUnreadCount((prev) => prev + 1);
    });

    for (const [event, alertType] of [
      ['business:created',     'business_created'],
      ['business:approved',    'business_approved'],
      ['business:rejected',    'business_rejected'],
      ['business:resubmitted', 'business_resubmitted'],
    ]) {
      socket.on(event, (data) => {
        const alert = {
          ...data,
          alertType,
          isRead:    false,
          persisted: true,
          timestamp: data.timestamp ?? new Date().toISOString(),
        };
        setAlerts((prev) => [alert, ...prev].slice(0, 30));
        setUnreadCount((prev) => prev + 1);
      });
    }

    socket.on('notifications:init', (notifications) => {
      if (Array.isArray(notifications) && notifications.length > 0) {
        loadPersisted(notifications);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [enabled, loadPersisted]);

  // ── Room del negocio ────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !businessId) return;
    const join = () => socket.emit('join_business_room', { businessId });
    join();
    socket.on('connect', join);
    return () => {
      socket.off('connect', join);
      socket.emit('leave_business_room', { businessId });
    };
  }, [businessId]);

  // ── Room del usuario ───
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !userId) return;
    const join = () => socket.emit('join_user_room', { userId });
    join();
    socket.on('connect', join);
    return () => {
      socket.off('connect', join);
      socket.emit('leave_user_room', { userId });
    };
  }, [userId]);

  return {
    isConnected,
    alerts,
    liveStream,
    weeklySummary,
    unreadCount,
    loadPersisted,
    markRead,
    clearAlerts,
    deleteAlert,
    dismissWeeklySummary,
  };
}
