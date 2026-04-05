
import { Globe, Recycle, Users } from "lucide-react";

export default function RegisterHero() {
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
            <svg viewBox="0 0 260 260" className="w-64 h-64 drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="130" cy="220" rx="90" ry="16" fill="rgba(255,255,255,0.12)" />
            <rect x="120" y="150" width="20" height="70" rx="8" fill="rgba(255,255,255,0.25)" />
            <ellipse cx="130" cy="145" rx="62" ry="52" fill="rgba(255,255,255,0.18)" />
            <ellipse cx="130" cy="125" rx="52" ry="46" fill="rgba(255,255,255,0.22)" />
            <ellipse cx="130" cy="105" rx="40" ry="38" fill="rgba(255,255,255,0.28)" />
            <ellipse cx="130" cy="88"  rx="28" ry="28" fill="rgba(255,255,255,0.32)" />
            <circle cx="82"  cy="130" r="14" fill="rgba(255,255,255,0.15)" />
            <circle cx="178" cy="128" r="16" fill="rgba(255,255,255,0.15)" />
            <circle cx="95"  cy="105" r="10" fill="rgba(255,255,255,0.12)" />
            <circle cx="165" cy="102" r="12" fill="rgba(255,255,255,0.12)" />
            <circle cx="60"  cy="80"  r="3" fill="rgba(255,255,255,0.6)" />
            <circle cx="200" cy="70"  r="2.5" fill="rgba(255,255,255,0.5)" />
            <circle cx="50"  cy="160" r="2" fill="rgba(255,255,255,0.4)" />
            <circle cx="205" cy="155" r="3" fill="rgba(255,255,255,0.5)" />
            <circle cx="130" cy="50"  r="2.5" fill="rgba(255,255,255,0.6)" />
            <ellipse cx="55"  cy="115" rx="9" ry="5" transform="rotate(-30 55 115)"  fill="rgba(255,255,255,0.2)" />
            <ellipse cx="210" cy="108" rx="9" ry="5" transform="rotate(25 210 108)"  fill="rgba(255,255,255,0.2)" />
            <ellipse cx="75"  cy="175" rx="7" ry="4" transform="rotate(15 75 175)"   fill="rgba(255,255,255,0.15)" />
            <ellipse cx="192" cy="172" rx="7" ry="4" transform="rotate(-20 192 172)" fill="rgba(255,255,255,0.15)" />
            <path d="M95 218 Q90 205 88 215"  stroke="rgba(255,255,255,0.3)"  strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M100 218 Q98 208 96 216" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M162 218 Q165 207 168 215" stroke="rgba(255,255,255,0.3)"  strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M157 218 Q158 208 162 216" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <g transform="translate(108,195) scale(0.45)">
                <path d="M24 4 L36 16 L28 16 C28 28 36 36 48 36 L48 44 C32 44 20 32 20 16 L12 16 Z" fill="rgba(255,255,255,0.35)" />
                <path d="M72 44 L60 32 L68 32 C68 20 60 12 48 12 L48 4 C64 4 76 16 76 32 L84 32 Z" fill="rgba(255,255,255,0.35)" />
                <path d="M48 68 L36 56 L44 56 C44 44 32 36 20 36 L20 44 C28 44 36 50 36 56 L28 56 Z" fill="rgba(255,255,255,0.25)" />
            </g>
            </svg>

            <div className="text-center space-y-3 relative">
            <h2 className="text-white text-2xl font-bold leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                Consume menos,<br />Vive mas.
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed max-w-xs">
                Encuentra lugares sostenibles y haz que cada compra cuente.
            </p>
            </div>
        </div>

        <div className="relative flex justify-between text-center">
        {[
            { value: "12K+", label: "Usuarios", icon: Users },
            { value: "40%", label: "Menos residuos", icon: Recycle },
            { value: <br/> , label: "Impacto real", icon: Globe },
        ].map((s) => {
            const Icon = s.icon;

            return (
                <div key={s.label} className="flex flex-col items-center gap-1">
                    <Icon className="w-5 h-5 text-emerald-200" />
                    {s.value && (
                    <span className="text-white font-bold text-lg">
                        {s.value}
                    </span>
                    )}
                    <span className="text-emerald-200 text-xs">
                    {s.label}
                    </span>
                </div>
            );
        })}
        </div>
    </div>
    );
}
