import { Eye, EyeOff, Lock, LogIn, Mail, Store, User, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useToastContext } from "../../../context/ToastContext";
import Button from "../../button";
import InputField from "../../ui/InputField";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

const GOOGLE_ROLES = [
  { id: 2, label: 'Usuario', desc: 'Explora la plataforma',      icon: User  },
  { id: 3, label: 'Negocio', desc: 'Gestiona tu establecimiento', icon: Store },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GoogleRoleModal({ onClose, onSelect }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card-bg rounded-2xl shadow-warm w-full max-w-sm p-6 border border-edge">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GoogleIcon />
              <h3 className="text-sm font-semibold text-heading">¿Cómo quieres entrar?</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-app-bg transition-colors"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          </div>
          <p className="text-xs text-muted mb-4">
            Si ya tienes cuenta, selecciona el tipo con el que te registraste.
          </p>
          <div className="grid gap-3">
            {GOOGLE_ROLES.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-edge hover:border-primary-light hover:bg-primary-softest/30 transition-all text-left group bg-card-bg"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-softest group-hover:bg-primary-softest/70 flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-4 h-4 text-primary-dark" />
                </div>
                <div>
                  <p className="text-sm font-medium text-heading">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginForm({ onLogin }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading]                 = useState(false);
  const [showPass, setShowPass]               = useState(false);
  const [showGoogleRoles, setShowGoogleRoles] = useState(false);
  const toast = useToastContext();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await onLogin(data);
    } catch (error) {
      toast.error(error?.message || "Credenciales incorrectas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelect = (rolId) => {
    window.location.href = `${API_BASE}/auth/google?rolId=${rolId}`;
  };

  return (
    <div className="flex-1 bg-card-bg flex flex-col justify-center px-10 py-10">

      {/* Logo móvil */}
      <div className="flex md:hidden items-center gap-2 mb-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center gap-2.5">
            <img
                src="https://res.cloudinary.com/dhhlvuzqa/image/upload/v1777184416/ecovida_perfiles/dns8fzkguprwuca0ydgv.webp"
                alt="Consumo Sostenible"
                className="w-8 h-8 rounded-lg object-contain shrink-0"
              />
            <span className="text-heading text-sm font-semibold tracking-wide">
              EcoVida
            </span>
          </div>
        </Link>
      </div> 

      <div className="mb-7">
        <h1 className="text-heading text-4xl font-serif">
          Bienvenido de nuevo
        </h1>
        <p className="text-muted text-sm mt-1">Ingresa tu cuenta para continuar</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <InputField
          label="Correo electrónico"
          id="email"
          type="email"
          placeholder="tu@correo.com"
          icon={Mail}
          error={errors.email}
          registration={register("email", {
            required: "El correo es obligatorio",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Ingresa un correo válido" },
          })}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-body">Contraseña</label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary-dark hover:text-primary-darkest underline underline-offset-2 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <InputField
            id="password"
            type={showPass ? "text" : "password"}
            placeholder="Tu contraseña"
            icon={Lock}
            error={errors.password}
            registration={register("password", {
              required: "La contraseña es obligatoria",
              minLength: { value: 6, message: "Mínimo 6 caracteres" },
            })}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-muted hover:text-primary-dark transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <Button type="submit" loading={loading} icon={LogIn} className="mt-2 shadow-warm-sm hover:shadow-warm">
          Iniciar sesión
        </Button>

        {/* Separador */}
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-edge" />
          <span className="text-xs text-muted font-medium">o continúa con</span>
          <span className="flex-1 h-px bg-edge" />
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={() => setShowGoogleRoles(true)}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-edge bg-card-bg hover:bg-app-bg hover:border-primary-light text-sm font-medium text-body transition-all shadow-warm-sm hover:shadow-warm active:scale-[0.98]"
        >
          <GoogleIcon />
          Continuar con Google
        </button>

        <p className="text-center text-sm text-muted pt-1">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-primary-dark hover:text-primary-darkest font-medium underline underline-offset-2 transition-colors"
          >
            Regístrate gratis
          </Link>
        </p>
      </form>

      {showGoogleRoles && (
        <GoogleRoleModal
          onClose={() => setShowGoogleRoles(false)}
          onSelect={handleGoogleSelect}
        />
      )}
    </div>
  );
}
