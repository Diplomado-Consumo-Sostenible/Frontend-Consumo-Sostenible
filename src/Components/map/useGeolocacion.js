import { useEffect, useState } from 'react';

export function useGeolocacion() {
  const [pos, setPos] = useState(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPos({ lat: coords.latitude, lng: coords.longitude }),
      () => setDenied(true),
      { timeout: 8000 }
    );
  }, []);

  return { pos, denied };
}
