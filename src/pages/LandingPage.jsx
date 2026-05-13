import { useState } from 'react';
import BusinessDetailModal from '../Components/ui/BusinessDetailModal';
import CTABanner from '../Components/landing/CTABanner';
import FeaturedSection from '../Components/landing/FeaturedSection';
import HeroSection from '../Components/landing/HeroSection';
import LandingFooter from '../Components/landing/LandingFooter';
import LandingNavbar from '../Components/landing/LandingNavbar';
import NearbySection from '../Components/landing/NearbySection';
import { useToastContext } from '../context/ToastContext';
import { useFollows } from '../hooks/useFollows';
import usePublicBusinesses from '../hooks/usePublicBusinesses';
import useTopBusinesses from '../hooks/useTopBusinesses';

export default function LandingPage() {
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const {
    businesses: topBusinesses,
    loading: topLoading,
    error: topError,
    retry: retryTop,
  } = useTopBusinesses();

  const {
    businesses: nearbyBusinesses,
    loading: nearbyLoading,
    error: nearbyError,
    retry: retryNearby,
  } = usePublicBusinesses({ limit: 3 });

  const {
    businesses: allBusinesses,
  } = usePublicBusinesses({});

  const { followedIds, toggleFollow } = useFollows();
  const { error: showError } = useToastContext();

  const handleToggleFavorite = (id) => {
    toggleFollow(id, { onError: showError });
  };

  const totalBusinesses = allBusinesses.length;

  return (
    <div className="min-h-screen bg-app-bg">
      <LandingNavbar />

      <main>
        <HeroSection totalBusinesses={totalBusinesses} />

        <FeaturedSection
          businesses={topBusinesses.slice(0, 3)}
          loading={topLoading}
          error={topError}
          onRetry={retryTop}
          followedIds={followedIds}
          onToggleFavorite={handleToggleFavorite}
          onViewDetail={setSelectedBusiness}
        />

        <NearbySection
          businesses={nearbyBusinesses}
          loading={nearbyLoading}
          error={nearbyError}
          onRetry={retryNearby}
          followedIds={followedIds}
          onToggleFavorite={handleToggleFavorite}
          onViewDetail={setSelectedBusiness}
        />

        <CTABanner />
      </main>

      <LandingFooter />

      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}
    </div>
  );
}
