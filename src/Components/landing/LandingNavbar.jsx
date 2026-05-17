import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Star, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useUserProfile from '../../hooks/useUserProfile';
import { decodeToken } from '../../utils/jwt.utils';
import { getToken, removeToken } from '../../utils/storage';

const NAV_LINKS = [
  { label: 'Explorar', type: 'scroll', id: 'explorar' },
  { label: 'Mapa',     type: 'scroll', id: 'mapa'     },
  { label: 'Impacto',  type: 'scroll', id: 'hero'     },
];

const USER_MENU_ITEMS = [
  { label: 'Mis favoritos', icon: Heart, to: '/favoritos' },
  { label: 'Mi perfil',     icon: User,  to: '/perfil'    },
  { label: 'Mis reseñas',   icon: Star,  to: '/resenas'   },
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

function UserAvatar({ src, initials }) {
  if (src) {
    return (
      <img
        src={src}
        alt="Foto de perfil"
        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-light/40"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center ring-2 ring-primary-light/40">
      <span className="text-xs font-bold text-on-dark-active select-none">{initials}</span>
    </div>
  );
}

export default function LandingNavbar() {
  const { hash }   = useLocation();
  const navigate   = useNavigate();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropOpen,     setDropOpen]     = useState(false);

  /* ── Auth state ─────────────────────────────────────── */
  const token    = getToken();
  const decoded  = decodeToken(token);
  const role     = decoded?.rol?.toLowerCase();
  const isUser   = role === 'user';
  const isOwner  = role === 'owner';
  const isAdmin  = role === 'admin';
  const isStaff  = isOwner || isAdmin;

  const panelTo  = isAdmin ? '/adminDashboard' : '/dashboardBusiness/perfil';

  const { profile } = useUserProfile();
  
  const nombre   = (isUser || isStaff)
    ? (profile?._profile?.nombre ?? profile?.nombre ?? '')
    : '';
  const foto     = (isUser || isStaff)
    ? (profile?._profile?.foto_perfil ?? profile?.foto_perfil ?? null)
    : null;
  const initials = (nombre || decoded?.email || '').slice(0, 2).toUpperCase() || 'U';

  const handleLogout = () => {
    removeToken();
    setDropOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const renderNavLink = (link, onClick) => {
    if (link.type === 'scroll') {
      const handleClick = () => {
        onClick?.();
        if (location.pathname === '/') {
          scrollTo(link.id);
        } else {
          navigate(`/#${link.id}`);
        }
      };
      return (
        <button
          key={link.id}
          type="button"
          onClick={handleClick}
          className="text-sm font-medium text-body hover:text-primary-dark transition-colors"
        >
          {link.label}
        </button>
      );
    }
    return (
      <Link
        key={link.to}
        to={link.to}
        onClick={onClick}
        className={`text-sm font-medium transition-colors ${
          hash === link.to ? 'text-primary-dark' : 'text-body hover:text-primary-dark'
        }`}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-card-bg/80 backdrop-blur-md border-b border-edge/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
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

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => renderNavLink(link))}
          {isUser && (
            <>
              <Link
                to="/favoritos"
                className="flex items-center gap-1.5 text-sm font-medium text-body hover:text-primary-dark transition-colors"
              >
                Favoritos
              </Link>
              <Link
                to="/resenas"
                className="flex items-center gap-1.5 text-sm font-medium text-body hover:text-primary-dark transition-colors"
              >
                Reseñas
              </Link>
            </>
          )}
        </nav>

        {/* Desktop right side */}
        {isUser ? (
          <div className="hidden sm:flex items-center relative">
            <button
              onClick={() => setDropOpen((v) => !v)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-app-bg transition-colors"
            >
              <UserAvatar src={foto} initials={initials} />
              <span className="text-sm font-medium text-body max-w-[120px] truncate">
                {nombre || 'Mi cuenta'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${
                dropOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {dropOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropOpen(false)}
                />
                <div className="absolute right-0 top-[calc(100%+8px)] z-20 bg-card-bg rounded-2xl border border-edge shadow-warm w-52 py-1.5 overflow-hidden">
                  {/* Header del dropdown */}
                  <div className="px-4 py-3 border-b border-edge">
                    <p className="text-xs font-semibold text-heading truncate">
                      {nombre || 'Usuario'}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {decoded?.email ?? ''}
                    </p>
                  </div>

                  {/* Items del menu */}
                  {USER_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-softest transition-colors text-sm font-medium text-body"
                    >
                      <item.icon className="w-4 h-4 text-primary-dark shrink-0" />
                      {item.label}
                    </Link>
                  ))}

                  {/* Logout */}
                  <div className="border-t border-edge mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-sm font-medium text-red-600"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : isStaff ? (
          <div className="hidden sm:flex items-center relative">
            <button
              onClick={() => setDropOpen((v) => !v)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-app-bg transition-colors"
            >
              <UserAvatar src={foto} initials={initials} />
              <span className="text-sm font-medium text-body max-w-[120px] truncate">
                {nombre || (isAdmin ? 'Admin' : 'Mi negocio')}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${
                dropOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {dropOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+8px)] z-20 bg-card-bg rounded-2xl border border-edge shadow-warm w-52 py-1.5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-edge">
                    <p className="text-xs font-semibold text-heading truncate">
                      {nombre || (isAdmin ? 'Administrador' : 'Propietario')}
                    </p>
                    <p className="text-[11px] text-muted truncate">{decoded?.email ?? ''}</p>
                  </div>
                  <Link
                    to={panelTo}
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-softest transition-colors text-sm font-medium text-body"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary-dark shrink-0" />
                    Panel
                  </Link>
                  <div className="border-t border-edge mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-sm font-medium text-red-600"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* ── No autenticado: botones login/register ───────────── */
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
              Registrate ahora
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden p-2 rounded-lg hover:bg-app-bg transition-colors"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen
            ? <X    className="w-5 h-5 text-heading" />
            : <Menu className="w-5 h-5 text-heading" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-edge bg-card-bg px-4 pb-5 pt-3 flex flex-col">
          <nav className="flex flex-col gap-0.5 mb-4">
            {NAV_LINKS.map((link) => renderNavLink(link, () => setMenuOpen(false)))}
            {isUser && (
              <>
                <Link
                  to="/favoritos"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-body hover:text-primary-dark transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 text-primary-dark" />
                  Favoritos
                </Link>
                <Link
                  to="/resenas"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-body hover:text-primary-dark transition-colors"
                >
                  <Star className="w-3.5 h-3.5 text-primary-dark" />
                  Reseñas
                </Link>
              </>
            )}
          </nav>

          <div className="pt-4 border-t border-edge flex flex-col gap-2">
            {isUser ? (
              /* USER autenticado en mobile */
              <>
                <div className="flex items-center gap-3 px-1 py-2">
                  <UserAvatar src={foto} initials={initials} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-heading truncate">{nombre || 'Mi cuenta'}</p>
                    <p className="text-xs text-muted truncate">{decoded?.email ?? ''}</p>
                  </div>
                </div>
                {USER_MENU_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-1 text-sm font-medium text-body hover:text-primary-dark transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-primary-dark shrink-0" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 py-2.5 px-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Cerrar sesión
                </button>
              </>
            ) : isStaff ? (
              /* OWNER / ADMIN en mobile */
              <>
                <div className="flex items-center gap-3 px-1 py-2">
                  <UserAvatar src={foto} initials={initials} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-heading truncate">
                      {nombre || (isAdmin ? 'Administrador' : 'Propietario')}
                    </p>
                    <p className="text-xs text-muted truncate">{decoded?.email ?? ''}</p>
                  </div>
                </div>
                <Link
                  to={panelTo}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-1 text-sm font-medium text-body hover:text-primary-dark transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary-dark shrink-0" />
                  Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 py-2.5 px-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              /* No autenticado en mobile */
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
