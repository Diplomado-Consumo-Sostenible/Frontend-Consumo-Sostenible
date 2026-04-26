import { useCallback, useEffect, useState } from 'react';
import { getFullUserProfile } from '../services/user/profile.unified.service';

export default function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFullUserProfile();
      setProfile(data);
    } catch (err) {
      setError(err?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, retry: fetchProfile };
}
