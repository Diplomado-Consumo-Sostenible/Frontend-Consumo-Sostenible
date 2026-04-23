export const saveToken = (token) => {
  localStorage.setItem("access_token", token);
};

export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
};

export const saveSession = (session) => {
  localStorage.setItem("user_session", JSON.stringify(session));
};

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem("user_session"));
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_session");
};
