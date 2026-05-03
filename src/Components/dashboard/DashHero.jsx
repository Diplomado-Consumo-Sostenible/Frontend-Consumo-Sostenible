import { ArrowRight, ChevronRight, Eye, Leaf, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import useVisitedBusinesses from '../../hooks/useVisitedBusinesses';

function LandscapeSVG() {
  return (
    <svg
      viewBox="0 0 520 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <defs>
        <radialGradient id="dh-sun" cx="72%" cy="30%" r="38%">
          <stop offset="0%" stopColor="rgba(255,230,80,0.40)" />
          <stop offset="60%" stopColor="rgba(255,210,60,0.15)" />
          <stop offset="100%" stopColor="rgba(255,210,60,0)" />
        </radialGradient>
        <radialGradient id="dh-glow" cx="72%" cy="30%" r="18%">
          <stop offset="0%" stopColor="rgba(255,245,150,0.55)" />
          <stop offset="100%" stopColor="rgba(255,245,150,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="374" cy="65" rx="120" ry="95" fill="url(#dh-sun)" />
      <ellipse cx="374" cy="65" rx="55"  ry="45" fill="url(#dh-glow)" />
      <path d="M0 145 Q55 105 115 125 Q175 95 240 115 Q300 90 365 108 Q425 88 520 100 L520 230 L0 230 Z" fill="rgba(18,62,30,0.42)" />
      <path d="M0 165 Q70 135 130 150 Q195 128 255 145 Q315 125 375 140 Q440 120 520 132 L520 230 L0 230 Z" fill="rgba(14,52,24,0.55)" />
      <path d="M0 185 Q80 165 155 175 Q225 158 290 170 Q360 155 430 165 L520 160 L520 230 L0 230 Z" fill="rgba(10,42,18,0.70)" />
      <g transform="translate(290,88)">
        <line x1="0" y1="38" x2="0" y2="-2" stroke="rgba(200,230,210,0.6)" strokeWidth="1.5"/>
        <line x1="0" y1="0" x2="10" y2="6"  stroke="rgba(200,230,210,0.6)" strokeWidth="1.5"/>
        <line x1="0" y1="0" x2="-2" y2="11" stroke="rgba(200,230,210,0.6)" strokeWidth="1.5"/>
        <line x1="0" y1="0" x2="-8" y2="-5" stroke="rgba(200,230,210,0.6)" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="2" fill="rgba(220,240,225,0.7)"/>
      </g>
      <g transform="translate(340,102)">
        <line x1="0" y1="28" x2="0" y2="-2" stroke="rgba(200,230,210,0.5)" strokeWidth="1.2"/>
        <line x1="0" y1="0" x2="8"  y2="5"  stroke="rgba(200,230,210,0.5)" strokeWidth="1.2"/>
        <line x1="0" y1="0" x2="-2" y2="9"  stroke="rgba(200,230,210,0.5)" strokeWidth="1.2"/>
        <line x1="0" y1="0" x2="-6" y2="-4" stroke="rgba(200,230,210,0.5)" strokeWidth="1.2"/>
        <circle cx="0" cy="0" r="1.5" fill="rgba(220,240,225,0.6)"/>
      </g>
      <polygon points="410,145 404,165 416,165" fill="rgba(30,90,50,0.75)" />
      <polygon points="410,138 402,155 418,155" fill="rgba(35,100,55,0.65)" />
      <polygon points="435,140 428,162 442,162" fill="rgba(25,82,44,0.70)" />
      <polygon points="435,132 426,150 444,150" fill="rgba(32,95,52,0.60)" />
      <polygon points="455,148 450,163 460,163" fill="rgba(22,75,40,0.75)" />
      <polygon points="468,142 462,158 474,158" fill="rgba(28,88,48,0.70)" />
      <polygon points="468,135 460,152 476,152" fill="rgba(34,98,54,0.60)" />
      <path d="M490 155 Q500 140 510 150 Q515 135 520 148 L520 175 L490 175 Z" fill="rgba(20,70,35,0.55)" />
    </svg>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashHero({ profile, onViewList }) {
  const firstName = (profile?._profile?.nombre ?? profile?.nombre ?? '').split(' ')[0] || 'Explorer';
  const { visited } = useVisitedBusinesses();

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ background: 'linear-gradient(135deg, #1e4d36 0%, #3a8c5c 55%, #52b07a 100%)', minHeight: '210px' }}
    >
      <div className="absolute inset-0 pointer-events-none select-none">
        <LandscapeSVG />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(20,55,36,0.97) 35%, rgba(20,55,36,0.60) 65%, rgba(20,55,36,0.08) 100%)' }}
      />

      <div className="relative z-10 p-5 sm:p-6 lg:p-8 flex items-start gap-4">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5 text-green-300" />
            <span className="text-xs font-medium text-green-300 tracking-wide uppercase">
              Tu impacto positivo
            </span>
          </div>
          <div>
            <p className="text-sm text-green-200/75 leading-none mb-1">{getGreeting()},</p>
            <h2 className="flex items-center gap-2.5 text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {firstName}
              <Sprout className="w-7 h-7 text-green-300 shrink-0" />
            </h2>
          </div>
          <p className="text-lg sm:text-xl font-bold text-green-200 leading-snug">
            ¡Gracias por hacer la diferencia!
          </p>
          <Link
            to="/dashboard/explorar"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all w-fit mt-1"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(6px)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            Explorar negocios cerca
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="shrink-0 hidden sm:flex flex-col gap-3 rounded-2xl p-4 min-w-[150px]"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Eye className="w-3.5 h-3.5 text-green-200" />
            </div>
            <p className="text-[10px] font-semibold text-green-200/80 uppercase tracking-wide leading-tight">
              Negocios<br />visitados
            </p>
          </div>
          <p className="text-4xl font-extrabold text-white leading-none tabular-nums">
            {visited.length}
          </p>
          <button
            type="button"
            onClick={onViewList}
            disabled={visited.length === 0}
            className="flex items-center gap-1 text-xs font-semibold text-green-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-auto"
          >
            Ver lista
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
