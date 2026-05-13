import { Link } from 'react-router-dom';

export default function CTABanner() {
  return (
    <section className="bg-primary-dark py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
        <h2 className="text-2xl sm:text-3xl font-serif text-on-dark-active leading-tight max-w-xl">
          ¿Tienes un negocio con propósito?
        </h2>
        <p className="text-sm text-on-dark max-w-md leading-relaxed">
          Únete a nuestra comunidad de comercios sostenibles. Certifica tu impacto,
          conecta con consumidores conscientes y haz crecer tu negocio.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-card-bg text-primary-dark font-semibold text-sm hover:bg-primary-softest transition-colors"
          >
            Comenzar ahora
          </Link>
          <Link
            to="/dashboard/explorar"
            className="inline-flex items-center px-6 py-2.5 rounded-xl border border-on-dark-active/40 text-on-dark-active font-semibold text-sm hover:border-on-dark-active transition-colors"
          >
            Saber más
          </Link>
        </div>
      </div>
    </section>
  );
}
