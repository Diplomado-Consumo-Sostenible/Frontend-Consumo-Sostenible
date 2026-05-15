import { Heart, LogIn, UserPlus, X } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AuthRequiredModal({ onClose }) {
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-card-bg rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-body hover:bg-edge/60 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-2 pt-10 pb-6 px-6 bg-gradient-to-b from-primary-softest to-transparent">
          <div className="w-14 h-14 rounded-2xl bg-card-bg shadow flex items-center justify-center">
            <Heart className="w-7 h-7 text-terracotta fill-terracotta/20" />
          </div>
          <h2 className="text-base font-semibold text-heading text-center mt-1">
            Inicia sesión para guardar favoritos
          </h2>
          <p className="text-xs text-muted text-center leading-relaxed">
            Crea una cuenta o inicia sesión para seguir negocios, guardar favoritos y recibir actualizaciones.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 px-6 pb-8">
          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary-dark text-on-dark-active text-sm font-semibold hover:bg-primary-darkest transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-edge text-body text-sm font-semibold hover:border-primary-mid hover:text-primary-dark transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Crear cuenta gratis
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-body transition-colors text-center mt-1"
          >
            Continuar sin iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
