import api from "@/lib/axios";

const unwrap = (response) => response.data?.data ?? response.data;

// TODO: Register category and product routes in the backend before enabling these requests.
export const productService = {
  getCategories: async () => unwrap(await api.get("/categories")),
  getFeatured: async () => unwrap(await api.get("/products", { params: { featured: true } })),
  getLatest: async () => unwrap(await api.get("/products", { params: { sort: "latest" } })),
  search: async (query) => unwrap(await api.get("/products", { params: { search: query } })),
};
