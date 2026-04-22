import { MapPin, ShieldCheck, TrendingUp } from "lucide-react";

export default function BusinessHero() {
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

                    <ellipse cx="130" cy="228" rx="85" ry="12" fill="rgba(255,255,255,0.10)" />
                    <rect x="40" y="200" width="180" height="28" rx="6" fill="rgba(255,255,255,0.15)" />
                    <rect x="60" y="110" width="140" height="92" rx="8" fill="rgba(255,255,255,0.20)" />
                    <path d="M48 112 Q130 88 212 112 L212 125 Q130 102 48 125 Z" fill="rgba(255,255,255,0.32)" />
                    <path d="M48 118 Q130 95 212 118" stroke="rgba(255,255,255,0.50)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <rect x="108" y="158" width="44" height="44" rx="5" fill="rgba(255,255,255,0.28)" />
                    <circle cx="146" cy="181" r="3" fill="rgba(255,255,255,0.60)" />

                    <rect x="72" y="128" width="36" height="28" rx="4" fill="rgba(255,255,255,0.22)" />
                    <line x1="90" y1="128" x2="90" y2="156" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" />
                    <line x1="72" y1="142" x2="108" y2="142" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" />

                    <rect x="152" y="128" width="36" height="28" rx="4" fill="rgba(255,255,255,0.22)" />
                    <line x1="170" y1="128" x2="170" y2="156" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" />
                    <line x1="152" y1="142" x2="188" y2="142" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" />

                    <rect x="82" y="93" width="96" height="20" rx="5" fill="rgba(255,255,255,0.28)" />
                    <rect x="90" y="98" width="30" height="4" rx="2" fill="rgba(255,255,255,0.55)" />
                    <rect x="126" y="98" width="44" height="4" rx="2" fill="rgba(255,255,255,0.35)" />
                    <rect x="90" y="105" width="55" height="3" rx="1.5" fill="rgba(255,255,255,0.25)" />

                    <g transform="translate(163, 88) scale(0.38)">
                        <path d="M24 4 L36 16 L28 16 C28 28 36 36 48 36 L48 44 C32 44 20 32 20 16 L12 16 Z" fill="rgba(255,255,255,0.55)" />
                        <path d="M72 44 L60 32 L68 32 C68 20 60 12 48 12 L48 4 C64 4 76 16 76 32 L84 32 Z" fill="rgba(255,255,255,0.45)" />
                    </g>

                    <ellipse cx="97"  cy="202" rx="10" ry="5" fill="rgba(255,255,255,0.20)" />
                    <rect   x="91"   y="197" width="12" height="6" rx="2" fill="rgba(255,255,255,0.22)" />
                    <path d="M97 197 Q93 188 97 182 Q101 188 97 197" fill="rgba(255,255,255,0.38)" />
                    <path d="M97 190 Q91 186 89 180" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    <ellipse cx="163" cy="202" rx="10" ry="5" fill="rgba(255,255,255,0.20)" />
                    <rect   x="157" y="197" width="12" height="6" rx="2" fill="rgba(255,255,255,0.22)" />
                    <path d="M163 197 Q159 188 163 182 Q167 188 163 197" fill="rgba(255,255,255,0.38)" />
                    <path d="M163 190 Q169 186 171 180" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    <circle cx="55"  cy="75"  r="2.5" fill="rgba(255,255,255,0.55)" />
                    <circle cx="205" cy="68"  r="2"   fill="rgba(255,255,255,0.45)" />
                    <circle cx="45"  cy="155" r="2"   fill="rgba(255,255,255,0.35)" />
                    <circle cx="215" cy="150" r="2.5" fill="rgba(255,255,255,0.45)" />
                    <circle cx="130" cy="48"  r="2"   fill="rgba(255,255,255,0.55)" />
                    <circle cx="80"  cy="55"  r="1.5" fill="rgba(255,255,255,0.40)" />
                    <circle cx="185" cy="52"  r="1.5" fill="rgba(255,255,255,0.40)" />

                </svg>

                <div className="text-center space-y-3 relative">
                    <h2 className="text-white text-2xl font-bold leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                        Tu negocio,<br />parte del cambio.
                    </h2>
                    <p className="text-emerald-100 text-sm leading-relaxed max-w-xs">
                        Conecta con miles de consumidores que eligen vivir de forma consciente y sostenible.
                    </p>
                </div>
            </div>

            <div className="relative flex justify-between text-center">
                {[
                    { value: "800+", label: "Negocios activos", icon: MapPin },
                    { value: "98%", label: "Satisfacción", icon: ShieldCheck },
                    { value: "3x", label: "Más visibilidad", icon: TrendingUp },
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