import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bhsf_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export function fileUrl(storedPath) {
  if (!storedPath) return null;

  const marker = "/uploads/";
  const idx = storedPath.indexOf(marker);

  if (idx === -1) return storedPath;

  return `${import.meta.env.VITE_API_URL}${storedPath.substring(idx)}`;
}