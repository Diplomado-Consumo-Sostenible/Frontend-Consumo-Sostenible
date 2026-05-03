import { Clock } from 'lucide-react';
import { forwardRef, useCallback, useState } from 'react';
import useVisitedBusinesses from '../../hooks/useVisitedBusinesses';
import { saveVisitedBusiness } from '../../utils/visitedBusinesses';
import BusinessDetailModal from '../ui/BusinessDetailModal';
import { ANIM_STYLES, HorizontalCarousel } from './BusinessCarousel';

const DashRecentlyViewed = forwardRef(function DashRecentlyViewed(
  { businesses = [] },
  ref,
) {
  const { visited } = useVisitedBusinesses();
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const handleSelect = useCallback((business) => {
    saveVisitedBusiness(business);
    setSelectedBusiness(business);
  }, []);

  const bizMap = new Map(businesses.map((b) => [b.id_business ?? b.id, b]));
  const items  = visited.map((v) => bizMap.get(v.id)).filter(Boolean);

  if (items.length === 0) return null;

  const badge = (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-softest text-primary-dark">
      {items.length}
    </span>
  );

  return (
    <>
      <style>{ANIM_STYLES}</style>
      <div ref={ref}>
        <HorizontalCarousel
          items={items}
          title="Vistos recientemente"
          TitleIcon={Clock}
          titleBadge={badge}
          iconClassName="text-primary-mid"
          linkTo="/dashboard/explorar"
          linkLabel="Explorar →"
          emptyMsg="Aún no has visitado ningún negocio"
          autoplay={false}
          onSelect={handleSelect}
        />
      </div>
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}
    </>
  );
});

export default DashRecentlyViewed;
