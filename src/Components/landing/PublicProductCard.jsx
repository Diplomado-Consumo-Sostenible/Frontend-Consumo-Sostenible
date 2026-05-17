import { ImageOff, Tag } from 'lucide-react';

export default function PublicProductCard({ product }) {
  const price = product.price != null
    ? Number(product.price).toLocaleString('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0,
      })
    : null;

  return (
    <div className="bg-card-bg border border-edge rounded-2xl overflow-hidden hover:border-primary-light hover:shadow-sm transition-all flex flex-col">
      <div className="h-40 bg-primary-softest flex items-center justify-center shrink-0 overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ImageOff className="w-8 h-8 text-muted/40" />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-heading leading-tight line-clamp-2">
            {product.name}
          </h3>
          {product.isAvailable === false && (
            <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-edge text-muted border border-edge">
              No disponible
            </span>
          )}
        </div>
        {product.description && (
          <p className="text-xs text-muted leading-relaxed line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          {product.category && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Tag className="w-3 h-3" />{product.category}
            </span>
          )}
          {price && <span className="text-sm font-bold text-primary-dark">{price}</span>}
        </div>
      </div>
    </div>
  );
}
