import { Link } from 'react-router-dom';

export default function CTABanner() {
  return (
    <section className="relative bg-primary-dark py-20 overflow-hidden">
      {/* Grain overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />
      {/* Decorative circles */}
      <div aria-hidden="true" className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-mid/10 blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-on-dark/5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-on-dark-active/20 bg-on-dark-active/5 text-xs font-medium text-on-dark tracking-wide">
          Para emprendedores con propósito
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-on-dark-active leading-tight max-w-2xl">
          ¿Tienes un negocio con propósito?
        </h2>
        <p className="text-sm text-on-dark max-w-md leading-relaxed">
          Únete a nuestra comunidad de comercios sostenibles. Certifica tu impacto,
          conecta con consumidores conscientes y haz crecer tu negocio.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <Link
            to="/register"
            className="inline-flex items-center px-7 py-3 rounded-xl bg-card-bg text-primary-dark font-semibold text-sm hover:bg-primary-softest transition-colors shadow-warm"
          >
            Comenzar ahora
          </Link>
        </div>
      </div>
    </section>
  );
}
