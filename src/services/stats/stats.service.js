import API from '../../api/api';

// ── Reseñas paginadas (sección de reseñas) ───────────────────────────────────
export const getBusinessReviews = async (businessId, { page = 1, limit = 10, rating, order = 'DESC' } = {}) => {
  const params = { page, limit, order };
  if (rating != null) params.rating = rating;
  try {
    const { data } = await API.get(`/reviews/business/${businessId}`, { params });
    return data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return {
        data: [],
        meta: { totalItems: 0, itemCount: 0, itemsPerPage: limit, totalPages: 0, currentPage: page },
      };
    }
    throw error;
  }
};

// ── Datos crudos para gráficas ────────────────────────────────────────────────

export const fetchAllFollowers = async () => {
  try {
    const { data } = await API.get('/follows/management/my-followers', {
      params: { page: 1, limit: 1000 },
    });
    return data?.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const fetchAllReviews = async (businessId) => {
  try {
    const { data } = await API.get(`/reviews/business/${businessId}`, {
      params: { page: 1, limit: 1000, order: 'ASC' },
    });
    return data?.data ?? [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

// ── Lógica de agregación ──────────────────────────────────────────────────────
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function localDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function getPeriodCutoff(period) {
  const d = new Date();
  if (period === '7d') {
    d.setDate(d.getDate() - 7);
  } else if (period === '30d') {
    d.setDate(d.getDate() - 30);
  } else if (period === 'year') {
    // Primer día del mes de hace 11 meses → exactamente 12 buckets mensuales
    d.setMonth(d.getMonth() - 11);
    d.setDate(1);
  } else {
    d.setFullYear(2000);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

function generateDayBuckets(from, to) {
  const buckets = [];
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  while (cur <= to) {
    buckets.push({
      key: localDateKey(cur),
      label: cur.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    });
    cur.setDate(cur.getDate() + 1);
  }
  return buckets;
}

function generateWeekBuckets(from, to) {
  const buckets = [];
  const cur = new Date(from);
  const day = cur.getDay();
  cur.setDate(cur.getDate() - (day === 0 ? 6 : day - 1));
  cur.setHours(0, 0, 0, 0);
  let n = 1;
  while (cur <= to) {
    buckets.push({ key: localDateKey(cur), label: `Sem. ${n}` });
    cur.setDate(cur.getDate() + 7);
    n++;
  }
  return buckets;
}

/**
 * Genera exactamente 12 buckets mensuales: desde hace 11 meses hasta el mes actual.
 * Incluye el año en la etiqueta del primer bucket y en enero para evitar
 * ambigüedad cuando el rango cruza dos años distintos.
 */
function generateLast12MonthBuckets() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d    = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const name = MONTHS_ES[d.getMonth()];
    // Mostrar año en el primer bucket y al inicio de cada nuevo año (enero)
    const label = (i === 0 || d.getMonth() === 0) ? `${name} ${yyyy}` : name;
    return { key: `${yyyy}-${mm}`, label };
  });
}

export function aggregateChartData(items, dateField, period) {
  const now    = new Date();
  const cutoff = getPeriodCutoff(period);

  const filtered = items.filter(item => {
    const d = safeDate(item[dateField]);
    return d !== null && d >= cutoff;
  });

  let buckets;
  let getKey;

  if (period === '7d') {
    buckets = generateDayBuckets(cutoff, now);
    getKey  = d => localDateKey(d);
  } else if (period === '30d') {
    buckets = generateWeekBuckets(cutoff, now);
    getKey  = d => {
      const dow    = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
      monday.setHours(0, 0, 0, 0);
      return localDateKey(monday);
    };
  } else {
    // 'year': exactamente 12 meses sin duplicar etiquetas
    buckets = generateLast12MonthBuckets();
    getKey  = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  const counts = Object.fromEntries(buckets.map(b => [b.key, 0]));
  filtered.forEach(item => {
    const d = safeDate(item[dateField]);
    if (!d) return;
    const key = getKey(d);
    if (key in counts) counts[key]++;
  });

  return buckets.map(b => ({ label: b.label, valor: counts[b.key] }));
}
