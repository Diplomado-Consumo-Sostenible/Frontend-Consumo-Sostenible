import { Compass, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useUbicacion from '../../../hooks/useUbicacion';
import { getMunicipioById } from '../../../services/types/ubicacion.service';
import SingleLocationMap from '../../map/SingleLocationMap';

const inputCls =
  'w-full px-3.5 py-2.5 border border-edge rounded-xl text-sm text-body bg-card-bg outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-colors';

const selectCls = `${inputCls} appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;

/* =========================================================
   DISPLAY MUNICIPIO
========================================================= */

export function MunicipioDisplay({
  municipio,
  municipioId,
  departamentoId,
}) {
  const { departamentos, municipios, loadMunicipios } = useUbicacion();

  const [fetched, setFetched] = useState(null);

  // ======================================================
  // Cargar municipio por ID
  // ======================================================

  useEffect(() => {
    if (municipio || !municipioId) return;

    let active = true;

    async function load() {
      try {
        const data = await getMunicipioById(municipioId);

        if (active) {
          setFetched(data);
        }
      } catch (error) {
        console.error('Error cargando municipio:', error);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [municipio, municipioId]);

  // ======================================================
  // Cargar municipios si hay departamento
  // ======================================================

  useEffect(() => {
    if (departamentoId) {
      loadMunicipios(departamentoId);
    }
  }, [departamentoId, loadMunicipios]);

  // ======================================================
  // Resolver datos
  // ======================================================

  const resolved =
    municipio ??
    (fetched?.id_municipio === municipioId ? fetched : null);

  const depName =
    resolved?.departamento?.nombre ??
    departamentos.find(
      (d) => d.id_departamento === departamentoId
    )?.nombre;

  const muniName =
    resolved?.nombre ??
    municipios.find(
      (m) => m.id_municipio === municipioId
    )?.nombre;

  if (!muniName && !municipioId) {
    return (
      <p className="text-sm text-muted italic">
        Sin municipio registrado.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-body">
      <MapPin className="w-3.5 h-3.5 text-primary-mid shrink-0" />

      <span>
        {depName && (
          <span className="text-muted">
            {depName} ·{' '}
          </span>
        )}

        <span className="font-medium">
          {muniName ?? '...'}
        </span>
      </span>
    </div>
  );
}

/* =========================================================
   FORM MUNICIPIO
========================================================= */

export function MunicipioForm({ values, onChange }) {
  const {
    departamentos,
    municipios,
    loadMunicipios,
    loadingDeps,
    loadingMunis,
  } = useUbicacion();

  // ======================================================
  // Evitar limpiar municipio en el primer render
  // ======================================================

  const initialLoad = useRef(true);

  // ======================================================
  // Cargar municipios SOLO si existe departamento
  // ======================================================

  useEffect(() => {
    if (!values.departamentoId) return;

    loadMunicipios(values.departamentoId);
  }, [values.departamentoId, loadMunicipios]);

  // ======================================================
  // Cambio departamento
  // ======================================================

  function handleDepChange(e) {
    const newDepId = e.target.value
      ? Number(e.target.value)
      : null;

    // ============================================
    // Primer render -> no limpiar municipio
    // ============================================

    if (initialLoad.current) {
      initialLoad.current = false;

      onChange({
        ...values,
        departamentoId: newDepId,
      });

      return;
    }

    // ============================================
    // Limpiar municipio SOLO si cambia el dep
    // ============================================

    const depChanged =
      newDepId !== values.departamentoId;

    onChange({
      ...values,
      departamentoId: newDepId,
      municipioId: depChanged
        ? null
        : values.municipioId,
    });
  }

  // ======================================================
  // Cambio municipio
  // ======================================================

  function handleMuniChange(e) {
    const muniId = e.target.value
      ? Number(e.target.value)
      : null;

    onChange({
      ...values,
      municipioId: muniId,
    });
  }

  return (
    <div className="space-y-3">
      {/* ==========================================
          DEPARTAMENTO
      ========================================== */}

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Departamento
        </label>

        <select
          value={values.departamentoId ?? ''}
          onChange={handleDepChange}
          disabled={loadingDeps}
          className={selectCls}
        >
          <option value="">
            {loadingDeps
              ? 'Cargando...'
              : 'Selecciona un departamento'}
          </option>

          {departamentos.map((d) => (
            <option
              key={d.id_departamento}
              value={d.id_departamento}
            >
              {d.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* ==========================================
          MUNICIPIO
      ========================================== */}

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Municipio
        </label>

        <select
          value={values.municipioId ?? ''}
          onChange={handleMuniChange}
          disabled={
            !values.departamentoId || loadingMunis
          }
          className={selectCls}
        >
          <option value="">
            {!values.departamentoId
              ? 'Primero selecciona un departamento'
              : loadingMunis
                ? 'Cargando municipios...'
                : 'Selecciona un municipio'}
          </option>

          {municipios.map((m) => (
            <option
              key={m.id_municipio}
              value={m.id_municipio}
            >
              {m.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* =========================================================
   DISPLAY LOCATION
========================================================= */

export function LocationDisplay({
  latitude,
  longitude,
}) {
  if (!latitude && !longitude) {
    return (
      <p className="text-sm text-muted">
        Sin coordenadas registradas.
      </p>
    );
  }

  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      <SingleLocationMap
        latitude={latitude}
        longitude={longitude}
      />

      <div className="flex items-center justify-between text-xs text-muted px-1">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary-mid" />

          Lat: {Number(latitude).toFixed(6)} | Lon:{' '}
          {Number(longitude).toFixed(6)}
        </span>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary-mid hover:text-primary-dark transition-colors"
        >
          Ver en Maps →
        </a>
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-edge text-sm text-body hover:border-primary-mid hover:text-primary-dark transition-colors"
      >
        <Compass className="w-4 h-4" />
        Cómo llegar
      </a>
    </div>
  );
}

/* =========================================================
   FORM LOCATION
========================================================= */

export function LocationForm({
  values,
  onChange,
}) {
  function set(key, raw) {
    const parsed = parseFloat(raw);

    onChange({
      ...values,
      [key]: isNaN(parsed) ? '' : parsed,
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Latitud
        </label>

        <input
          type="number"
          step="any"
          value={values.latitude ?? ''}
          onChange={(e) =>
            set('latitude', e.target.value)
          }
          placeholder="Ej: 4.710989"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Longitud
        </label>

        <input
          type="number"
          step="any"
          value={values.longitude ?? ''}
          onChange={(e) =>
            set('longitude', e.target.value)
          }
          placeholder="Ej: -74.072090"
          className={inputCls}
        />
      </div>

      <p className="text-xs text-muted">
        Puedes obtener las coordenadas desde{' '}
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-mid hover:underline"
        >
          Google Maps
        </a>{' '}
        haciendo clic derecho sobre tu ubicación.
      </p>
    </div>
  );
}