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
    return data.data ?? [];
  } catch {
    return [];
  }
};

export const fetchAllReviews = async (businessId) => {
  try {
    const { data } = await API.get(`/reviews/business/${businessId}`, {
      params: { page: 1, limit: 1000, order: 'ASC' },
    });
    return data.data ?? [];
  } catch {
    return [];
  }
};

// ── Lógica de agregación ─────────────────────────────────────────────────────
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Clave de fecha en hora local — evita el desfase UTC que causa buckets incorrectos
function localDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getPeriodCutoff(period) {
  const d = new Date();
  if (period === '7d') d.setDate(d.getDate() - 7);
  else if (period === '30d') d.setDate(d.getDate() - 30);
  else if (period === 'year') d.setFullYear(d.getFullYear() - 1);
  else d.setFullYear(2000);
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
  cur.setDate(cur.getDate() - (day === 0 ? 6 : day - 1)); // retroceder al lunes
  cur.setHours(0, 0, 0, 0);
  let n = 1;
  while (cur <= to) {
    buckets.push({
      key: localDateKey(cur),
      label: `Sem. ${n}`,
    });
    cur.setDate(cur.getDate() + 7);
    n++;
  }
  return buckets;
}

function generateMonthBuckets(from, to) {
  const buckets = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), 1);
  while (cur <= to) {
    buckets.push({
      key: `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`,
      label: MONTHS_ES[cur.getMonth()],
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return buckets;
}

export function aggregateChartData(items, dateField, period) {
  const now = new Date();
  const cutoff = getPeriodCutoff(period);
  const filtered = items.filter(item => new Date(item[dateField]) >= cutoff);

  let buckets;
  let getKey;

  if (period === '7d') {
    buckets = generateDayBuckets(cutoff, now);
    getKey = d => localDateKey(d);
  } else if (period === '30d') {
    buckets = generateWeekBuckets(cutoff, now);
    // weekly key = lunes de la semana del ítem
    getKey = d => {
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);
      return localDateKey(monday);
    };
  } else {
    buckets = generateMonthBuckets(cutoff, now);
    getKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  const counts = Object.fromEntries(buckets.map(b => [b.key, 0]));
  filtered.forEach(item => {
    const key = getKey(new Date(item[dateField]));
    if (key in counts) counts[key]++;
  });

  return buckets.map(b => ({ label: b.label, valor: counts[b.key] }));
}
