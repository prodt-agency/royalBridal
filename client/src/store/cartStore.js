import { create } from "zustand";
import { persist } from "zustand/middleware";

// Carts persisted before size variants were category-aware can still hold a
// placeholder for products that have no size. Normalise on rehydrate so a stale
// placeholder is never submitted to the API.
const LEGACY_PLACEHOLDER_SIZES = new Set(["", "standard", "one size", "n/a", "na", "0"]);

const STORAGE_KEY = "royal-bridal-cart";
const STORAGE_VERSION = 2;
const DEFAULT_STOCK = 10;
// Stable reference used whenever `items` is not a real array, so selectors never
// hand a fresh array to React and never call array methods on `undefined`.
const EMPTY_ITEMS = [];

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeSize = (size) => {
  if (size === null || size === undefined) return null;
  const trimmed = String(size).trim();
  return LEGACY_PLACEHOLDER_SIZES.has(trimmed.toLowerCase()) ? null : trimmed;
};

// Quantity is always a positive integer: a stale or hand-edited persisted cart
// must not be able to smuggle NaN or 0 into the totals.
const normalizeQuantity = (quantity) => {
  const parsed = Math.trunc(Number(quantity));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

// Never returns undefined/null, so `items` is always an array.
const asItems = (items) => (Array.isArray(items) ? items : EMPTY_ITEMS);

const normalizeItems = (items) =>
  asItems(items)
    .filter(isPlainObject)
    .map((item) => ({
      ...item,
      size: normalizeSize(item.size),
      quantity: normalizeQuantity(item.quantity),
    }));

// Only runs when the persisted version differs from STORAGE_VERSION, which is the
// path every stale cart actually takes. Without it zustand logs "couldn't be
// migrated" and discards the payload, which is what left `items` undefined.
// Every historical version stored its lines under `state.items`, so the migration
// is about rebuilding a valid array from whatever shape is on disk (v0, v1, v2,
// missing/null/malformed state, `items` missing, undefined or null).
const migratePersistedCart = (persistedState, version) => {
  try {
    const persisted = isPlainObject(persistedState) ? persistedState : null;
    const items = normalizeItems(persisted?.items).map((item) =>
      // Carts written before stock limits existed carry no `stock`; restore the
      // default limit so quantity controls keep clamping to something sane.
      version >= STORAGE_VERSION || item.stock != null
        ? item
        : { ...item, stock: DEFAULT_STOCK },
    );
    return { items };
  } catch {
    // A rejected migration would leave the shopper without their cart at all.
    return { items: [] };
  }
};

const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const items = asItems(state?.items);
          const size = normalizeSize(item?.size);
          const quantity = normalizeQuantity(item?.quantity);
          const existing = items.find(
            (entry) => entry?.id === item?.id && normalizeSize(entry?.size) === size,
          );
          if (existing) {
            return {
              items: items.map((entry) =>
                entry === existing
                  ? {
                      ...entry,
                      size,
                      quantity: Math.min(
                        normalizeQuantity(entry.quantity) + quantity,
                        entry.stock ?? DEFAULT_STOCK,
                      ),
                    }
                  : entry,
              ),
            };
          }
          return { items: [...items, { ...item, size, quantity }] };
        }),
      removeItem: (id, size) =>
        set((state) => {
          const target = normalizeSize(size);
          return {
            items: asItems(state?.items).filter(
              (item) => item?.id !== id || normalizeSize(item?.size) !== target,
            ),
          };
        }),
      updateQuantity: (id, size, quantity) =>
        set((state) => {
          const target = normalizeSize(size);
          return {
            items: asItems(state?.items).map((item) =>
              item?.id === id && normalizeSize(item?.size) === target
                ? {
                    ...item,
                    quantity: Math.max(
                      1,
                      Math.min(normalizeQuantity(quantity), item.stock ?? DEFAULT_STOCK),
                    ),
                  }
                : item,
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      // Actions are functions and are dropped by JSON serialisation anyway; being
      // explicit keeps the persisted payload to the one field we can normalise.
      partialize: (state) => ({ items: asItems(state?.items) }),
      migrate: migratePersistedCart,
      // Runs on rehydrate and on `migrate`, so this is the single gate that
      // guarantees the rehydrated state holds a normalised array.
      merge: (persistedState, currentState) => {
        const persisted = isPlainObject(persistedState) ? persistedState : null;
        return {
          ...currentState,
          ...(persisted ?? {}),
          items: normalizeItems(persisted ? persisted.items : currentState?.items),
        };
      },
    },
  ),
);

export const selectCartCount = (state) =>
  asItems(state?.items).reduce(
    (total, item) => total + normalizeQuantity(item?.quantity),
    0,
  );
export const selectCartTotal = (state) =>
  asItems(state?.items).reduce(
    (total, item) => total + (Number(item?.price) || 0) * normalizeQuantity(item?.quantity),
    0,
  );
export default useCartStore;