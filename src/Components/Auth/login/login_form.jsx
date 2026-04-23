import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Button from "../../button";
import AuthAlert from "../../ui/AuthAlert";
import InputField from "../../ui/InputField";

export default function LoginForm({ onLogin }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      await onLogin(data);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setApiError(error?.message || "Credenciales incorrectas. Verifica tu correo y contraseña.");
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

      <AuthAlert message={apiError} variant="error" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-5">

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
