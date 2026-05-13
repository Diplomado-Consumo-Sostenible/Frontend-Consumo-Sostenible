import { Leaf } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function LandingNavbar() {
  const { hash } = useLocation();

  const navLinks = [
    { label: 'Explorar', to: '/dashboard/explorar', isRoute: true },
    { label: 'Impacto',  to: '#impacto',            isRoute: false },
    { label: 'Certificaciones', to: '#certificaciones', isRoute: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-card-bg border-b border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Leaf className="w-5 h-5 text-primary-dark" />
          <span className="font-semibold text-primary-dark text-sm sm:text-base">
            Consumo Sostenible
          </span>
        </Link>

        {/* Links — ocultos en mobile */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ label, to, isRoute }) =>
            isRoute ? (
              <Link
                key={to}
                to={to}
                className="text-sm text-body hover:text-primary-dark transition-colors"
              >
                {label}
              </Link>
            ) : (
              <a
                key={to}
                href={to}
                className={`text-sm transition-colors ${
                  hash === to ? 'text-primary-dark font-medium' : 'text-body hover:text-primary-dark'
                }`}
              >
                {label}
              </a>
            ),
          )}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl border border-edge text-sm font-medium text-body hover:border-primary-mid transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center px-3 py-1.5 rounded-xl bg-primary-dark text-on-dark-active text-sm font-medium hover:bg-primary-darkest transition-colors"
          >
            Registra tu negocio
          </Link>
        </div>
      </div>
    </header>
  );
}
