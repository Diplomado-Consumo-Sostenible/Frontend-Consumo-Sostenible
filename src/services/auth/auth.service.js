import API from "../api";

export const registerUser = async (userData) => {
  try {
    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error en registro" };
  }
};

export const getGeneros = async () => {
  try {
    const response = await API.get("/genero");
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al obtener los géneros" };
  }
};

export const login = async (credentials) => {
  try {
    const response = await API.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error en el login" };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await API.post("/auth/request-password-reset", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al solicitar el restablecimiento" };
  }
};

export const resendPasswordReset = async (email) => {
  try {
    const response = await API.post("/auth/resend-password-reset", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al reenviar el código" };
  }
};

export const resetPassword = async (otp, newPassword) => {
  try {
    const response = await API.post("/auth/reset-password", { otp, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al restablecer la contraseña" };
  }
};

export const getUsers = async () => {
  try {
    const response = await API.get("/auth/users");
    return response.data?.data || response.data?.users || response.data || [];
  } catch (error) {
    console.error("getUsers error:", error.response || error);
    throw error.response?.data || { message: "Error al obtener la lista de usuarios" };
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await API.patch(`/auth/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error("toggleUserStatus error:", error.response || error);
    throw error.response?.data || { message: "Error al cambiar el estado del usuario" };
  }
};
