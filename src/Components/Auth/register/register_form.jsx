import { Leaf } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getGeneros } from '../../../services/user/genero.service';
import BackButton from '../../backButton';
import Button from '../../button';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const inputClass = (error) =>
  `w-full pl-10 pr-4 py-3 rounded-xl border text-body placeholder-muted text-sm
    focus:outline-none focus:ring-2 transition-all bg-card-bg
    ${error
      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
      : 'border-edge focus:ring-primary-mid/30 focus:border-primary-mid hover:border-primary-light'}`;

export default function RegisterForm({ onNext, onBack, defaultValues, role }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues });

  const [generos, setGeneros] = useState([]);

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const data = await getGeneros();
        setGeneros(data);
      } catch (error) {
        console.error('Error al cargar géneros:', error);
      }
    };
    fetchGeneros();
  }, []);

  const onSubmit = (data) => onNext(data);

  const handleGoogle = () => {
    sessionStorage.setItem('google_register_intent', JSON.stringify({ roleId: role }));
    window.location.href = `${API_BASE}/auth/google?rolId=${role}`;
  };

  return (
    <div className="flex-1 bg-card-bg flex flex-col justify-center px-5 py-6 sm:px-10 sm:py-10 overflow-y-auto">
      <BackButton onBack={onBack} />

      {/* Logo móvil */}
      <div className="flex md:hidden items-center gap-2 mb-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center gap-2.5">
            <img
                src="https://res.cloudinary.com/dhhlvuzqa/image/upload/v1777184416/ecovida_perfiles/dns8fzkguprwuca0ydgv.webp"
                alt="Consumo Sostenible"
                className="w-8 h-8 rounded-lg object-contain shrink-0"
              />
            <span className="text-heading text-sm font-semibold tracking-wide">
              EcoVida
            </span>
          </div>
        </Link>
      </div>

      <div className="mb-4 sm:mb-6">
        <h1 className="text-heading text-2xl sm:text-4xl font-serif">Crea tu cuenta</h1>
        <p className="text-muted text-sm mt-1">Completa los datos para registrarte</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">

        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-body">Nombre de usuario</label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-dark transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Ej. Usuario123"
              className={inputClass(errors.nombre)}
              {...register('nombre', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
            />
          </div>
          {errors.nombre && (
            <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
              <span>&#9888;</span> {errors.nombre.message}
            </p>
          )}
        </div>

        {/* Género */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-body">Género</label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-focus-within:text-primary-dark transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="8" r="4" />
                <path d="M11 12v8M8 17h6M17 4l2-2m0 0l2-2m-2 2l2 2m-2-2l-2-2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <select
              className={`${inputClass(errors.id_genero)} pr-10 appearance-none cursor-pointer`}
              {...register('id_genero', { required: 'Selecciona un género' })}
            >
              <option value="">Selecciona tu género</option>
              {generos.map((g) => (
                <option key={g.id_genero} value={g.id_genero}>{g.nombre}</option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          {errors.id_genero && (
            <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
              <span>&#9888;</span> {errors.id_genero.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-body">Correo electrónico</label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-dark transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 8l10 6 10-6" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="email"
              autoComplete="off"
              placeholder="tu@correo.com"
              className={inputClass(errors.email)}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ingresa un correo válido' },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
              <span>&#9888;</span> {errors.email.message}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-body">Contraseña</label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-dark transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 118 0v4" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="password"
              autoComplete="off"
              placeholder="Mínimo 8 caracteres"
              className={inputClass(errors.password)}
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[0-9])/,
                  message: 'Debe incluir al menos una mayúscula y un número',
                },
              })}
            />
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
              <span>&#9888;</span> {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" icon={Leaf}>
          Crear mi cuenta
        </Button>

        {/* Separador */}
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-edge" />
          <span className="text-xs text-muted font-medium">o continúa con</span>
          <span className="flex-1 h-px bg-edge" />
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-edge bg-card-bg hover:bg-app-bg hover:border-primary-light text-sm font-medium text-body transition-all shadow-warm-sm hover:shadow-warm active:scale-[0.98]"
        >
          <GoogleIcon />
          Registrarse con Google
        </button>

        <p className="text-center text-sm text-muted pt-1">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-primary-dark hover:text-primary-darkest font-medium underline underline-offset-2 transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
