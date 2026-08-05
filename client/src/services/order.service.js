import api from "@/lib/axios";

const unwrap = (response) => response.data?.data ?? response.data;

// TODO: Register order routes in the backend before enabling checkout.
export const orderService = {
  create: async (payload) => unwrap(await api.post("/orders", payload)),
  track: async (orderNumber) => unwrap(await api.get(`/orders/${orderNumber}`)),
};
