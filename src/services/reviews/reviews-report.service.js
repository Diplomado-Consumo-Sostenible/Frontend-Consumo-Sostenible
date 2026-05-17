import API from '../../api/api';

/**
 * Reporta una reseña.
 * @param {number} reviewId  - ID de la reseña a reportar
 * @param {string} reason    - Uno de los valores del enum ReportReason del backend:
 *   'Lenguaje ofensivo o inapropiado' | 'Spam o publicidad' |
 *   'Reseña falsa o no es cliente'    | 'Otro'
 * @param {string} [details] - Descripción adicional opcional (máx. 255 chars)
 */
export const reportReview = async (reviewId, reason, details) => {
  const body = { reason, ...(details ? { details } : {}) };
  const { data } = await API.post(`/reviews/reports/${reviewId}`, body);
  return data;
};
