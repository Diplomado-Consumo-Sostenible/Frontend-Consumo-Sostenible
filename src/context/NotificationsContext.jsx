import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getMyBusinesses } from '../services/business/busienss.service';
import { decodeToken } from '../utils/jwt.utils';
import { getToken } from '../utils/storage';
import useSentimentSocket from '../hooks/useSentimentSocket';
import { getMyNotifications } from '../services/notifications/notifications.service';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  // authTick se incrementa cada vez que el token cambia (login/logout).
  // Esto fuerza a useMemo a re-derivar la identidad del usuario sin recargar la página.
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    const handler = () => setAuthTick((t) => t + 1);
    window.addEventListener('app:auth-changed', handler);
    return () => window.removeEventListener('app:auth-changed', handler);
  }, []);

  const { isOwner, isAdmin, isUser, userId } = useMemo(() => {
    const token   = getToken();
    const decoded = decodeToken(token);
    const role    = decoded?.rol?.toLowerCase() ?? '';
    return {
      isOwner: role === 'owner',
      isAdmin: role === 'admin',
      isUser:  role === 'user',
      userId:  decoded?.sub ?? null,
    };
  }, [authTick]); // re-computa en cada cambio de sesión

  const shouldConnect = isOwner || isAdmin || isUser;

  const [businessId, setBusinessId] = useState(null);

  // Resetear businessId al cambiar de usuario para que el efecto inferior lo re-obtenga.
  useEffect(() => {
    setBusinessId(null);
  }, [authTick]);

  useEffect(() => {
    if (!isOwner) return;
    let cancelled = false;
    getMyBusinesses()
      .then((data) => {
        if (cancelled) return;
        const biz = Array.isArray(data) ? data[0] : null;
        if (biz?.id_business) setBusinessId(biz.id_business);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isOwner]);

  const socketData = useSentimentSocket({
    businessId: isOwner ? businessId : null,
    userId:     isUser  ? userId     : null,
    enabled:    shouldConnect,
  });


  const loadPersistedRef = useRef(socketData.loadPersisted);
  useEffect(() => { loadPersistedRef.current = socketData.loadPersisted; });


  useEffect(() => {
    if (!shouldConnect || isUser) return;
    let cancelled = false;
    getMyNotifications({ page: 1, limit: 30 })
      .then((list) => {
        if (!cancelled && list.length > 0) loadPersistedRef.current(list);
      })
      .catch((err) => console.warn('[Notifications] Error cargando historial:', err));
    return () => { cancelled = true; };
  }, [shouldConnect, isUser]);

  return (
    <NotificationsContext.Provider
      value={{ ...socketData, businessId, isOwner, isAdmin, isUser, userId }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}


export function useNotificationsContext() {
  return useContext(NotificationsContext);
}
