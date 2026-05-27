import { Leaf, Menu } from 'lucide-react';
import useUserProfile from '../../hooks/useUserProfile';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import { getToken } from '../../utils/storage';
import { decodeToken } from '../../utils/jwt.utils';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function Navbar({ onToggleSidebar }) {
  const { profile } = useUserProfile();
  const firstName = (profile?._profile?.nombre ?? profile?.nombre ?? '').split(' ')[0] || '';

  const decoded = decodeToken(getToken());
  const isAdmin = decoded?.rol?.toLowerCase() === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-card-bg/95 backdrop-blur-sm border-b border-edge/60 px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between shrink-0 shadow-sm">

      <div className="flex items-center gap-3">
        {/* Botón hamburguesa — solo mobile */}
        <button
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-edge text-body hover:bg-app-bg transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Saludo */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex w-8 h-8 rounded-xl bg-primary-softest items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-primary-dark" />
          </div>
          <div>
            <p className="text-[11px] text-muted leading-none mb-0.5">{getGreeting()}</p>
            <p className="text-base font-semibold text-heading leading-none">
              {firstName ? `¡Hola, ${firstName}!` : 'Bienvenido'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!isAdmin && <NotificationBell />}
        <UserMenu profile={profile} />
      </div>

    </header>
  );
}
