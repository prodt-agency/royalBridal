import { create } from "zustand";

const useUIStore = create((set) => ({
  mobileMenuOpen: false,
  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  searchDrawerOpen: false,
  openSearchDrawer: () => set({ searchDrawerOpen: true }),
  closeSearchDrawer: () => set({ searchDrawerOpen: false }),
}));

export default useUIStore;
