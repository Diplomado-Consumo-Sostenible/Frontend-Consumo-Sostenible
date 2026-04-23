import { Home, LogOut, Menu, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clearSession, getSession } from '../utils/storage';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const session = getSession();
  const rol = session?.rol?.toUpperCase();
  const isAdmin = rol === 'ADMIN';
  const isUser  = rol === 'USER' || rol === 'OWNER';
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    toast.success('Sesión cerrada correctamente.');
    setTimeout(() => navigate('/login'), 800);
  };

  const closeSidebar = () => setOpen(false);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-emerald-500" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22C6.5 22 2 17.5 2 12C2 7 5.5 3.5 10 2C10 2 8 8 12 12C16 16 22 14 22 14C22 18.5 17.5 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-emerald-600 font-semibold text-sm tracking-widest uppercase">EcoVida</span>
        </div>
        <button onClick={closeSidebar} className="md:hidden text-stone-400 hover:text-stone-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {session?.nombre && (
        <p className="text-xs text-stone-400 px-2 mb-4 truncate">
          Hola, <span className="font-medium text-stone-600">{session.nombre}</span>
        </p>
      )}

      <NavItem to="/dashboard" icon={Home} label="Inicio" onClick={closeSidebar} />
      {isAdmin && <NavItem to="/adminDashboard/usuarios" icon={Users} label="Administrar usuarios" onClick={closeSidebar} />}

      <div className="mt-auto">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-red-50 hover:text-red-500 transition-colors">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar desktop — siempre visible */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col py-8 px-4 gap-1 bg-white border-r border-stone-100 shadow-sm sticky top-0 self-start h-screen">{sidebarContent}</aside>

      {/* Overlay mobile */}
      {open && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" onClick={closeSidebar} />}

      {/* Sidebar mobile — drawer */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col py-8 px-4 gap-1 bg-white shadow-xl transition-transform duration-300 md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>{sidebarContent}</aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-100 shadow-sm sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-stone-500 hover:text-emerald-600 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-emerald-500" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22C6.5 22 2 17.5 2 12C2 7 5.5 3.5 10 2C10 2 8 8 12 12C16 16 22 14 22 14C22 18.5 17.5 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-emerald-600 font-semibold text-xs tracking-widest uppercase">EcoVida</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
