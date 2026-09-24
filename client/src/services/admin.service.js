import api from "@/lib/axios";

const unwrap = (response) => response.data?.data ?? response.data;

export const adminService = {
  // Auth
  login: async (credentials) => unwrap(await api.post("/admin/login", credentials)),
  logout: async () => unwrap(await api.post("/admin/logout")),
  getMe: async () => unwrap(await api.get("/admin/me")),

  // Dashboard
  getDashboard: async () => unwrap(await api.get("/dashboard")),

  // Products
  getProducts: async (params = {}) => unwrap(await api.get("/products", { params })),
  getProductBySlug: async (slug) => unwrap(await api.get(`/products/${slug}`)),
  createProduct: async (payload) => unwrap(await api.post("/products", payload)),
  updateProduct: async (id, payload) => unwrap(await api.patch(`/products/${id}`, payload)),
  deleteProduct: async (id) => unwrap(await api.delete(`/products/${id}`)),
  restoreProduct: async (id) => unwrap(await api.post(`/products/${id}/restore`)),

  // Categories
  getCategories: async () => unwrap(await api.get("/categories")),
  createCategory: async (payload) => unwrap(await api.post("/categories", payload)),
  updateCategory: async (id, payload) => unwrap(await api.patch(`/categories/${id}`, payload)),
  deleteCategory: async (id) => unwrap(await api.delete(`/categories/${id}`)),

  // Orders
  getOrders: async (params = {}) => unwrap(await api.get("/orders", { params })),
  getOrder: async (id) => unwrap(await api.get(`/orders/${id}`)),
  updateOrderStatus: async (id, payload) => unwrap(await api.patch(`/orders/${id}/status`, payload)),
  cancelOrder: async (id, payload) => unwrap(await api.patch(`/orders/${id}/cancel`, payload)),

  // Customers
  getCustomers: async (params = {}) => unwrap(await api.get("/customers", { params })),
  getCustomer: async (id) => unwrap(await api.get(`/customers/${id}`)),
  getCustomerOrders: async (id, params = {}) => unwrap(await api.get(`/customers/${id}/orders`, { params })),

  // Image Uploads
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    const res = await api.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res);
  },
  deleteImage: async (key) => unwrap(await api.delete(`/uploads/${encodeURIComponent(key)}`)),
};
