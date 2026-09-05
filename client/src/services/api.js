import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
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

  // If the database already contains a complete URL
  if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
    return storedPath;
  }

  const marker = "/uploads/";
  const idx = storedPath.indexOf(marker);

  if (idx === -1) return storedPath;

  const uploadPath = storedPath.substring(idx);

  const backendUrl = import.meta.env.VITE_API_URL;

  if (!backendUrl) {
    return uploadPath;
  }

  return `${backendUrl.replace(/\/$/, "")}${uploadPath}`;
}