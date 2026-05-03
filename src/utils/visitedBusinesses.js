const KEY = 'cs_visited_businesses';
const MAX = 10;

export function saveVisitedBusiness(business) {
  try {
    const id       = business.id_business ?? business.id;
    const name     = business.businessName ?? business.nombre ?? 'Sin nombre';
    const category = business.category?.category ?? business.tipo_negocio ?? null;

    let list = getVisitedBusinesses();
    list = list.filter((b) => b.id !== id);
    list.unshift({ id, name, category, timestamp: Date.now() });
    list = list.slice(0, MAX);

    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('visitedBusinessesUpdated'));
  } catch {}
}

export function getVisitedBusinesses() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.sort((a, b) => b.timestamp - a.timestamp) : [];
  } catch {
    return [];
  }
}
