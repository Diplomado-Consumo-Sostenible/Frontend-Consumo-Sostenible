import { Leaf } from 'lucide-react';
import useUserProfile from '../../hooks/useUserProfile';
import UserMenu from './UserMenu';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function Navbar() {
  const { profile } = useUserProfile();
  const firstName = (profile?._profile?.nombre ?? profile?.nombre ?? '').split(' ')[0] || '';

  return (
    <header className="sticky top-0 z-30 bg-card-bg/95 backdrop-blur-sm border-b border-edge/60 px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
          <Leaf className="w-4 h-4 text-primary-dark" />
        </div>
        <div>
          <p className="text-[11px] text-muted leading-none mb-0.5">{getGreeting()}</p>
          <p className="text-base font-semibold text-heading leading-none">
            {firstName ? `¡Hola, ${firstName}!` : 'Bienvenido'}
          </p>
        </div>
      </div>
      <UserMenu profile={profile} />
    </header>
  );
}
