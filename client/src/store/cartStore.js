import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (entry) => entry.id === item.id && entry.size === item.size,
          );
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry === existing
                  ? { ...entry, quantity: entry.quantity + 1 }
                  : entry,
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: item.quantity ?? 1 }],
          };
        }),
      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== id || item.size !== size,
          ),
        })),
      updateQuantity: (id, size, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.size === size
              ? {
                  ...item,
                  quantity: Math.max(1, Math.min(quantity, item.stock ?? 10)),
                }
              : item,
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "royal-bridal-cart" },
  ),
);

export const selectCartCount = (state) =>
  state.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) =>
  state.items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );
export default useCartStore;
