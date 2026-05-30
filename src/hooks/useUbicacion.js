import { useCallback, useEffect, useState } from 'react';
import { getDepartamentos, getMunicipiosByDepartamento } from '../services/types/ubicacion.service';

export default function useUbicacion() {
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios,    setMunicipios]    = useState([]);
  const [loadingDeps,   setLoadingDeps]   = useState(false);
  const [loadingMunis,  setLoadingMunis]  = useState(false);

  const fetchDepartamentos = useCallback(async () => {
    setLoadingDeps(true);
    try {
      const data = await getDepartamentos();
      setDepartamentos(data);
    } catch { /* no-op */ } finally {
      setLoadingDeps(false);
    }
  }, []);

  const loadMunicipios = useCallback(async (depId) => {
    if (!depId) { setMunicipios([]); return; }
    setLoadingMunis(true);
    try {
      const data = await getMunicipiosByDepartamento(depId);
      setMunicipios(data);
    } catch {
      setMunicipios([]);
    } finally {
      setLoadingMunis(false);
    }
  }, []);

  useEffect(() => { fetchDepartamentos(); }, [fetchDepartamentos]);

  return { departamentos, municipios, loadMunicipios, loadingDeps, loadingMunis };
}
