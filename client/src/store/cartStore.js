import { create } from "zustand";
import { persist } from "zustand/middleware";

// Carts persisted before size variants were category-aware can still hold a
// placeholder for products that have no size. Normalise on rehydrate so a stale
// placeholder is never submitted to the API.
const LEGACY_PLACEHOLDER_SIZES = new Set(["", "standard", "one size", "n/a", "na", "0"]);

const normalizeSize = (size) => {
  if (size === null || size === undefined) return null;
  const trimmed = String(size).trim();
  return LEGACY_PLACEHOLDER_SIZES.has(trimmed.toLowerCase()) ? null : trimmed;
};

const normalizeItems = (items) =>
  Array.isArray(items)
    ? items.map((item) => ({ ...item, size: normalizeSize(item.size) }))
    : items;

const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const size = normalizeSize(item.size);
          const existing = state.items.find(
            (entry) => entry.id === item.id && normalizeSize(entry.size) === size,
          );
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry === existing
                  ? { ...entry, size, quantity: Math.min(entry.quantity + item.quantity, entry.stock ?? 10) }
                  : entry,
              ),
            };
          }
          return {
            items: [...state.items, { ...item, size, quantity: item.quantity ?? 1 }],
          };
        }),
      removeItem: (id, size) =>
        set((state) => {
          const target = normalizeSize(size);
          return {
            items: state.items.filter(
              (item) => item.id !== id || normalizeSize(item.size) !== target,
            ),
          };
        }),
      updateQuantity: (id, size, quantity) =>
        set((state) => {
          const target = normalizeSize(size);
          return {
            items: state.items.map((item) =>
              item.id === id && normalizeSize(item.size) === target
                ? {
                    ...item,
                    quantity: Math.max(1, Math.min(quantity, item.stock ?? 10)),
                  }
                : item,
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "royal-bridal-cart",
      version: 2,
      // `merge` runs on rehydrate and on `migrate`, so legacy placeholder sizes
      // are normalised before any component reads the cart.
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        items: normalizeItems(persisted?.items),
      }),
    },
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
