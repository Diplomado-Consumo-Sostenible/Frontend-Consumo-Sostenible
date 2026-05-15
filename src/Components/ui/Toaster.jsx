import { createPortal } from 'react-dom';
import { CheckCircle, Heart, X, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const STYLES = {
  success: {
    wrap:  'bg-card-bg border-primary-light/40',
    icon:  'text-primary-mid',
    Icon:  CheckCircle,
  },
  error: {
    wrap:  'bg-card-bg border-red-100',
    icon:  'text-red-500',
    Icon:  XCircle,
  },
  auth: {
    wrap:  'bg-card-bg border-terracotta/30',
    icon:  'text-terracotta',
    Icon:  Heart,
  },
};

function ToastItem({ toast, onDismiss }) {
  const style = STYLES[toast.type] ?? STYLES.success;
  const { Icon } = style;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 pl-4 pr-3 py-3.5 rounded-xl shadow-lg border w-80 transition-all duration-300 ease-in-out ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${style.wrap}`}
    >
      <span className={`mt-0.5 shrink-0 ${style.icon}`}>
        <Icon className="w-4 h-4" />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-body leading-snug">{toast.message}</p>

        {toast.actions?.length > 0 && (
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {toast.actions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                onClick={() => onDismiss(toast.id)}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-terracotta text-white hover:bg-terracotta/90 transition-colors"
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="mt-0.5 shrink-0 text-muted hover:text-body transition-colors"
      >
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
