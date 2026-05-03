import API from '../../api/api';

/**
 * Servicio público de negocios para la exploración del usuario consumidor.
 *
 * Parámetros aceptados por el backend:
 *   - id_category : number → filtra por id de categoría
 *   - id_tag      : number → filtra por id de tag
 *   - page        : number → paginación
 *   - limit       : number → paginación
 *
 * Nota: el backend usa forbidNonWhitelisted — enviar cualquier otro
 * parámetro (categoryId, search, etc.) provoca un 400. El filtro de
 * texto se aplica en cliente sobre los resultados recibidos.
 */
export const getPublicBusinesses = async (filters = {}) => {
  try {
    const params = {};
    if (filters.id_category) params.id_category = filters.id_category;
    if (filters.id_tag)      params.id_tag      = filters.id_tag;
    if (filters.page)        params.page        = filters.page;
    if (filters.limit)       params.limit       = filters.limit;

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
