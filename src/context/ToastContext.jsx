import { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import { Toaster } from '../Components/ui/Toaster';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useToast();
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toaster toasts={toast.toasts} onDismiss={toast.dismiss} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}
