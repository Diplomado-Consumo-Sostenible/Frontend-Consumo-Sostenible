import {
  AlertCircle,
  CalendarDays,
  Camera,
  CheckCircle2,
  Edit2,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  Trash2,
  User,
  UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import useUserProfile from '../../hooks/useUserProfile';

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function calcCompletion(profile, hasPhoto) {
  const checks = [
    !!(profile?._user?.email ?? profile?.email),
    !!(profile?._profile?.nombre ?? profile?.nombre),
    !!(profile?._profile?.genero?.nombre),
    !!hasPhoto,
  ];
  const done = checks.filter(Boolean).length;
  return { pct: Math.round((done / checks.length) * 100), done, total: checks.length };
}

function AvatarMenu({ hasPhoto, onUpload, onRemove, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute left-0 top-[calc(100%+10px)] z-20 bg-white rounded-2xl shadow-2xl border border-edge overflow-hidden w-48 py-1.5">
        <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-softest cursor-pointer transition-colors">
          <Camera className="w-4 h-4 text-primary-dark shrink-0" />
          <span className="text-sm font-medium text-heading">Subir foto</span>
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </label>
        {hasPhoto && (
          <button
            onClick={onRemove}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm font-medium text-red-600">Eliminar foto</span>
          </button>
        )}
      </div>
    </>
  );
}

function AvatarButton({ src, initials, onClick }) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={onClick}
        className="relative w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white/20 group focus:outline-none"
      >
        {src ? (
          <img src={src} alt="Foto de perfil" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary-dark flex items-center justify-center">
            <span className="text-2xl font-bold text-on-dark-active select-none">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
      </button>
      <span className="absolute bottom-1 left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-darkest" />
    </div>
  );
}

function FieldItem({ icon, label, value }) {
  const Icon = icon;
  const filled = value != null && value !== '';
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-edge last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary-dark" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-medium ${filled ? 'text-heading' : 'text-muted'}`}>
          {filled ? value : '—'}
        </p>
      </div>
      {filled && <CheckCircle2 className="w-4 h-4 text-primary-mid shrink-0" />}
    </div>
  );
}

function FieldAction({ icon, label, value, actionLabel }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 py-4 border-b border-edge last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary-softest flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary-dark" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-medium text-heading">{value}</p>
      </div>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-darkest text-on-dark-active text-xs font-semibold hover:bg-primary-dark transition-colors shrink-0">
        <Edit2 className="w-3 h-3" />
        {actionLabel}
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="w-8 h-8 text-primary-mid animate-spin" />
      <p className="text-sm text-muted">Cargando perfil…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-heading">No se pudo cargar el perfil</p>
        <p className="text-xs text-muted max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-dark text-on-dark-active text-sm font-medium hover:bg-primary-darkest transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reintentar
      </button>
    </div>
  );
}

export default function Profile() {
  const { profile, loading, error, retry } = useUserProfile();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [localPhoto,   setLocalPhoto]   = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const email        = profile?._user?.email      ?? profile?.email        ?? '';
  const nombre       = profile?._profile?.nombre  ?? profile?.nombre       ?? '';
  const genero       = profile?._profile?.genero?.nombre                   ?? '';
  const fotoOriginal = profile?._profile?.foto_perfil ?? profile?.foto_perfil ?? null;
  const createdAt    = profile?._user?.createdAt
                    ?? profile?._profile?.usuario?.createdAt
                    ?? profile?._profile?.user?.createdAt
                    ?? profile?._profile?.createdAt
                    ?? profile?.createdAt
                    ?? null;

  const displayPhoto = photoRemoved ? null : (localPhoto ?? fotoOriginal);
  const initials     = (nombre || email).slice(0, 2).toUpperCase() || '??';
  const { pct }      = calcCompletion(profile, !!displayPhoto);

  const hint = !displayPhoto
    ? 'Agrega tu foto para completar tu cuenta'
    : !nombre
      ? 'Agrega tu nombre de perfil'
      : !genero
        ? 'Selecciona tu género'
        : '¡Perfil completo!';

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localPhoto) URL.revokeObjectURL(localPhoto);
    setLocalPhoto(URL.createObjectURL(file));
    setPhotoRemoved(false);
    setMenuOpen(false);
  };

  const handleRemove = () => {
    if (localPhoto) URL.revokeObjectURL(localPhoto);
    setLocalPhoto(null);
    setPhotoRemoved(true);
    setMenuOpen(false);
  };

  return (
    <div className="px-4 py-5 sm:px-6 lg:pl-10 lg:pr-8 space-y-5">

      {/* breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <User className="w-3.5 h-3.5" />
        <span className="font-medium text-heading">Mi perfil</span>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={retry} />}

      {!loading && !error && profile && (
        <div className="space-y-5 max-w-4xl mx-auto">

          <div className="relative bg-primary-darkest rounded-2xl p-6">
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #A8D5B5 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            </div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">

              {/* avatar + menu */}
              <div className="relative">
                <AvatarButton
                  src={displayPhoto}
                  initials={initials}
                  onClick={() => setMenuOpen((v) => !v)}
                />
                {menuOpen && (
                  <AvatarMenu
                    hasPhoto={!!displayPhoto}
                    onUpload={handleUpload}
                    onRemove={handleRemove}
                    onClose={() => setMenuOpen(false)}
                  />
                )}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h2 className="text-xl font-bold text-on-dark-active truncate">
                  {nombre || email.split('@')[0] || 'Sin nombre'}
                </h2>
                <p className="text-sm text-on-dark flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {email || '—'}
                </p>
                {genero && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-on-dark-active border border-white/10">
                    ✦ {genero}
                  </span>
                )}
              </div>

              {/* edit button */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-on-dark-active text-sm font-medium transition-colors shrink-0">
                <Edit2 className="w-3.5 h-3.5" />
                Editar perfil
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Información de cuenta */}
            <div className="bg-card-bg rounded-2xl shadow-sm border border-edge p-5">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">
                Información de cuenta
              </p>
              <FieldItem icon={Mail}         label="Correo electrónico" value={email}            />
              <FieldItem icon={CalendarDays} label="Miembro desde"      value={formatDate(createdAt)} />
            </div>

            {/* Datos de perfil */}
            <div className="bg-card-bg rounded-2xl shadow-sm border border-edge p-5">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">
                Datos de perfil
              </p>
              <FieldItem icon={User}        label="Nombre de perfil" value={nombre  || null} />
              <FieldItem icon={UserCircle}  label="Género"           value={genero  || null} />

              {/* progress */}
              <div className="mt-4 p-3.5 rounded-xl bg-primary-softest">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-heading">Perfil completado</span>
                  <span className="text-xs font-bold text-primary-dark">{pct}%</span>
                </div>
                <div className="h-1.5 bg-primary-light/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-dark rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted mt-2">{hint}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-bg rounded-2xl shadow-sm border border-edge p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Seguridad</p>
              <span className="flex items-center gap-1.5 text-xs font-medium text-ok-text bg-ok-bg px-2.5 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                Cuenta protegida
              </span>
            </div>
            <FieldAction icon={Mail} label="Correo electrónico" value={email}       actionLabel="Cambiar email"       />
            <FieldAction icon={Lock} label="Contraseña"          value="••••••••••••" actionLabel="Cambiar contraseña" />
          </div>

        </div>
      )}
    </div>
  );
}
