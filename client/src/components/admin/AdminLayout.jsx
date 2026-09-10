import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
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
  const token = useAdminAuthStore((state) => state.token);
  const admin = useAdminAuthStore((state) => state.admin);
  const logout = useAdminAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-stone-100 text-stone-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1f1517] text-stone-200 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-18 items-center justify-between border-b border-stone-800 px-6">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-wide text-[#e6c98c]">
              Royal Bridal
            </span>
            <span className="rounded bg-[#7d2034] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-stone-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#7d2034] text-white shadow"
                      : "text-stone-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-stone-800 p-4">
          <div className="mb-3 px-2">
            <p className="text-xs font-semibold text-white truncate">{admin?.name || "Admin"}</p>
            <p className="text-[11px] text-stone-400 truncate">{admin?.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold text-[#d5aa65]">
              {admin?.role || "ADMIN"}
            </span>
          </div>

          <div className="space-y-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-stone-300 hover:bg-white/10"
            >
              <ExternalLink size={15} /> View Storefront
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-stone-700 hover:text-stone-900"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs text-stone-500">
            <Shield size={14} className="text-[#7d2034]" />
            <span>Store Administration Portal</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-[#7d2034]"
            >
              <ExternalLink size={13} /> Live Store
            </Link>
            <div className="h-4 w-px bg-stone-200 hidden sm:block" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-stone-800">{admin?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
