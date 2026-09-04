import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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

  // Vite proxy will forward /uploads to the backend
  return storedPath.substring(idx);
}