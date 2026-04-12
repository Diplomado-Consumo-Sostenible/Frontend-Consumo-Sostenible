import { Globe, Recycle, Users } from "lucide-react";

export default function ForgotPasswordHero() {
  return (
    <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 p-10 relative overflow-hidden">

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/10" />
      <div className="absolute bottom-[-30px] left-[-30px] w-64 h-64 rounded-full bg-teal-400/20" />
      <div className="absolute top-1/2 right-[-20px] w-32 h-32 rounded-full bg-emerald-300/20" />

      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22C6.5 22 2 17.5 2 12C2 7 5.5 3.5 10 2C10 2 8 8 12 12C16 16 22 14 22 14C22 18.5 17.5 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-white/90 text-sm font-semibold tracking-widest uppercase">EcoVida</span>
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1 py-8 gap-8">
        <svg viewBox="0 0 260 260" className="w-60 h-60 drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="130" cy="225" rx="80" ry="12" fill="rgba(255,255,255,0.1)" />

          <rect x="70" y="130" width="120" height="95" rx="18" fill="rgba(255,255,255,0.22)" />
          <rect x="78" y="138" width="104" height="79" rx="14" fill="rgba(255,255,255,0.12)" />

          <path d="M90 130 V100 C90 72 170 72 170 100 V130"
            stroke="rgba(255,255,255,0.55)" strokeWidth="14" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />

          <circle cx="130" cy="175" r="16" fill="rgba(255,255,255,0.35)" />
          <rect x="125" y="175" width="10" height="18" rx="5" fill="rgba(255,255,255,0.5)" />

          <circle cx="68"  cy="80"  r="3"  fill="rgba(255,255,255,0.6)" />
          <circle cx="192" cy="68"  r="2.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="55"  cy="160" r="2"  fill="rgba(255,255,255,0.4)" />
          <circle cx="205" cy="155" r="3"  fill="rgba(255,255,255,0.5)" />
          <circle cx="130" cy="48"  r="2.5" fill="rgba(255,255,255,0.55)" />
          <circle cx="46"  cy="118" r="2"  fill="rgba(255,255,255,0.4)" />
          <circle cx="215" cy="112" r="2"  fill="rgba(255,255,255,0.4)" />

          <path d="M40 140 Q30 130 40 120" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M32 148 Q18 130 32 112" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M220 140 Q230 130 220 120" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M228 148 Q242 130 228 112" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>

        <div className="text-center space-y-3">
          <h2 className="text-white text-2xl font-bold leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Recupera tu acceso,<br />retoma tu camino.
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-xs">
            Te enviaremos un código seguro para que puedas restablecer tu contraseña en minutos.
          </p>
        </div>
      </div>

      <div className="relative flex justify-between text-center">
        {[
          { value: "12K+", label: "Usuarios",       icon: Users   },
          { value: "40%",  label: "Menos residuos", icon: Recycle },
          { value: <br />,   label: "Impacto real",   icon: Globe   },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <Icon className="w-5 h-5 text-emerald-200" />
              <span className="text-white font-bold text-lg">{s.value}</span>
              <span className="text-emerald-200 text-xs">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
