import { ImagePlus, Loader2, UploadCloud, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { uploadGeneralImage, validateImageFile } from '../../services/upload/upload.service';

let _uid = 0;
const nextId = () => ++_uid;

export default function MultiImageDropzone({ images = [], onAdd, onRemove }) {
  const [pending,    setPending]    = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const processFiles = useCallback(
    async (files) => {
      const valid = [];
      for (const file of files) {
        const err = validateImageFile(file);
        if (err) continue;
        valid.push({ id: nextId(), file, preview: URL.createObjectURL(file) });
      }
      if (!valid.length) return;

      setPending((prev) => [
        ...prev,
        ...valid.map(({ id, preview }) => ({ id, preview, progress: 0, error: null })),
      ]);

      await Promise.all(
        valid.map(async ({ id, file, preview }) => {
          try {
            const { url } = await uploadGeneralImage(file, {
              onProgress: (p) =>
                setPending((prev) =>
                  prev.map((item) => (item.id === id ? { ...item, progress: p } : item)),
                ),
            });
            URL.revokeObjectURL(preview);
            setPending((prev) => prev.filter((item) => item.id !== id));
            onAdd(url);
          } catch (err) {
            URL.revokeObjectURL(preview);
            setPending((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, error: err?.message || 'Error al subir' } : item,
              ),
            );
          }
        }),
      );
    },
    [onAdd],
  );

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    processFiles(files);
  }

  function handleInputChange(e) {
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  function removePending(id) {
    setPending((prev) => prev.filter((item) => item.id !== id));
  }

  const hasItems = images.length > 0 || pending.length > 0;

  return (
    <div className="space-y-3">
      {hasItems && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((src, i) => (
            <div
              key={src + i}
              className="relative aspect-square rounded-xl overflow-hidden bg-primary-softest group"
            >
              <img src={src} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Eliminar imagen"
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {pending.map(({ id, preview, progress, error }) => (
            <div
              key={id}
              className="relative aspect-square rounded-xl overflow-hidden bg-primary-softest"
            >
              <img src={preview} alt="Subiendo…" className="w-full h-full object-cover" />
              {error ? (
                <div className="absolute inset-0 bg-red-900/65 flex flex-col items-center justify-center gap-1.5 p-2">
                  <span className="text-[11px] text-white text-center leading-snug">{error}</span>
                  <button
                    type="button"
                    onClick={() => removePending(id)}
                    className="text-[11px] text-white/80 hover:text-white underline"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span className="text-xs text-white font-medium tabular-nums">{progress}%</span>
                  <div className="w-3/4 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        className={[
          'w-full border-2 border-dashed rounded-xl py-7',
          'flex flex-col items-center justify-center gap-2 transition-colors select-none',
          isDragging
            ? 'border-green-400 bg-green-50/50'
            : 'border-edge hover:border-green-400 hover:bg-green-50/30',
        ].join(' ')}
      >
        {isDragging
          ? <UploadCloud className="w-6 h-6 text-green-500" />
          : <ImagePlus className="w-6 h-6 text-muted" />
        }
        <span className="text-sm text-muted">
          {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
        </span>
        <span className="text-xs text-muted/70">JPG, PNG, WEBP, GIF · máx. 5 MB por imagen</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
