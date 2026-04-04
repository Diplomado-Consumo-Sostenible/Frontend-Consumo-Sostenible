
export const registerModel = (data) => {
  return {
    email: data.email,
    password: data.password,
    rolId: 2,
    nombre: data.nombre,
    id_genero: Number(data.id_genero),
  };
};

export const loginModel = (data) => {
  return {
    email: data.email,
    password: data.password,
  };
};

export const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const saveToken = (token) => {
  localStorage.setItem("access_token", token);
};

export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
};
