import api from "@/lib/axios";

const unwrap = (response) => response.data?.data ?? response.data;

export const paymentService = {
  createOrder: async (payload) =>
    unwrap(await api.post("/payments/create-order", payload)),
  verify: async (payload) =>
    unwrap(await api.post("/payments/verify", payload)),
};
