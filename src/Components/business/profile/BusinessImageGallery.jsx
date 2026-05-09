import MultiImageDropzone from '../../ui/MultiImageDropzone';

export function GalleryDisplay({ images }) {
  if (!images?.length) {
    return <p className="text-sm text-muted">Sin imágenes registradas.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {images.map((src, i) => (
        <div key={src + i} className="aspect-square rounded-xl overflow-hidden bg-primary-softest">
          <img
            src={src}
            alt={`Imagen ${i + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}

export function GalleryForm({ values, onChange }) {
  function addImage(url) {
    onChange({ ...values, images: [...(values.images ?? []), url] });
  }

  function removeImage(idx) {
    onChange({ ...values, images: (values.images ?? []).filter((_, i) => i !== idx) });
  }

  return (
    <MultiImageDropzone
      images={values.images ?? []}
      onAdd={addImage}
      onRemove={removeImage}
    />
  );
}
