import { PackageOpen } from 'lucide-react';

export default function ProductPreviewCard({ product, delay = 0 }) {
  const name        = product.name        ?? 'Sin nombre';
  const description = product.description ?? null;
  const image       = product.image       ?? null;

  return (
    <div
      className="df-card flex flex-col rounded-2xl border border-edge bg-card-bg overflow-hidden h-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-40 shrink-0 bg-primary-softest flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            draggable={false}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ display: image ? 'none' : 'flex' }}
        >
          <PackageOpen className="w-8 h-8 text-muted/40" />
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3 flex-1">
        <h4 className="text-sm font-semibold text-heading leading-tight line-clamp-1">
          {name}
        </h4>
        {description && (
          <p className="text-xs text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
