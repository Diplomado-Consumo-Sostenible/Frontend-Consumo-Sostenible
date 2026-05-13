import { Globe, Leaf, Recycle, Users } from "lucide-react";

export default function ForgotPasswordHero() {
  return (
    <div className="hidden md:flex flex-col justify-between w-1/2 bg-primary-dark p-10 relative overflow-hidden">

      {/* Cuadrícula decorativa sutil */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Logo */}
      <div className="relative flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary-mid rounded-xl flex items-center justify-center">
          <Leaf className="w-4 h-4 text-on-dark-active" />
        </div>
        <span className="text-on-dark-active text-sm font-semibold tracking-wide">
          EcoVida
        </span>
      </div>

      {/* Ilustración + texto central */}
      <div className="relative flex flex-col items-center justify-center flex-1 py-8 gap-8">
        <svg viewBox="0 0 260 260" className="w-60 h-60" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="130" cy="225" rx="80" ry="12" fill="rgba(255,255,255,0.07)" />

          <rect x="70" y="130" width="120" height="95" rx="18" fill="rgba(255,255,255,0.14)" />
          <rect x="78" y="138" width="104" height="79" rx="14" fill="rgba(255,255,255,0.08)" />

          <path d="M90 130 V100 C90 72 170 72 170 100 V130"
            stroke="rgba(255,255,255,0.42)" strokeWidth="14" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />

          <circle cx="130" cy="175" r="16" fill="rgba(255,255,255,0.24)" />
          <rect x="125" y="175" width="10" height="18" rx="5" fill="rgba(255,255,255,0.40)" />

          <circle cx="68"  cy="80"  r="3"   fill="rgba(255,255,255,0.45)" />
          <circle cx="192" cy="68"  r="2.5" fill="rgba(255,255,255,0.38)" />
          <circle cx="55"  cy="160" r="2"   fill="rgba(255,255,255,0.30)" />
          <circle cx="205" cy="155" r="3"   fill="rgba(255,255,255,0.38)" />
          <circle cx="130" cy="48"  r="2.5" fill="rgba(255,255,255,0.45)" />
        </svg>

        <div className="text-center space-y-3 relative">
          <h2 className="font-serif text-on-dark-active text-2xl leading-tight">
            Recupera tu acceso,<br />retoma tu camino.
          </h2>
          <p className="text-on-dark text-sm leading-relaxed max-w-xs">
            Te enviaremos un código seguro para que puedas restablecer tu contraseña en minutos.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="relative flex justify-between text-center">
        {[
          { value: "12K+", label: "Usuarios",       icon: Users   },
          { value: "40%",  label: "Menos residuos", icon: Recycle },
          { value: "100%", label: "Impacto real",   icon: Globe   },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <Icon className="w-4 h-4 text-on-dark" />
              <span className="text-on-dark-active font-semibold text-base font-serif">{s.value}</span>
              <span className="text-on-dark text-xs">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
