import { Check, Leaf, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getTags } from '../../../services/types/tags.service';
import { getTiposNegocio } from '../../../services/types/tiposNegocio.service';
import BackButton from '../../backButton';
import Button from '../../button';

const inputClass = (error) =>
  `w-full pl-10 pr-4 py-3 rounded-xl border text-stone-700 placeholder-stone-300 text-sm
    focus:outline-none focus:ring-2 transition-all shadow-sm bg-white
    ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-stone-200 focus:ring-emerald-300 focus:border-emerald-400 hover:border-stone-300'}`;

export default function BusinessForm({ onNext, onBack }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [tipos, setTipos] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (id) => {
    setSelectedTags((prev) => {
      const updated = prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id];

      setValue('tags', updated);
      return updated;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tiposData = await getTiposNegocio();
        const tagsData = await getTags();
        setTipos(Array.isArray(tiposData) ? tiposData : []);
        setTags(Array.isArray(tagsData) ? tagsData : []);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <div className="flex-1 bg-white/80 backdrop-blur-xl flex flex-col justify-center px-10 py-10 ">
      <div className="overflow-y-auto ">
        <BackButton onBack={onBack} />
        <div className="mb-6 pt-2">
          <h1 className="text-stone-800 text-2xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
            Registra tu negocio
          </h1>
          <p className="text-stone-400 text-sm mt-1">Completa la información de tu negocio</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full max-w-sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">Nombre del negocio</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a4 4 0 018 0v2" strokeLinecap="round" />
                </svg>
              </span>
              <input placeholder="Ej. EcoMarket" className={inputClass(errors.businessName)} {...register('businessName', { required: 'Este campo es obligatorio' })} />
            </div>
            {errors.businessName && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>⚠</span> {errors.businessName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">Descripción</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-4 text-stone-400 group-focus-within:text-emerald-500 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 6h16M4 10h16M4 14h10" strokeLinecap="round" />
                </svg>
              </span>
              <textarea rows={3} placeholder="Describe tu negocio y sus prácticas sostenibles" className={`${inputClass(errors.description)} pt-3 resize-none`} {...register('description', { required: 'Este campo es obligatorio' })} />
            </div>
            {errors.description && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>⚠</span> {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">Dirección</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" strokeLinecap="round" />
                  <circle cx="12" cy="8" r="2" />
                </svg>
              </span>
              <input placeholder="Calle 123 #45-67, Barrio Centro" className={inputClass(errors.address)} {...register('address', { required: 'Este campo es obligatorio' })} />
            </div>
            {errors.address && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>⚠</span> {errors.address.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">Contacto de negocio</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6.6 10.8a15.3 15.3 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.57.57 1 1 0 011 1V18a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1L6.6 10.8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input type="tel" placeholder="+57 300 123 4567" className={inputClass(errors.phone)} {...register('phone', { required: 'Este campo es obligatorio' })} />
            </div>
            {errors.phone && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>⚠</span> {errors.phone.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">Email del negocio</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 8l10 6 10-6" strokeLinecap="round" />
                </svg>
              </span>
              <input type="email" placeholder="contacto@negocio.com" className={inputClass(errors.emailBusiness)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">Tipo de negocio</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <select className={`${inputClass(errors.tipo_id)} pr-10 appearance-none cursor-pointer`} {...register('tipo_id', { required: 'Selecciona un tipo' })}>
                <option value="">Selecciona el tipo</option>
                {tipos?.map((tipo) => (
                  <option key={tipo.id_category} value={tipo.id_category}>
                    {tipo.category}
                  </option>
                ))}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            {errors.tipo_id && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>⚠</span> {errors.tipo_id.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-stone-600">Productos sostenibles</label>

            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => {
                const isSelected = selectedTags.includes(tag.id_tags);

                return (
                  <button
                    type="button"
                    key={tag.id_tags}
                    onClick={() => toggleTag(tag.id_tags)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all
                                    flex items-center gap-1
                                    ${isSelected ? 'bg-emerald-500 text-white border-emerald-500 shadow scale-105' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:scale-105'}
                                `}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {tag.tag}
                  </button>
                );
              })}
            </div>

            <input type="hidden" {...register('tags', { required: 'Selecciona al menos uno' })} />

            <p className="text-stone-400 text-xs">{selectedTags.length} seleccionados</p>

            {errors.tags && <p className="text-red-400 text-xs flex items-center gap-1">⚠ {errors.tags.message}</p>}
          </div>

          <div className="flex items-center gap-2 px-20 py-2">
            <Button type="submit" icon={Leaf}>
              Registrar negocio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
