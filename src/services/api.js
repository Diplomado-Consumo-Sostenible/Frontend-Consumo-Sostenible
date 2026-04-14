import axios from "axios";
import { getToken } from "../models/auth.model";

const rawApiUrl = import.meta.env.VITE_API_URL || "";
const apiUrl = rawApiUrl.replace(/\/+$/, "");

const API = axios.create({
  baseURL: apiUrl,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;