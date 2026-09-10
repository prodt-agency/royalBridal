import api from "@/lib/axios";

const unwrap = (response) => response.data?.data ?? response.data;

export const orderService = {
  checkout: async (payload) => unwrap(await api.post("/checkout", payload)),
  track: async (orderNumber) => unwrap(await api.get(`/orders/track/${orderNumber}`)),
};
