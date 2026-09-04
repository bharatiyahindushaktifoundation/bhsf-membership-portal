import api from "./api";

// ---------- Auth ----------
export const authService = {
  sendAdminOtp: (phone) =>
  api.post("/auth/admin/send-otp", { phone }),

verifyAdminOtp: (phone, accessToken) =>
  api.post("/auth/admin/verify-otp", {
    phone,
    accessToken,
  }),
  getCurrentAdmin: () => api.get("/auth/admin/me"),
  sendApplicationOtp: (phone) => api.post("/auth/application/send-otp", { phone }),
  verifyApplicationOtp: (phone, accessToken) =>
  api.post("/auth/application/verify-otp", {
    phone,
    accessToken,
  }),
};

// ---------- Organizational hierarchy ----------
export const locationService = {
  list: (level, params) => api.get(`/locations/${level}`, { params }),
  create: (level, data) => api.post(`/locations/${level}`, data),
  update: (level, id, data) => api.put(`/locations/${level}/${id}`, data),
  remove: (level, id) => api.delete(`/locations/${level}/${id}`),
};

// ---------- Applications ----------
export const applicationService = {
  submit: (formData) =>
    api.post("/applications", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  status: (id) => api.get(`/applications/status/${id}`),
  list: (params) => api.get("/applications", { params }),
  get: (id) => api.get(`/applications/${id}`),
  approve: (id) => api.post(`/applications/${id}/approve`),
  reject: (id, reason) => api.post(`/applications/${id}/reject`, { reason }),
};

// ---------- Members ----------
export const memberService = {
  list: (params) => api.get("/members", { params }),
  get: (id) => api.get(`/members/${id}`),
  create: (formData) =>
    api.post("/members", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/members/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/members/${id}`),
  idCardData: (id) => api.get(`/members/${id}/id-card`),
  idCardPdfUrl: (id) => `/api/members/${id}/id-card/pdf`,
};

// ---------- Departments ----------
export const departmentService = {
  list: () => api.get("/departments"),
  create: (data) => api.post("/departments", data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  remove: (id) => api.delete(`/departments/${id}`),
  assign: (memberId, departmentId) => api.post("/departments/assign", { memberId, departmentId }),
  unassign: (assignmentId) => api.delete(`/departments/assign/${assignmentId}`),
};

// ---------- Activities ----------
export const activityService = {
  list: (params) => api.get("/activities", { params }),
  get: (id) => api.get(`/activities/${id}`),
  create: (formData) =>
    api.post("/activities", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/activities/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/activities/${id}`),
  removeImage: (imageId) => api.delete(`/activities/images/${imageId}`),
  categories: ["Blood Donation Camp", "Tree Plantation", "Social Service", "Meeting", "Event"],
};

// ---------- News ----------
export const newsService = {
  list: (params) => api.get("/news", { params }),
  get: (id) => api.get(`/news/${id}`),
  create: (formData) =>
    api.post("/news", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/news/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/news/${id}`),
};

// ---------- Gallery ----------
export const galleryService = {
  listPhotos: () => api.get("/gallery/photos"),
  uploadPhotos: (formData) =>
    api.post("/gallery/photos", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  removePhoto: (id) => api.delete(`/gallery/photos/${id}`),
  listVideos: () => api.get("/gallery/videos"),
  addVideo: (data) => {
    const isFormData = data instanceof FormData;
    return api.post("/gallery/videos", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
  },
  removeVideo: (id) => api.delete(`/gallery/videos/${id}`),
};

// ---------- Home content ----------
export const homeContentService = {
  getAll: () => api.get("/home-content"),
  updateSection: (section, formData) =>
    api.put(`/home-content/${section}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ---------- Dashboard ----------
export const dashboardService = {
  summary: () => api.get("/dashboard/summary"),
};

// ---------- Export ----------
export const exportService = {
  excel: (params = {}) =>
    api.get("/export/members/excel", {
      params,
      responseType: "blob",
    }),

  pdf: (params = {}) =>
    api.get("/export/members/pdf", {
      params,
      responseType: "blob",
    }),
};

// ---------- Admin Management (Super Admin only) ----------
export const adminManagementService = {
  list: (params) => api.get("/admin-management", { params }),
  activate: (id) => api.patch(`/admin-management/${id}/activate`),
  deactivate: (id) => api.patch(`/admin-management/${id}/deactivate`),
  promote: (id) => api.patch(`/admin-management/${id}/promote`),
  demote: (id) => api.patch(`/admin-management/${id}/demote`),
  remove: (id) => api.delete(`/admin-management/${id}`),
};
