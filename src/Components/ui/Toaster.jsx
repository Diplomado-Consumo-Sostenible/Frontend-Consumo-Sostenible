import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, X } from 'lucide-react';

function ToastItem({ toast, onDismiss }) {
  const ok = toast.type === 'success';

  return (
    <div role="alert" className={`flex items-start gap-3 pl-4 pr-3 py-3.5 rounded-xl shadow-lg border w-80 transition-all duration-300 ease-in-out ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${ok ? 'bg-white border-emerald-100' : 'bg-white border-red-100'}`}>
      <span className={`mt-0.5 shrink-0 ${ok ? 'text-emerald-500' : 'text-red-500'}`}>{ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}</span>
      <p className="text-sm text-stone-700 flex-1 leading-snug">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="mt-0.5 shrink-0 text-stone-300 hover:text-stone-500 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function Toaster({ toasts, onDismiss }) {
  return createPortal(
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
