import axios from "axios";
import { getToken } from "../utils/storage";

    const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    });

    API.interceptors.request.use((config) => {
    const token = getToken(); 
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
    });

export default API;