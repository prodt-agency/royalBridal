import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: "royal-bridal-admin-auth",
    }
  )
);

export default useAdminAuthStore;
