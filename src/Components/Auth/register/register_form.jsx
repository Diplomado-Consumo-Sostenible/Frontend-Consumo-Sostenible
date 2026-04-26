import { Leaf } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getGeneros } from '../../../services/user/genero.service';
import BackButton from '../../backButton';
import Button from '../../button';

const inputClass = (error) =>
  `w-full pl-10 pr-4 py-3 rounded-xl border text-stone-700 placeholder-stone-300 text-sm
    focus:outline-none focus:ring-2 transition-all shadow-sm bg-white
    ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-stone-200 focus:ring-emerald-300 focus:border-emerald-400 hover:border-stone-300'}`;

export default function RegisterForm({ onNext, onBack, defaultValues }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
  });

  const [generos, setGeneros] = useState([]);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
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
  const onSubmit = async (data) => {
    onNext(data);
  };

  return (
    <div className="flex-1 bg-white/80 backdrop-blur-xl flex flex-col justify-center px-10 py-10">
      <BackButton onBack={onBack} />
      <div className="flex md:hidden items-center gap-2 mb-4">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-emerald-500" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22C6.5 22 2 17.5 2 12C2 7 5.5 3.5 10 2C10 2 8 8 12 12C16 16 22 14 22 14C22 18.5 17.5 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-emerald-600 font-semibold text-sm tracking-widest uppercase">EcoVida</span>
      </div>

      <div className="mb-6">
        <h1 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
          Crea tu cuenta
        </h1>
        <p className="text-stone-400 text-sm mt-1">Completa los datos para registrarte</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-600">Nombre de usuario</label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors">
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
              <span>⚠</span> {errors.nombre.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-600">Género</label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none group-focus-within:text-emerald-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="8" r="4" />
                <path d="M11 12v8M8 17h6M17 4l2-2m0 0l2-2m-2 2l2 2m-2-2l-2-2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <select className={`${inputClass(errors.id_genero)} pr-10 appearance-none cursor-pointer`} {...register('id_genero', { required: 'Selecciona un género' })}>
              <option value="">Selecciona tu género</option>

              {generos.map((genero) => (
                <option key={genero.id_genero} value={genero.id_genero}>
                  {genero.nombre}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          {errors.id_genero && (
            <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
              <span>⚠</span> {errors.id_genero.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-600">Correo electrónico</label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors">
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
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Ingresa un correo válido',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
              <span>⚠</span> {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-600">Contraseña</label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors">
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
              <span>⚠</span> {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 px-6 py-2">
          <Button type="submit" icon={Leaf}>
            Crear mi cuenta
          </Button>
        </div>

        <p className="text-center text-sm text-stone-400 pt-1">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
