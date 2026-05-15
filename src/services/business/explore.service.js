import API from '../../api/api';

/**
 * Servicio público de negocios para la exploración del usuario consumidor.
 *
 * Parámetros aceptados por el backend:
 *   - id_category   : number → filtra por id de categoría
 *   - id_tag        : number → filtra por id de tag
 *   - search        : string → filtra por nombre de negocio
 *   - sortBy        : 'recent' | 'rated' | 'reviews' → ordenamiento en BD
 *   - sortDirection : 'ASC' | 'DESC'
 *   - page          : number → paginación
 *   - limit         : number → paginación
 */
export const getPublicBusinesses = async (filters = {}) => {
  try {
    const params = {};
    if (filters.id_category)   params.id_category   = filters.id_category;
    if (filters.id_tag)        params.id_tag        = filters.id_tag;
    if (filters.search)        params.search        = filters.search;
    if (filters.sortBy)        params.sortBy        = filters.sortBy;
    if (filters.sortDirection) params.sortDirection = filters.sortDirection;
    if (filters.page)          params.page          = filters.page;
    params.limit = filters.limit ?? 50;

    const response = await API.get('/business', { params });
    const raw  = response.data;
    const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return list.filter((b) => b.status === 'Active' && b.isActive !== false);
  } catch (error) {
    // El backend lanza 404 cuando no hay resultados — lo tratamos como lista vacía
    if (error.response?.status === 404) return [];
    throw error.response?.data || { message: 'Error al obtener los negocios' };
  }
};

export const getTopBusinesses = async () => {
  try {
    const response = await API.get('/business/top');
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error.response?.data || { message: 'Error al obtener los negocios destacados' };
  }
};
