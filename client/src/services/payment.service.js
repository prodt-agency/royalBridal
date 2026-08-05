import api from "@/lib/axios";

const unwrap = (response) => response.data?.data ?? response.data;

// TODO: Register payment routes in the backend before enabling payment collection.
export const paymentService = {
  createOrder: async (payload) => unwrap(await api.post("/payments/create-order", payload)),
  verify: async (payload) => unwrap(await api.post("/payments/verify", payload)),
};
