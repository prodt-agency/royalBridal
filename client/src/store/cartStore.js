import { create } from "zustand";

const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find((entry) => entry.id === item.id && entry.size === item.size);
    if (existing) {
      return { items: state.items.map((entry) => entry === existing ? { ...entry, quantity: entry.quantity + 1 } : entry) };
    }
    return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] };
  }),
  removeItem: (id, size) => set((state) => ({ items: state.items.filter((item) => item.id !== id || item.size !== size) })),
  clearCart: () => set({ items: [] }),
}));

export const selectCartCount = (state) => state.items.reduce((total, item) => total + item.quantity, 0);
export default useCartStore;
