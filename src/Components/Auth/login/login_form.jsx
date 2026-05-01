import { Eye, EyeOff, Lock, LogIn, Mail, Store, User, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useToastContext } from "../../../context/ToastContext";
import Button from "../../button";
import InputField from "../../ui/InputField";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

// rolId=2 → Usuario, rolId=3 → Negocio/Owner (coincide con rolStep.jsx)
const GOOGLE_ROLES = [
  { id: 2, label: 'Usuario', desc: 'Explora la plataforma',        icon: User  },
  { id: 3, label: 'Negocio', desc: 'Gestiona tu establecimiento',   icon: Store },
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GoogleIcon />
              <h3 className="text-sm font-semibold text-stone-800">¿Cómo quieres entrar?</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 transition-colors">
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>
          <p className="text-xs text-stone-400 mb-4">
            Si ya tienes cuenta, selecciona el tipo con el que te registraste.
          </p>
          <div className="grid gap-3">
            {GOOGLE_ROLES.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">{label}</p>
                  <p className="text-xs text-stone-400">{desc}</p>
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
  const [loading, setLoading]             = useState(false);
  const [showPass, setShowPass]           = useState(false);
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

  // Redirige al backend con el rolId seleccionado
  const handleGoogleSelect = (rolId) => {
    window.location.href = `${API_BASE}/auth/google?rolId=${rolId}`;
  };

  return (
    <div className="flex-1 bg-white/80 backdrop-blur-xl flex flex-col justify-center px-10 py-10">

      <div className="flex md:hidden items-center gap-2 mb-4">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-emerald-500" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22C6.5 22 2 17.5 2 12C2 7 5.5 3.5 10 2C10 2 8 8 12 12C16 16 22 14 22 14C22 18.5 17.5 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-emerald-600 font-semibold text-sm tracking-widest uppercase">EcoVida</span>
      </div>

      <div className="mb-7">
        <h1 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
          Bienvenido de nuevo
        </h1>
        <p className="text-stone-400 text-sm mt-1">Ingresa tu cuenta para continuar</p>
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
            <label htmlFor="password" className="text-sm font-medium text-stone-600">Contraseña</label>
            <Link to="/forgot-password"
              className="text-xs text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
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
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="text-stone-400 hover:text-emerald-600 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <div className="flex items-center gap-2 px-6 py-2">
          <Button type="submit" loading={loading} icon={LogIn}
            className="mt-2 shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200">
            Iniciar sesión
          </Button>
        </div>

        {/* Separador */}
        <div className="flex items-center gap-3 px-6">
          <span className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400 font-medium">o continúa con</span>
          <span className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Botón Google → abre modal de selección de rol */}
        <div className="px-6">
          <button
            type="button"
            onClick={() => setShowGoogleRoles(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-sm font-medium text-stone-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <GoogleIcon />
            Continuar con Google
          </button>
        </div>

        <p className="text-center text-sm text-stone-400 pt-1">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">
            Regístrate gratis
          </Link>
        </p>
      </form>

      {/* Modal de selección de rol para Google OAuth */}
      {showGoogleRoles && (
        <GoogleRoleModal
          onClose={() => setShowGoogleRoles(false)}
          onSelect={handleGoogleSelect}
        />
      )}
    </div>
  );
}
