import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail, ShieldOff, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useToastContext } from "../../../context/ToastContext";
import Button from "../../button";
import InputField from "../../ui/InputField";

/* ── Login rate-limit helpers ─────────────────────────────── */
const STORAGE_KEY   = 'login_security';
const MAX_ATTEMPTS  = 5;
const LOCKOUT_MS    = 30_000; // 30 s base lockout

function readSecurity() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? { attempts: 0, lockedUntil: 0 }; }
  catch { return { attempts: 0, lockedUntil: 0 }; }
}
function writeSecurity(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function clearSecurity() {
  localStorage.removeItem(STORAGE_KEY);
}

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

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


export default function LoginForm({ onLogin }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading,    setLoading]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const toast = useToastContext();

  /* ── Rate-limit state (seeded from localStorage) ─────────── */
  const [attempts,    setAttempts]    = useState(() => readSecurity().attempts);
  const [lockedUntil, setLockedUntil] = useState(() => readSecurity().lockedUntil);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const until = readSecurity().lockedUntil;
    return until > Date.now() ? Math.ceil((until - Date.now()) / 1000) : 0;
  });

  const isLocked = secondsLeft > 0;

  /* countdown ticker */
  useEffect(() => {
    if (!lockedUntil || lockedUntil <= Date.now()) return;
    const tick = () => {
      const left = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (left <= 0) {
        setSecondsLeft(0);
        setLockedUntil(0);
        setAttempts(0);
        clearSecurity();
      } else {
        setSecondsLeft(left);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const onSubmit = async (data) => {
    if (isLocked) return;
    setLoading(true);
    try {
      await onLogin(data);
      clearSecurity();
    } catch (error) {
      const newCount = attempts + 1;
      if (newCount >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setSecondsLeft(Math.ceil(LOCKOUT_MS / 1000));
        setAttempts(newCount);
        writeSecurity({ attempts: newCount, lockedUntil: until });
        toast.error("Demasiados intentos fallidos. Espera 30 segundos antes de volver a intentarlo.");
      } else {
        setAttempts(newCount);
        writeSecurity({ attempts: newCount, lockedUntil: 0 });
        toast.error(error?.message || "Credenciales incorrectas. Verifica tu correo y contraseña.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_BASE}/auth/google`;
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

        {/* Intentos restantes */}
        {!isLocked && attempts > 0 && attempts < MAX_ATTEMPTS && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs font-medium">
              {MAX_ATTEMPTS - attempts} intento{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} restante{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} antes de bloquear el acceso.
            </p>
          </div>
        )}

        {/* Bloqueo activo */}
        {isLocked && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <ShieldOff className="w-5 h-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Acceso bloqueado temporalmente</p>
              <p className="text-xs mt-0.5 flex items-center gap-1">
                <Timer className="w-3 h-3" />
                Puedes volver a intentarlo en{' '}
                <span className="font-bold tabular-nums">{secondsLeft}s</span>
              </p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={isLocked}
          icon={LogIn}
          className="mt-2 shadow-warm-sm hover:shadow-warm disabled:opacity-60 disabled:cursor-not-allowed"
        >
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
          onClick={handleGoogle}
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

    </div>
  );
}
