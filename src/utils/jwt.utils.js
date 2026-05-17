export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/** Devuelve true si el token no existe o ya expiró */
export const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  // exp viene en segundos, Date.now() en milisegundos
  return decoded.exp * 1000 < Date.now();
};