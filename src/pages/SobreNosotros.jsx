import {
  Award,
  BarChart3,
  ChevronDown,
  Cpu,
  Globe,
  HandHeart,
  HeartHandshake,
  Leaf,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LandingFooter from '../Components/landing/LandingFooter';
import LandingNavbar from '../Components/landing/LandingNavbar';

const PILLARS = [
  {
    Icon:  BarChart3,
    num:   'PILAR 01',
    title: 'Visibilidad Justa',
    desc:  'Damos herramientas avanzadas de analítica y automatización NLP a los negocios locales para que certifiquen y expongan sus esfuerzos eco-responsables.',
  },
  {
    Icon:  Award,
    num:   'PILAR 02',
    title: 'Incentivos Reales',
    desc:  'Transformamos el consumo sostenible en una experiencia interactiva y gamificada, donde cada acción verde suma puntos y desbloquea insignias.',
  },
  {
    Icon:  Sparkles,
    num:   'PILAR 03',
    title: 'Decisiones Inteligentes',
    desc:  'Usamos modelos predictivos y de recomendación personalizada para que cada usuario descubra el impacto real de sus decisiones, antes y después de comprar.',
  },
];

const IMPACT_CARDS = [
  {
    Icon:   Leaf,
    tag:    'Ambiental',
    title:  'Reducción de la huella de carbono',
    desc:   'Cuando eliges un comercio local o un producto sin plástico, nuestro modelo predictivo calcula las emisiones de CO₂ evitadas, disminuyendo el impacto de las entregas y la producción masiva.',
    stat:   { value: 'CO₂', label: 'evitado por cada compra consciente' },
    accent: false,
  },
  {
    Icon:   HandHeart,
    tag:    'Social y comunitario',
    title:  'Impulso al comercio justo y artesanal',
    desc:   'Al clasificar automáticamente con IA los productos éticos, fomentamos una remuneración justa para los productores locales y preservamos los métodos artesanales y de residuo cero.',
    stat:   { value: '0', label: 'residuo en la producción artesanal' },
    accent: true,
  },
  {
    Icon:   TrendingUp,
    tag:    'Económico',
    title:  'Fortalecimiento local',
    desc:   'Conectamos la oferta y la demanda consciente, inyectando capital en la economía de tu barrio. Ayudamos a los pequeños comercios a competir gracias al análisis inteligente de reseñas e interacción.',
    stat:   { value: '100%', label: 'del capital al comercio de barrio' },
    accent: false,
  },
];

function Eyebrow({ icon: Icon, children, dark = false }) {
  if (dark) {
    return (
      <span
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase"
        style={{ background: 'rgba(195,217,202,0.08)', color: '#C3D9CA', border: '0.5px solid rgba(195,217,202,0.16)' }}
      >
        <Icon className="w-3.5 h-3.5" />
        {children}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-softest border border-primary-light/40 text-[11px] font-bold tracking-widest uppercase text-primary-mid">
      <Icon className="w-3.5 h-3.5" />
      {children}
    </span>
  );
}

function EcoNode({ icon: Icon, title, sub, accent = false }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-edge bg-app-bg">
      <span
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          accent ? 'bg-terracotta/10 text-terracotta' : 'bg-primary-softest text-primary-mid'
        }`}
      >
        <Icon className="w-[19px] h-[19px]" />
      </span>
      <div>
        <p className="text-sm font-bold text-heading leading-snug">{title}</p>
        <p className="text-xs text-muted mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export default function SobreNosotros() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-app-bg">
      <LandingNavbar />

      <main>

        {/* ── Hero ── */}
        <section id="inicio" className="py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-14 items-center">

              <div>
                <Eyebrow icon={Users}>Sobre nosotros</Eyebrow>
                <h1 className="font-serif font-extrabold text-heading leading-[1.05] mt-5 mb-5" style={{ fontSize: 'clamp(2.4rem,5vw,3.25rem)' }}>
                  Cada decisión de compra{' '}
                  <em className="not-italic text-terracotta">cuenta</em>.
                </h1>
                <p className="text-lg leading-relaxed text-body max-w-xl mb-4">
                  Nacemos como una guía digital interactiva e inteligente diseñada para transformar el consumo cotidiano en un acto de cambio positivo.
                </p>
                <p className="text-sm leading-relaxed text-muted max-w-lg">
                  No somos solo un directorio: somos un ecosistema tecnológico que utiliza la Inteligencia Artificial para derribar la barrera de la desinformación ecológica, haciendo que encontrar opciones sostenibles, éticas y de comercio justo sea tan fácil como dar un solo clic.
                </p>
              </div>

              <aside
                className="rounded-2xl border border-edge bg-card-bg p-6"
                style={{ boxShadow: '0 10px 30px -14px rgba(31,61,43,0.22)' }}
              >
                <p className="text-[11px] font-bold tracking-widest uppercase text-muted mb-4">El ecosistema</p>
                <div className="flex flex-col gap-2">
                  <EcoNode icon={HeartHandshake} title="Ciudadanos conscientes" sub="Eligen con propósito" />
                  <div className="flex justify-center text-primary-mid py-0.5">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                  <EcoNode icon={Cpu} title="Inteligencia Artificial" sub="Clasifica, analiza y recomienda" accent />
                  <div className="flex justify-center text-primary-mid py-0.5">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                  <EcoNode icon={Store} title="Comercios locales" sub="Tiendas y restaurantes con el planeta" />
                </div>
              </aside>

            </div>
          </div>
        </section>

        {/* ── Misión ── */}
        <section id="mision" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-10">

            <div className="max-w-2xl mb-11">
              <Eyebrow icon={Target}>Nuestra misión</Eyebrow>
              <h2 className="font-serif font-extrabold text-heading leading-[1.08] mt-4 mb-3" style={{ fontSize: 'clamp(1.9rem,4vw,2.5rem)' }}>
                Impulsar la transición hacia una economía local, circular y responsable.
              </h2>
              <p className="text-base leading-relaxed text-body">
                Empoderamos a los consumidores a través de la transparencia y recompensamos sus hábitos sostenibles. Aceleramos este cambio mediante tres pilares tecnológicos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {PILLARS.map(({ Icon, num, title, desc }) => (
                <article
                  key={num}
                  className="bg-card-bg border border-edge rounded-2xl p-7 flex flex-col gap-3.5 transition-all duration-200 hover:-translate-y-1"
                  style={{ '--hover-shadow': '0 10px 30px -14px rgba(31,61,43,0.22)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 10px 30px -14px rgba(31,61,43,0.22)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
                >
                  <span className="w-12 h-12 rounded-2xl bg-primary-softest border border-primary-light/40 flex items-center justify-center text-primary-mid">
                    <Icon className="w-[22px] h-[22px]" />
                  </span>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-terracotta">{num}</span>
                  <h3 className="font-serif text-xl font-bold text-heading">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{desc}</p>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* ── Impacto — superficie oscura ── */}
        <section id="impacto" className="py-20 border-t border-edge" style={{ background: '#0F2118' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-10">

            <div className="max-w-2xl mb-11">
              <Eyebrow icon={Globe} dark>Impacto</Eyebrow>
              <p className="font-serif font-extrabold leading-[1.1] mt-4 mb-3" style={{ fontSize: 'clamp(1.9rem,4vw,2.5rem)', color: '#F2F6EF' }}>
                Lo que no se mide,{' '}
                <em className="not-italic" style={{ color: '#E7CEA0' }}>no se puede mejorar.</em>
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(195,217,202,0.62)' }}>
                El impacto de nuestra comunidad se traduce en datos reales, tangibles y de triple valor: ambiental, social y económico.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {IMPACT_CARDS.map(({ Icon, tag, title, desc, stat, accent }) => (
                <article
                  key={tag}
                  className="flex flex-col gap-3.5 rounded-2xl p-6"
                  style={{ background: '#16301F', border: '0.5px solid rgba(195,217,202,0.16)' }}
                >
                  <span
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={
                      accent
                        ? { background: 'rgba(199,110,74,0.16)', color: '#E2A082', border: '0.5px solid rgba(195,217,202,0.16)' }
                        : { background: 'rgba(195,217,202,0.08)', color: '#9FC9A8', border: '0.5px solid rgba(195,217,202,0.16)' }
                    }
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'rgba(195,217,202,0.62)' }}>
                    {tag}
                  </span>
                  <h3 className="font-serif text-lg font-bold" style={{ color: '#F2F6EF' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(195,217,202,0.62)' }}>{desc}</p>
                  <div
                    className="mt-1.5 pt-3.5 flex items-baseline gap-2"
                    style={{ borderTop: '0.5px solid rgba(195,217,202,0.16)' }}
                  >
                    <span className="font-serif text-3xl font-bold" style={{ color: '#F2F6EF', letterSpacing: '-0.02em' }}>
                      {stat.value}
                    </span>
                    <span className="text-[11px]" style={{ color: 'rgba(195,217,202,0.62)' }}>{stat.label}</span>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-10">
            <div
              className="bg-card-bg border border-edge rounded-2xl text-center px-8 sm:px-14 py-14"
              style={{ boxShadow: '0 10px 30px -14px rgba(31,61,43,0.22)' }}
            >
              <h2 className="font-serif font-extrabold text-heading leading-[1.08] mb-3" style={{ fontSize: 'clamp(1.9rem,4vw,2.5rem)' }}>
                Tu próxima compra puede ser{' '}
                <em className="not-italic text-terracotta">un acto de cambio</em>.
              </h2>
              <p className="text-base text-muted max-w-lg mx-auto mb-7 leading-relaxed">
                Únete a la comunidad que conecta a ciudadanos conscientes con la red de comercios locales comprometidos con el planeta.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary-dark text-on-dark-active text-sm font-semibold hover:bg-primary-darkest transition-colors"
                >
                  Explorar comercios
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-edge text-heading text-sm font-semibold hover:border-primary-mid hover:text-primary-dark transition-colors"
                >
                  Soy un negocio
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
