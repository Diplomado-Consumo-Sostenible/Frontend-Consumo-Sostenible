import {
  AlertCircle,
  CalendarDays,
  Camera,
  CheckCircle2,
  Edit2,
  Eye,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  Trash2,
  User,
  UserCircle,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../context/ToastContext';
import useUserProfile from '../../hooks/useUserProfile';
import { getGeneros } from '../../services/types/generos.service';
import { uploadProfileImage } from '../../services/upload/upload.service';
import { updateMyProfile, updateMyProfilePhoto } from '../../services/user/profile.service';
import { changeEmail, changePassword } from '../../services/user/user.service';
import { removeToken } from '../../utils/storage';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

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
  return { pct: Math.round((done / checks.length) * 100) };
}

function EditModal({ currentNombre, currentGeneroId, generos, onSave, onClose, loading }) {
  const [nombre, setNombre] = useState(currentNombre || '');
  const [generoId, setGeneroId] = useState(currentGeneroId || '');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    else if (nombre.trim().length < 3) errs.nombre = 'Mínimo 3 caracteres';
    if (!generoId) errs.generoId = 'Selecciona un género';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ nombre: nombre.trim(), id_genero: Number(generoId) });
  };

  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-stone-700 focus:outline-none focus:ring-2 transition-all bg-white ${
      err
        ? 'border-red-300 focus:ring-red-200'
        : 'border-stone-200 focus:ring-emerald-300 focus:border-emerald-400'
    }`;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-stone-800">Editar datos personales</h3>
            <button
              onClick={!loading ? onClose : undefined}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-stone-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-600 block mb-1.5">
                Nombre de usuario
              </label>
              <input
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setErrors((p) => ({ ...p, nombre: null }));
                }}
                placeholder="Ej. Usuario123"
                className={inputCls(errors.nombre)}
                disabled={loading}
              />
              {errors.nombre && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-stone-600 block mb-1.5">Género</label>
              <select
                value={generoId}
                onChange={(e) => {
                  setGeneroId(e.target.value);
                  setErrors((p) => ({ ...p, generoId: null }));
                }}
                className={inputCls(errors.generoId)}
                disabled={loading}
              >
                <option value="">Selecciona tu género</option>
                {generos.map((g) => (
                  <option key={g.id_genero} value={g.id_genero}>
                    {g.nombre}
                  </option>
                ))}
              </select>
              {errors.generoId && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.generoId}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={!loading ? onClose : undefined}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function ChangeEmailModal({ currentEmail, onSave, onClose, loading }) {
  const [newEmail,  setNewEmail]  = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [errors,    setErrors]    = useState({});

  const validate = () => {
    const errs = {};
    if (!newEmail.trim()) errs.newEmail = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) errs.newEmail = 'Ingresa un correo válido';
    else if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) errs.newEmail = 'El nuevo correo debe ser diferente al actual';
    if (!password) errs.password = 'La contraseña es requerida para confirmar el cambio';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ newEmail: newEmail.trim(), password });
  };

  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-stone-700 focus:outline-none focus:ring-2 transition-all bg-white ${
      err
        ? 'border-red-300 focus:ring-red-200'
        : 'border-stone-200 focus:ring-emerald-300 focus:border-emerald-400'
    }`;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-stone-800">Cambiar correo electrónico</h3>
            <button
              onClick={!loading ? onClose : undefined}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-stone-500" />
            </button>
          </div>
          <p className="text-xs text-stone-400 mb-5">
            Correo actual: <span className="font-medium text-stone-600">{currentEmail}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-600 block mb-1.5">
                Nuevo correo electrónico
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setErrors((p) => ({ ...p, newEmail: null }));
                }}
                placeholder="nuevo@correo.com"
                className={inputCls(errors.newEmail)}
                disabled={loading}
                autoComplete="off"
              />
              {errors.newEmail && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.newEmail}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-stone-600 block mb-1.5">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: null }));
                  }}
                  placeholder="Confirma tu identidad"
                  className={`${inputCls(errors.password)} pr-10`}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={!loading ? onClose : undefined}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? 'Guardando…' : 'Cambiar correo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function ChangePasswordModal({ onSave, onClose, loading }) {
  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [showCurrent,      setShowCurrent]      = useState(false);
  const [showNew,          setShowNew]          = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [errors,           setErrors]           = useState({});

  const validate = () => {
    const errs = {};
    if (!currentPassword) errs.currentPassword = 'La contraseña actual es requerida';
    if (!newPassword) errs.newPassword = 'La nueva contraseña es requerida';
    else if (newPassword.length < 6) errs.newPassword = 'Mínimo 6 caracteres';
    else if (newPassword === currentPassword) errs.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    if (!confirmPassword) errs.confirmPassword = 'Confirma tu nueva contraseña';
    else if (confirmPassword !== newPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ currentPassword, newPassword });
  };

  const inputCls = (err) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-stone-700 focus:outline-none focus:ring-2 transition-all bg-white ${
      err
        ? 'border-red-300 focus:ring-red-200'
        : 'border-stone-200 focus:ring-emerald-300 focus:border-emerald-400'
    }`;

  const EyeToggle = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
      tabIndex={-1}
    >
      {show ? (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-stone-800">Cambiar contraseña</h3>
            <button
              onClick={!loading ? onClose : undefined}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-stone-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-600 block mb-1.5">Contraseña actual</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setErrors((p) => ({ ...p, currentPassword: null })); }}
                  placeholder="Tu contraseña actual"
                  className={`${inputCls(errors.currentPassword)} pr-10`}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <EyeToggle show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
              </div>
              {errors.currentPassword && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-stone-600 block mb-1.5">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: null, confirmPassword: null })); }}
                  placeholder="Mínimo 6 caracteres"
                  className={`${inputCls(errors.newPassword)} pr-10`}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <EyeToggle show={showNew} onToggle={() => setShowNew((v) => !v)} />
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-stone-600 block mb-1.5">Confirmar nueva contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: null })); }}
                  placeholder="Repite la nueva contraseña"
                  className={`${inputCls(errors.confirmPassword)} pr-10`}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={!loading ? onClose : undefined}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? 'Guardando…' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function PhotoPreviewModal({ src, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="relative max-w-sm w-full">
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4 text-stone-600" />
          </button>
          <img
            src={src}
            alt="Foto de perfil"
            className="w-full rounded-2xl shadow-2xl object-cover aspect-square"
          />
        </div>
      </div>
    </>
  );
}

function AvatarMenu({ hasPhoto, src, onUpload, onRemove, onView, onClose, loading }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={!loading ? onClose : undefined} />
      <div className="absolute left-0 top-[calc(100%+10px)] z-20 bg-white rounded-2xl shadow-2xl border border-edge overflow-hidden w-52 py-1.5">
        <label
          className={`flex items-center gap-3 px-4 py-2.5 hover:bg-primary-softest transition-colors ${
            loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
          }`}
        >
          <Camera className="w-4 h-4 text-primary-dark shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-heading">Subir foto</span>
            <span className="text-[10px] text-muted">PNG, JPG, JPEG, WEBP · 400×400</span>
          </div>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={onUpload}
            disabled={loading}
          />
        </label>
        {hasPhoto && (
          <>
            <button
              onClick={!loading ? onView : undefined}
              disabled={loading}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-softest w-full transition-colors disabled:opacity-50"
            >
              <Eye className="w-4 h-4 text-primary-dark shrink-0" />
              <span className="text-sm font-medium text-heading">Ver foto</span>
            </button>
            <button
              onClick={!loading ? onRemove : undefined}
              disabled={loading}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm font-medium text-red-600">Eliminar foto</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}

function AvatarButton({ src, initials, onClick, loading }) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={onClick}
        disabled={loading}
        className="relative w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white/20 group focus:outline-none disabled:cursor-wait"
      >
        {src ? (
          <img src={src} alt="Foto de perfil" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary-dark flex items-center justify-center">
            <span className="text-2xl font-bold text-on-dark-active select-none">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {loading
            ? <Loader2 className="w-5 h-5 text-white animate-spin" />
            : <Camera className="w-5 h-5 text-white" />
          }
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

function FieldAction({ icon, label, value, actionLabel, onClick }) {
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
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-darkest text-on-dark-active text-xs font-semibold hover:bg-primary-dark transition-colors shrink-0"
      >
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
  const toast   = useToastContext();
  const navigate = useNavigate();

  const [menuOpen,         setMenuOpen]         = useState(false);
  const [previewOpen,      setPreviewOpen]      = useState(false);
  const [editOpen,         setEditOpen]         = useState(false);
  const [editLoading,      setEditLoading]      = useState(false);
  const [emailOpen,        setEmailOpen]        = useState(false);
  const [emailLoading,     setEmailLoading]     = useState(false);
  const [passwordOpen,     setPasswordOpen]     = useState(false);
  const [passwordLoading,  setPasswordLoading]  = useState(false);
  const [photoLoading,     setPhotoLoading]     = useState(false);
  const [localPhoto,       setLocalPhoto]       = useState(null);
  const [photoRemoved,     setPhotoRemoved]     = useState(false);
  const [generos,          setGeneros]          = useState([]);

  const email        = profile?._user?.email      ?? profile?.email        ?? '';
  const nombre       = profile?._profile?.nombre  ?? profile?.nombre       ?? '';
  const genero       = profile?._profile?.genero?.nombre                   ?? '';
  const generoId     = profile?._profile?.genero?.id_genero                ?? '';
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

  useEffect(() => {
    if (editOpen && generos.length === 0) {
      getGeneros().then(setGeneros).catch(() => {});
    }
  }, [editOpen, generos.length]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Formato no permitido. Usa PNG, JPG, JPEG o WEBP.');
      return;
    }

    const preview = URL.createObjectURL(file);
    if (localPhoto) URL.revokeObjectURL(localPhoto);
    setLocalPhoto(preview);
    setPhotoRemoved(false);
    setMenuOpen(false);
    setPhotoLoading(true);

    try {
      const { url } = await uploadProfileImage(file);
      await updateMyProfilePhoto(url);
      await retry();
      toast.success('Foto de perfil actualizada');
    } catch (err) {
      toast.error(err?.message || 'Error al subir la foto');
      URL.revokeObjectURL(preview);
      setLocalPhoto(null);
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleChangeEmail = async ({ newEmail, password }) => {
    setEmailLoading(true);
    try {
      await changeEmail({ newEmail, password });
      setEmailOpen(false);
      toast.success(`Correo actualizado a ${newEmail}. Inicia sesión con tu nuevo correo.`);
      setTimeout(() => {
        removeToken();
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err?.message || 'Error al cambiar el correo');
      setEmailLoading(false);
    }
  };

  const handleRemove = () => {
    if (localPhoto) URL.revokeObjectURL(localPhoto);
    setLocalPhoto(null);
    setPhotoRemoved(true);
    setMenuOpen(false);
  };

  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordOpen(false);
      toast.success('Contraseña actualizada correctamente.');
    } catch (err) {
      toast.error(err?.message || 'Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveEdit = async ({ nombre: nuevoNombre, id_genero }) => {
    setEditLoading(true);
    try {
      await updateMyProfile({ nombre: nuevoNombre, id_genero });
      await retry();
      setEditOpen(false);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      toast.error(err?.message || 'Error al actualizar el perfil');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="px-4 py-5 sm:px-6 lg:pl-10 lg:pr-8 space-y-5">

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

              <div className="relative">
                <AvatarButton
                  src={displayPhoto}
                  initials={initials}
                  onClick={() => !photoLoading && setMenuOpen((v) => !v)}
                  loading={photoLoading}
                />
                {menuOpen && (
                  <AvatarMenu
                    hasPhoto={!!displayPhoto}
                    src={displayPhoto}
                    onUpload={handleUpload}
                    onRemove={handleRemove}
                    onView={() => { setMenuOpen(false); setPreviewOpen(true); }}
                    onClose={() => setMenuOpen(false)}
                    loading={photoLoading}
                  />
                )}
              </div>

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

              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-on-dark-active text-sm font-medium transition-colors shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar perfil
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            <div className="bg-card-bg rounded-2xl shadow-sm border border-edge p-5">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">
                Información de cuenta
              </p>
              <FieldItem icon={Mail}         label="Correo electrónico" value={email}             />
              <FieldItem icon={CalendarDays} label="Miembro desde"      value={formatDate(createdAt)} />
            </div>

            <div className="bg-card-bg rounded-2xl shadow-sm border border-edge p-5">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">
                Datos de perfil
              </p>
              <FieldItem icon={User}       label="Nombre de perfil" value={nombre || null} />
              <FieldItem icon={UserCircle} label="Género"           value={genero || null} />

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
            <FieldAction
              icon={Mail}
              label="Correo electrónico"
              value={email}
              actionLabel="Cambiar email"
              onClick={() => setEmailOpen(true)}
            />
            <FieldAction
              icon={Lock}
              label="Contraseña"
              value="••••••••••••"
              actionLabel="Cambiar contraseña"
              onClick={() => setPasswordOpen(true)}
            />
          </div>

        </div>
      )}

      {editOpen && (
        <EditModal
          currentNombre={nombre}
          currentGeneroId={generoId}
          generos={generos}
          onSave={handleSaveEdit}
          onClose={() => !editLoading && setEditOpen(false)}
          loading={editLoading}
        />
      )}

      {previewOpen && displayPhoto && (
        <PhotoPreviewModal
          src={displayPhoto}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {emailOpen && (
        <ChangeEmailModal
          currentEmail={email}
          onSave={handleChangeEmail}
          onClose={() => !emailLoading && setEmailOpen(false)}
          loading={emailLoading}
        />
      )}

      {passwordOpen && (
        <ChangePasswordModal
          onSave={handleChangePassword}
          onClose={() => !passwordLoading && setPasswordOpen(false)}
          loading={passwordLoading}
        />
      )}
    </div>
  );
}
