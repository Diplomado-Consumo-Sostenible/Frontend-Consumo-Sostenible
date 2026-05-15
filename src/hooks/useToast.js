import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success', options = {}) => {
    const { actions = [], duration = 5500 } = options;
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, visible: true, actions }]);

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    }, duration);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration + 300);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  return {
    toasts,
    dismiss,
    success: useCallback((msg) => add(msg, 'success'), [add]),
    error:   useCallback((msg) => add(msg, 'error'),   [add]),
    auth:    useCallback((msg) => add(
      msg ?? 'Inicia sesión para realizar esta acción',
      'auth',
      {
        duration: 6000,
        actions: [
          { label: 'Iniciar sesión', to: '/login'    },
          { label: 'Registrarme',    to: '/register' },
        ],
      },
    ), [add]),
  };
}
