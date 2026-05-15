import { Building2, Heart, Map, LayoutGrid, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Compact card inside the drawer */
function DrawerCard({ business, onRemove }) {
  const categoryLabel = business.category?.category ?? null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-edge bg-app-bg hover:border-primary-light transition-colors">
      {/* Logo */}
      <div className="w-11 h-11 rounded-xl bg-primary-softest shrink-0 overflow-hidden flex items-center justify-center">
        {business.logo ? (
          <img src={business.logo} alt={business.businessName} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-5 h-5 text-muted" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-heading leading-tight truncate">
          {business.businessName}
        </p>
        {categoryLabel && (
          <span className="text-[10px] text-muted">{categoryLabel}</span>
        )}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(business.id_business)}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-primary-softest transition-colors"
        aria-label="Quitar de favoritos"
      >
        <Heart className="w-4 h-4 fill-terracotta text-terracotta" />
      </button>
    </div>
  );
}

export default function FavoritesDrawer({
  isOpen,
  onClose,
  followedBusinesses = [],
  onRemoveFavorite,
}) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const canCompare = selected.size >= 2;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-heading/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 h-full z-50 w-80 sm:w-96 bg-card-bg border-l border-edge shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mis favoritos"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-terracotta text-terracotta" />
            <h2 className="font-serif text-lg text-heading">Mis favoritos</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-softest text-primary-dark border border-edge font-medium">
              {followedBusinesses.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-app-bg transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {followedBusinesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-softest flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted" />
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Aún no tienes negocios guardados.<br />
                Toca el corazón en cualquier tarjeta.
              </p>
            </div>
          ) : (
            followedBusinesses.map((biz) => (
              <div
                key={biz.id_business}
                className={`rounded-2xl border-2 transition-colors cursor-pointer ${
                  selected.has(biz.id_business) ? 'border-primary-mid' : 'border-transparent'
                }`}
                onClick={() => toggleSelect(biz.id_business)}
              >
                <DrawerCard
                  business={biz}
                  onRemove={(id) => {
                    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
                    onRemoveFavorite?.(id);
                  }}
                />
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {followedBusinesses.length > 0 && (
          <div className="px-4 py-4 border-t border-edge shrink-0 flex flex-col gap-2">
            {selected.size > 0 && (
              <p className="text-xs text-muted text-center">
                {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
                {!canCompare && ' — selecciona al menos 2 para comparar'}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canCompare}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  canCompare
                    ? 'bg-primary-dark text-on-dark-active hover:bg-primary-darkest'
                    : 'bg-edge text-muted cursor-not-allowed'
                }`}
                title={canCompare ? 'Comparar seleccionados' : 'Selecciona al menos 2 negocios'}
              >
                <LayoutGrid className="w-4 h-4" />
                Comparar
              </button>
              <button
                type="button"
                onClick={() => { onClose(); navigate('/dashboard/mapa'); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-edge text-sm font-medium text-body hover:bg-app-bg transition-colors"
              >
                <Map className="w-4 h-4" />
                Ver en mapa
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
