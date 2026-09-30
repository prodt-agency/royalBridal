import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
} from "lucide-react";
import useAdminAuthStore from "@/store/adminAuthStore";
import { adminService } from "@/services/admin.service";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Categories", path: "/admin/categories", icon: Layers },
  { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { name: "Customers", path: "/admin/customers", icon: Users },
];

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAdminAuthStore((state) => state.token);
  const admin = useAdminAuthStore((state) => state.admin);
  const logout = useAdminAuthStore((state) => state.logout);

  // The drawer is keyed to the route it was opened on, so any navigation closes
  // it without an extra render pass.
  const [drawerRoute, setDrawerRoute] = useState(null);
  const sidebarOpen = drawerRoute === location.pathname;

  const openSidebar = useCallback(() => {
    setDrawerRoute(location.pathname);
  }, [location.pathname]);

  const closeSidebar = useCallback(() => setDrawerRoute(null), []);

  // Escape closes the drawer, and the page behind it must not scroll.
  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeSidebar();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen, closeSidebar]);

  // If not logged in, redirect to login
  if (!token) {
    navigate("/admin/login", { replace: true });
    return null;
  }

  const handleLogout = async () => {
    try {
      await adminService.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      logout();
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-100 font-sans text-stone-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] shrink-0 flex-col overflow-y-auto overscroll-contain bg-[#1f1517] text-stone-200 transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-stone-800 px-4 sm:h-18 sm:px-6">
          <Link
            to="/admin/dashboard"
            onClick={closeSidebar}
            className="flex min-w-0 items-center gap-2"
          >
            <span className="truncate font-serif text-lg font-bold tracking-wide text-[#e6c98c] sm:text-xl">
              Royal Bridal
            </span>
            <span className="shrink-0 rounded bg-[#7d2034] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close menu"
            className="-mr-2 shrink-0 rounded-md p-2.5 text-stone-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-5 sm:px-4 sm:py-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#7d2034] text-white shadow"
                      : "text-stone-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-stone-800 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-xs font-semibold text-white">
              {admin?.name || "Admin"}
            </p>
            <p className="truncate text-[11px] text-stone-400">{admin?.email}</p>
            <span className="mt-1 inline-block text-[10px] font-bold tracking-wider text-[#d5aa65] uppercase">
              {admin?.role || "ADMIN"}
            </span>
          </div>

          <div className="space-y-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-stone-300 transition hover:bg-white/10 sm:py-2"
            >
              <ExternalLink size={15} className="shrink-0" /> View Storefront
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 sm:py-2"
            >
              <LogOut size={15} className="shrink-0" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-stone-200 bg-white px-3 shadow-sm sm:px-6">
          <button
            type="button"
            onClick={() => openSidebar()}
            aria-label="Open menu"
            aria-controls="admin-sidebar"
            aria-expanded={sidebarOpen}
            className="-ml-1 shrink-0 rounded-md p-2.5 text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="hidden min-w-0 items-center gap-2 text-xs text-stone-500 lg:flex">
            <Shield size={14} className="shrink-0 text-[#7d2034]" />
            <span className="truncate">Store Administration Portal</span>
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-xs font-medium text-stone-600 transition hover:text-[#7d2034] sm:inline-flex"
            >
              <ExternalLink size={13} className="shrink-0" /> Live Store
            </Link>
            <div className="hidden h-4 w-px bg-stone-200 sm:block" />
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="truncate font-medium text-stone-800">
                {admin?.name || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;