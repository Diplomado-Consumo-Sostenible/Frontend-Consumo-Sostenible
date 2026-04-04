import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { decodeToken, loginModel, saveToken } from "../../models/auth.model";
import { login } from "../../services/auth/auth.service";
import Button from "../button";

const inputClass = (error) =>
  `w-full pl-10 pr-4 py-3 rounded-xl border text-stone-700 placeholder-stone-300 text-sm
   focus:outline-none focus:ring-2 transition-all shadow-sm bg-white
   ${
     error
       ? "border-red-300 focus:ring-red-200 focus:border-red-400"
       : "border-stone-200 focus:ring-emerald-300 focus:border-emerald-400 hover:border-stone-300"
   }`;

const redirectByRole = (rol) => {
  switch (rol?.toLowerCase()) {
    case "admin":
      window.location.href = "/admin/dashboard";
      break;
    case "usuario":
    default:
      window.location.href = "/dashboard";
      break;
  }
};

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState(null);
  const [showPass, setShowPass]   = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);

    try {
      const credentials  = loginModel(data);
      const response     = await login(credentials);      
      const token        = response.access_token;

      saveToken(token);                                    

      const payload = decodeToken(token);                 
      console.log("Login exitoso ✅ — rol:", payload?.rol);

      redirectByRole(payload?.rol);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setApiError(
        error?.message || "Credenciales incorrectas. Verifica tu correo y contraseña."
      );
    } finally {
      setLoading(false);
    }
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

      {apiError && (
        <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-600">Correo electrónico</label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              className={inputClass(errors.email)}
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Ingresa un correo válido",
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
              <AlertCircle className="w-5 h-5" />{errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-600">Contraseña</label>
            <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              className={`${inputClass(errors.password)} pr-11`}
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: { value: 6, message: "Mínimo 6 caracteres" },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-emerald-600 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
              <span>⚠</span> {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" loading={loading} icon={LogIn} className="mt-2 shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200">
          Iniciar sesión
        </Button>

        <p className="text-center text-sm text-stone-400 pt-1">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">
          Regístrate gratis
          </Link>
        </p>
      </form>
    </div>
  );
}
