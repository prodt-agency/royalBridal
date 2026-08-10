import api from "../lib/axios";

export const categoryService = {
  getCategories: async () => {
    const res = await api.get("/categories");
    return res.data;
  },
};