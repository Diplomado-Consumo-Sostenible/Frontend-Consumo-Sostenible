import { Sparkles } from 'lucide-react';
import LandingBusinessCard from '../business/LandingBusinessCard';

export default function TrendSection({
  businesses = [],
  followedIds = new Set(),
  onToggleFavorite,
  onViewDetail,
}) {
  if (businesses.length === 0) return null;

  return (
    <section className="bg-app-bg py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-heading tracking-tight">Tendencia esta semana</h2>
          <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-softest text-primary-dark text-xs font-medium border border-edge">
            {businesses.length}
          </span>
        </div>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-none">
            {businesses.map((biz) => (
              <div key={biz.id_business} className="snap-start shrink-0 w-72 flex flex-col">
                <LandingBusinessCard
                  business={biz}
                  variant="featured"
                  isFavorite={followedIds.has(biz.id_business)}
                  onToggleFavorite={onToggleFavorite}
                  onViewDetail={onViewDetail}
                />
              </div>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-app-bg to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
