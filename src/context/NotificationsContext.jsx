import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getMyBusinesses } from '../services/business/busienss.service';
import { decodeToken } from '../utils/jwt.utils';
import { getToken } from '../utils/storage';
import useSentimentSocket from '../hooks/useSentimentSocket';
import { getMyNotifications } from '../services/notifications/notifications.service';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { isOwner, isAdmin } = useMemo(() => {
    const token   = getToken();
    const decoded = decodeToken(token);
    const role    = decoded?.rol?.toLowerCase() ?? '';
    return { isOwner: role === 'owner', isAdmin: role === 'admin' };
  }, []);

  const shouldConnect = isOwner || isAdmin;

  const [businessId, setBusinessId] = useState(null);

  // Obtener el id del negocio activo solo si es owner
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
    enabled: shouldConnect,
  });

  // Ref estable hacia loadPersisted para evitar closures viejos
  const loadPersistedRef = useRef(socketData.loadPersisted);
  useEffect(() => { loadPersistedRef.current = socketData.loadPersisted; });

  // Cargar historial persistido al montar (solo si tiene rol con acceso)
  useEffect(() => {
    if (!shouldConnect) return;
    let cancelled = false;
    getMyNotifications({ page: 1, limit: 30 })
      .then((list) => {
        if (!cancelled && list.length > 0) loadPersistedRef.current(list);
      })
      .catch((err) => console.warn('[Notifications] Error cargando historial:', err));
    return () => { cancelled = true; };
  }, [shouldConnect]);

  return (
    <NotificationsContext.Provider
      value={{ ...socketData, businessId, isOwner, isAdmin }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  return useContext(NotificationsContext);
}
