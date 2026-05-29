const AUTH_CHANGE_EVENT = 'app:auth-changed';

export const saveToken = (token) => {
  localStorage.setItem("access_token", token);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};
