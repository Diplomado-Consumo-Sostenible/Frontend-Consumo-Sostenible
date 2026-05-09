import { Store } from 'lucide-react';
import { useCallback, useState } from 'react';
import { saveVisitedBusiness } from '../../utils/visitedBusinesses';
import BusinessDetailModal from '../ui/BusinessDetailModal';
import { ANIM_STYLES, BusinessCard, HorizontalCarousel } from './BusinessCarousel';

function LoadingSkeleton() {
  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-44 bg-edge rounded-full" />
        <div className="h-4 w-20 bg-edge rounded-full" />
      </div>
      <div className="flex gap-3">
        {[1, 2, 3].map((j) => (
          <div key={j} className="shrink-0 w-[80vw] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)] h-56 bg-edge rounded-2xl" />
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
        {[1, 2, 3, 4].map((j) => <div key={j} className="h-1.5 w-1.5 rounded-full bg-edge" />)}
      </div>
    </div>
  );
}

export default function DashFeatured({ businesses, loadingBusinesses, followedIds, onToggleFollow }) {
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const handleSelect = useCallback((business) => {
    saveVisitedBusiness(business);
    setSelectedBusiness(business);
  }, []);

  if (loadingBusinesses) return <LoadingSkeleton />;

  return (
    <>
      <style>{ANIM_STYLES}</style>
      <HorizontalCarousel
        items={businesses}
        title="Destacados cerca de ti"
        TitleIcon={Store}
        iconClassName="text-primary-mid"
        linkLabel="Ver todos →"
        emptyMsg="No hay negocios disponibles aún"
        autoplay
        autoplayDelay={4000}
        onSelect={handleSelect}
        renderItem={(business, i) => (
          <BusinessCard
            business={business}
            delay={i * 55}
            onSelect={handleSelect}
            isFavorite={followedIds?.has(business.id_business) ?? false}
            onToggleFavorite={onToggleFollow}
          />
        )}
      />
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}
    </>
  );
}
