import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye, EyeOff,
  KeyRound, Lock,
  Mail,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  requestPasswordReset,
  resendPasswordReset,
  resetPassword,
} from "../../../services/auth/auth.service";
import { useToastContext } from "../../../context/ToastContext";
import Button from "../../button";
import InputField from "../../ui/InputField";

function StepEmail({ onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const toast = useToastContext();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      toast.success(res?.message || "Código enviado. Revisa tu correo.");
      onSuccess(email);
    } catch (err) {
      toast.error(err?.message || "No encontramos una cuenta con ese correo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-7">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-stone-400 text-sm mt-2 leading-relaxed">
          Ingresa tu correo y te enviaremos un código de 6 dígitos para recuperar tu cuenta.
        </p>
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
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Ingresa un correo válido",
            },
          })}
        />

        <Button type="submit" loading={loading} icon={ArrowRight}
          className="mt-2 shadow-md shadow-emerald-200">
          Enviar código
        </Button>

        <p className="text-center text-sm text-stone-400">
          <Link to="/login"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </>
  );
}

function StepOtp({ email, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const toast = useToastContext();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const onSubmit = async ({ otp }) => {
    setLoading(true);
    try {
      onSuccess(otp);
    } catch (err) {
      toast.error(err?.message || "Código incorrecto o expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await resendPasswordReset(email);
      toast.success(res?.message || "Código reenviado. Revisa tu bandeja de entrada.");
      setCountdown(60);
    } catch (err) {
      toast.error(err?.message || "No se pudo reenviar el código.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="mb-7">
        <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-teal-600" />
        </div>
        <h1 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
          Ingresa el código
        </h1>
        <p className="text-stone-400 text-sm mt-2 leading-relaxed">
          Enviamos un código de 6 dígitos a{" "}
          <span className="font-medium text-stone-600">{email}</span>.
          Válido por <span className="font-medium text-emerald-600">10 minutos</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          label="Código de verificación"
          id="otp"
          type="text"
          placeholder="123456"
          icon={KeyRound}
          error={errors.otp}
          registration={register("otp", {
            required: "El código es obligatorio",
            pattern: { value: /^\d{6}$/, message: "Debe ser un código de 6 dígitos" },
          })}
        />

        <Button type="submit" loading={loading} icon={ArrowRight}
          className="shadow-md shadow-emerald-200">
          Verificar código
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-stone-400">
        <span>¿No recibiste el código?</span>
        {countdown > 0 ? (
          <span className="text-stone-400 font-medium">
            Reenviar en <span className="text-emerald-600">{countdown}s</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {resending ? "Reenviando..." : "Reenviar código"}
          </button>
        )}
      </div>
    </>
  );
}

function StepNewPassword({ otp, onSuccess }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const toast = useToastContext();

  const passwordValue = watch("newPassword", "");

  const getStrength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(passwordValue);
  const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-emerald-500"][strength];
  const strengthText = ["", "text-red-500", "text-amber-500", "text-lime-600", "text-emerald-600"][strength];

  const onSubmit = async ({ newPassword }) => {
    setLoading(true);
    try {
      const res = await resetPassword(otp, newPassword);
      toast.success(res?.message || "Contraseña restablecida correctamente.");
      onSuccess();
    } catch (err) {
      toast.error(err?.message || "El código OTP es inválido o ya expiró.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-7">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
          Nueva contraseña
        </h1>
        <p className="text-stone-400 text-sm mt-2 leading-relaxed">
          Elige una contraseña segura. Recuerda incluir mayúsculas y números.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <InputField
            label="Nueva contraseña"
            id="newPassword"
            type={showPass ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            icon={Lock}
            error={errors.newPassword}
            registration={register("newPassword", {
              required: "La contraseña es obligatoria",
              minLength: { value: 8, message: "Mínimo 8 caracteres" },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[0-9])/,
                message: "Debe incluir al menos una mayúscula y un número",
              },
            })}
            rightSlot={
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="text-stone-400 hover:text-emerald-600 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {passwordValue && (
            <div className="flex items-center gap-2 px-1">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-stone-200"}`}
                  />
                ))}
              </div>
              <span className={`text-xs font-medium ${strengthText}`}>{strengthLabel}</span>
            </div>
          )}
        </div>

        <InputField
          label="Confirmar contraseña"
          id="confirm"
          type={showConf ? "text" : "password"}
          placeholder="Repite tu contraseña"
          icon={Lock}
          error={errors.confirm}
          registration={register("confirm", {
            required: "Confirma tu contraseña",
            validate: (v) => v === passwordValue || "Las contraseñas no coinciden",
          })}
          rightSlot={
            <button type="button" onClick={() => setShowConf(!showConf)}
              className="text-stone-400 hover:text-emerald-600 transition-colors">
              {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <Button type="submit" loading={loading} icon={ArrowRight}
          className="shadow-md shadow-emerald-200">
          Guardar contraseña
        </Button>
      </form>
    </>
  );
}

function StepSuccess() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-5 py-6">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <div>
        <h1 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
          ¡Contraseña actualizada!
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.
        </p>
      </div>
      <Link to="/login">
        <Button icon={ArrowRight} className="w-auto px-8 shadow-md shadow-emerald-200">
          Ir al inicio de sesión
        </Button>
      </Link>
    </div>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? "bg-emerald-500 w-8" : i === current ? "bg-emerald-400 w-8" : "bg-stone-200 w-5"
          }`} />
        </div>
      ))}
      <span className="text-xs text-stone-400 ml-1">
        {current < total ? `Paso ${current + 1} de ${total}` : "Completado"}
      </span>
    </div>
  );
}

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="flex-1 bg-white/80 backdrop-blur-xl flex flex-col justify-center px-10 py-10">

      <div className="flex md:hidden items-center gap-2 mb-4">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-emerald-500" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22C6.5 22 2 17.5 2 12C2 7 5.5 3.5 10 2C10 2 8 8 12 12C16 16 22 14 22 14C22 18.5 17.5 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-emerald-600 font-semibold text-sm tracking-widest uppercase">EcoVida</span>
      </div>

      {step < 3 && <StepIndicator current={step} total={3} />}

      {step === 0 && <StepEmail onSuccess={(e) => { setEmail(e); setStep(1); }} />}
      {step === 1 && <StepOtp email={email} onSuccess={(o) => { setOtp(o); setStep(2); }} />}
      {step === 2 && <StepNewPassword otp={otp} onSuccess={() => setStep(3)} />}
      {step === 3 && <StepSuccess />}
    </div>
  );
}
