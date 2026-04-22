import API from "../../api/api";

export const registerUser = async (userData) => {
  try {
    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error en registro" };
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
