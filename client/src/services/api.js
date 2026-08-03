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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bhsf_admin_token");
      localStorage.removeItem("bhsf_admin_info");
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to build a full URL for a stored upload path returned by the API
// e.g. "/home/.../uploads/photos/xyz.jpg" -> "/uploads/photos/xyz.jpg"
export function fileUrl(storedPath) {
  if (!storedPath) return null;
  const marker = "/uploads/";
  const idx = storedPath.indexOf(marker);
  if (idx === -1) return storedPath;
  return storedPath.substring(idx);
}
