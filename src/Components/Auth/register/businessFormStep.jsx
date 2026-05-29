import { Check, FileText, Leaf, Loader2, MapPin, Plus, UploadCloud, X } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import useUbicacion from '../../../hooks/useUbicacion';
import { getTags } from '../../../services/types/tags.service';
import { getTiposNegocio } from '../../../services/types/tiposNegocio.service';
import { uploadDocument } from '../../../services/upload/upload.service';
import BackButton from '../../backButton';
import Button from '../../button';

const inputClass = (error) =>
  `w-full pl-10 pr-4 py-3 rounded-xl border text-body placeholder-muted text-sm
    focus:outline-none focus:ring-2 transition-all bg-card-bg
    ${error
      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
      : 'border-edge focus:ring-primary-mid/30 focus:border-primary-mid hover:border-primary-light'}`;

export default function BusinessForm({ onNext, onBack }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const { departamentos, municipios, loadMunicipios, loadingDeps, loadingMunis } = useUbicacion();
  const watchedDepId = watch('id_departamento');

  useEffect(() => {
    loadMunicipios(watchedDepId ? Number(watchedDepId) : null);
    if (watchedDepId) setValue('id_municipio', '');
  }, [watchedDepId, setValue, loadMunicipios]);

  const [tipos, setTipos]               = useState([]);
  const [tags, setTags]                 = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [camaraFile, setCamaraFile]       = useState(null);
  const [dragActive, setDragActive]       = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError]     = useState(null);
  const fileInputRef                      = useRef(null);

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
        const tagsData  = await getTags();
        setTipos(Array.isArray(tiposData) ? tiposData : []);
        setTags(Array.isArray(tagsData)   ? tagsData  : []);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    fetchData();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const applyFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return;
    setCamaraFile(file);
    setValue('camaraComercio', file, { shouldValidate: true });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  const handleFileInput = (e) => applyFile(e.target.files?.[0]);

  const removeFile = () => {
    setCamaraFile(null);
    setValue('camaraComercio', null, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data) => {
    if (!camaraFile) return;
    setUploadError(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadDocument(camaraFile, {
        onProgress: setUploadProgress,
      });
      onNext({ ...data, legal_document_url: result.url });
    } catch (err) {
      setUploadError(err?.message || 'No se pudo subir el documento. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex-1 bg-card-bg flex flex-col justify-center px-10 py-10">
      <div className="overflow-y-auto">
        <BackButton onBack={onBack} />

        <div className="mb-6">
          <h1 className="text-heading text-4xl font-serif">Registra tu negocio</h1>
          <p className="text-muted text-sm mt-1">Completa la información de tu negocio</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full max-w-sm">

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Nombre del negocio</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-dark transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a4 4 0 018 0v2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                placeholder="Ej. EcoMarket"
                className={inputClass(errors.businessName)}
                {...register('businessName', { required: 'Este campo es obligatorio' })}
              />
            </div>
            {errors.businessName && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>&#9888;</span> {errors.businessName.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Descripción</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-4 text-muted group-focus-within:text-primary-dark transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 6h16M4 10h16M4 14h10" strokeLinecap="round" />
                </svg>
              </span>
              <textarea
                rows={3}
                placeholder="Describe tu negocio y sus prácticas sostenibles"
                className={`${inputClass(errors.description)} pt-3 resize-none`}
                {...register('description', { required: 'Este campo es obligatorio' })}
              />
            </div>
            {errors.description && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>&#9888;</span> {errors.description.message}
              </p>
            )}
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Dirección</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-dark transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" strokeLinecap="round" />
                  <circle cx="12" cy="8" r="2" />
                </svg>
              </span>
              <input
                placeholder="Calle 123 #45-67, Barrio Centro"
                className={inputClass(errors.address)}
                {...register('address', { required: 'Este campo es obligatorio' })}
              />
            </div>
            {errors.address && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>&#9888;</span> {errors.address.message}
              </p>
            )}
          </div>

          {/* Departamento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Departamento</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-focus-within:text-primary-dark transition-colors">
                <MapPin className="w-4 h-4" />
              </span>
              <select
                disabled={loadingDeps}
                className={`${inputClass(errors.id_departamento)} pr-10 appearance-none cursor-pointer`}
                {...register('id_departamento', { required: 'Selecciona un departamento' })}
              >
                <option value="">
                  {loadingDeps ? 'Cargando departamentos…' : 'Selecciona un departamento'}
                </option>
                {departamentos.map((d) => (
                  <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
                ))}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            {errors.id_departamento && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>&#9888;</span> {errors.id_departamento.message}
              </p>
            )}
          </div>

          {/* Municipio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Municipio</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-focus-within:text-primary-dark transition-colors">
                <MapPin className="w-4 h-4" />
              </span>
              <select
                disabled={!watchedDepId || loadingMunis}
                className={`${inputClass(errors.id_municipio)} pr-10 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                {...register('id_municipio', { required: 'Selecciona un municipio' })}
              >
                <option value="">
                  {!watchedDepId
                    ? 'Primero selecciona un departamento'
                    : loadingMunis
                      ? 'Cargando municipios…'
                      : 'Selecciona un municipio'}
                </option>
                {municipios.map((m) => (
                  <option key={m.id_municipio} value={m.id_municipio}>{m.nombre}</option>
                ))}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            {errors.id_municipio && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>&#9888;</span> {errors.id_municipio.message}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Contacto de negocio</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-dark transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6.6 10.8a15.3 15.3 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.57.57 1 1 0 011 1V18a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1L6.6 10.8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input
                type="tel"
                placeholder="+57 300 123 4567"
                className={inputClass(errors.phone)}
                {...register('phone', { required: 'Este campo es obligatorio' })}
              />
            </div>
            {errors.phone && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>&#9888;</span> {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email negocio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Email de contacto</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-dark transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 8l10 6 10-6" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="contacto@negocio.com"
                className={inputClass(errors.emailBusiness)}
              />
            </div>
          </div>

          {/* Tipo de negocio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Tipo de negocio</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-focus-within:text-primary-dark transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <select
                className={`${inputClass(errors.tipo_id)} pr-10 appearance-none cursor-pointer`}
                {...register('tipo_id', { required: 'Selecciona un tipo' })}
              >
                <option value="">Selecciona el tipo</option>
                {tipos?.map((t) => (
                  <option key={t.id_category} value={t.id_category}>{t.category}</option>
                ))}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            {errors.tipo_id && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>&#9888;</span> {errors.tipo_id.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-body">Productos sostenibles</label>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => {
                const isSelected = selectedTags.includes(tag.id_tags);
                return (
                  <button
                    type="button"
                    key={tag.id_tags}
                    onClick={() => toggleTag(tag.id_tags)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all flex items-center gap-1
                      ${isSelected
                        ? 'bg-primary-dark text-on-dark-active border-primary-dark shadow-warm-sm scale-105'
                        : 'bg-card-bg text-body border-edge hover:border-primary-light hover:scale-105'
                      }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {tag.tag}
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register('tags', { required: 'Selecciona al menos uno' })} />
            <p className="text-muted text-xs">{selectedTags.length} seleccionados</p>
            {errors.tags && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <span>&#9888;</span> {errors.tags.message}
              </p>
            )}
          </div>

          {/* Cámara de comercio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">
              Documento Cámara de Comercio
              <span className="ml-1 text-red-400">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileInput}
            />
            <input
              type="hidden"
              {...register('camaraComercio', { required: 'El documento de Cámara de Comercio es obligatorio' })}
            />

            {camaraFile ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-edge bg-card-bg">
                  <FileText className="w-8 h-8 shrink-0 text-primary-dark" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-body truncate">{camaraFile.name}</p>
                    <p className="text-xs text-muted">{(camaraFile.size / 1024).toFixed(1)} KB · PDF</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={uploading}
                    className="shrink-0 p-1 rounded-full hover:bg-red-50 text-muted hover:text-red-400 transition-colors disabled:opacity-40"
                    aria-label="Eliminar archivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {uploading && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Subiendo documento…
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-edge overflow-hidden">
                      <div
                        className="h-full bg-primary-dark rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all
                  ${errors.camaraComercio
                    ? 'border-red-300 bg-red-50/40'
                    : dragActive
                      ? 'border-primary-dark bg-primary-dark/5 scale-[1.01]'
                      : 'border-edge bg-card-bg hover:border-primary-light hover:bg-primary-dark/5'
                  }`}
              >
                <UploadCloud className={`w-8 h-8 transition-colors ${dragActive ? 'text-primary-dark' : 'text-muted'}`} />
                <p className="text-sm font-medium text-body text-center">
                  {dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu documento aquí'}
                </p>
                <p className="text-xs text-muted text-center">o haz clic para seleccionar · Solo archivos PDF</p>
              </div>
            )}

            {errors.camaraComercio && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>&#9888;</span> {errors.camaraComercio.message}
              </p>
            )}
            {uploadError && (
              <p className="text-red-400 text-xs flex items-center gap-1 pl-1">
                <span>&#9888;</span> {uploadError}
              </p>
            )}
          </div>

          <Button type="submit" icon={Leaf} loading={uploading}>
            Registrar negocio
          </Button>
        </form>
      </div>
    </div>
  );
}
