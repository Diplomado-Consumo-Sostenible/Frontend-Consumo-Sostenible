import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Explorar', type: 'scroll', id: 'explorar' },
  { label: 'Mapa',     type: 'scroll', id: 'mapa'     },
  { label: 'Impacto',  type: 'scroll', id: 'hero'     },
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function LandingNavbar() {
  const { hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-card-bg/80 backdrop-blur-md border-b border-edge/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="https://res.cloudinary.com/dhhlvuzqa/image/upload/v1777184416/ecovida_perfiles/dns8fzkguprwuca0ydgv.webp"
            alt="Consumo Sostenible"
            className="w-8 h-8 rounded-lg object-contain shrink-0"
          />
          <span className="font-semibold text-primary-dark text-sm sm:text-base tracking-tight">
            EcoVida
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            if (link.type === 'scroll') return (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className="text-sm font-medium text-body hover:text-primary-dark transition-colors"
              >
                {link.label}
              </button>
            );
            if (link.type === 'route') return (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-body hover:text-primary-dark transition-colors"
              >
                {link.label}
              </Link>
            );
            return (
              <a
                key={link.to}
                href={link.to}
                className={`text-sm font-medium transition-colors ${
                  hash === link.to ? 'text-primary-dark' : 'text-body hover:text-primary-dark'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link
            to="/login"
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-edge text-sm font-medium text-body hover:border-primary-mid hover:text-primary-dark transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-primary-dark text-on-dark-active text-sm font-medium hover:bg-primary-darkest transition-colors"
          >
            Registra tu negocio
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden p-2 rounded-lg hover:bg-app-bg transition-colors"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen
            ? <X className="w-5 h-5 text-heading" />
            : <Menu className="w-5 h-5 text-heading" />}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-edge bg-card-bg px-4 pb-5 pt-3 flex flex-col">
          <nav className="flex flex-col gap-0.5 mb-4">
            {NAV_LINKS.map((link) => {
              if (link.type === 'scroll') return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => { scrollTo(link.id); setMenuOpen(false); }}
                  className="py-2.5 text-sm font-medium text-body hover:text-primary-dark transition-colors text-left"
                >
                  {link.label}
                </button>
              );
              if (link.type === 'route') return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-sm font-medium text-body hover:text-primary-dark transition-colors"
                >
                  {link.label}
                </Link>
              );
              return (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-sm font-medium text-body hover:text-primary-dark transition-colors"
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
          <div className="pt-4 border-t border-edge flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:border-primary-mid transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-primary-dark text-on-dark-active text-sm font-medium hover:bg-primary-darkest transition-colors"
            >
              Registra tu negocio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
