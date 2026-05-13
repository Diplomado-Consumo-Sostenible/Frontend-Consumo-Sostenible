import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection({ totalBusinesses = 0 }) {
  const count = totalBusinesses > 0 ? `+${totalBusinesses}` : '+500';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-6">
          {/* Chip — estilo editorial, sin saturación */}
          <span className="inline-flex self-start items-center px-3 py-1 rounded-full border border-edge text-muted text-xs font-medium tracking-wide">
            Directorio verificado
          </span>

          {/* Título — Instrument Serif con énfasis italic + highlight */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-heading leading-tight">
            Conecta tu negocio con un{' '}
            <em className="text-primary-dark not-italic">
              futuro{' '}
              <span className="italic highlight-warm">sostenible</span>
            </em>
          </h1>

          {/* Subtítulo */}
          <p className="text-base text-body leading-relaxed max-w-md">
            Descubre y apoya comercios que cuidan el planeta. Certificados, transparentes
            y comprometidos con un impacto real en tu comunidad.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary-dark text-on-dark-active font-semibold text-sm hover:bg-primary-darkest transition-colors"
            >
              Regístrate ahora
            </Link>
            <Link
              to="/dashboard/explorar"
              className="inline-flex items-center px-5 py-2.5 rounded-xl border border-edge text-body font-semibold text-sm hover:border-primary-mid transition-colors"
            >
              Explorar sin cuenta
            </Link>
          </div>

          {/* Prueba social */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['A', 'B', 'C'].map((initial) => (
                <div
                  key={initial}
                  className="w-8 h-8 rounded-full bg-primary-softest border-2 border-card-bg flex items-center justify-center text-xs font-bold text-primary-dark"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted">
              <span className="font-semibold text-body">{count} negocios</span>{' '}
              ya forman parte.
            </p>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="relative flex items-center justify-center">
          <div className="w-full max-w-sm h-72 md:h-96 bg-primary-softest rounded-3xl border border-edge flex items-center justify-center">
            <span className="text-muted text-sm">Imagen principal</span>
          </div>

          {/* Badge flotante */}
          <div className="absolute bottom-4 left-4 flex items-start gap-2.5 bg-card-bg border border-edge rounded-xl shadow-sm px-3 py-2.5 max-w-[200px]">
            <ShieldCheck className="w-5 h-5 text-ok-text shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-heading leading-tight">Certificación B-Corp</p>
              <p className="text-[11px] text-muted leading-tight mt-0.5">Estándares de impacto verificados</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
