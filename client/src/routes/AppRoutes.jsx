import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Loader from "@/components/common/Loader/Loader";
import Layout from "@/components/Layout/Layout";

// Customer Pages
const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrderSuccess = lazy(() => import("@/pages/OrderSuccess"));
const TrackOrder = lazy(() => import("@/pages/TrackOrder"));

// Admin Pages & Layout
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("@/pages/admin/AdminProductForm"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("@/pages/admin/AdminOrderDetail"));
const AdminCustomers = lazy(() => import("@/pages/admin/AdminCustomers"));

function RouteLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader size="lg" />
    </div>
  );
}

function PlaceholderPage({ title = "Page Under Development" }) {
  return (
    <section className="grid min-h-[50vh] place-items-center px-5 text-center">
      <div>
        <p className="font-serif text-3xl text-stone-900">{title}</p>
        <p className="mt-2 text-sm text-stone-500">
          This section is currently being updated for our new collection.
        </p>
      </div>
    </section>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Admin Login (standalone) */}
        <Route path="admin/login" element={<AdminLogin />} />

        {/* Protected Admin Portal */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        {/* Customer Storefront */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="about" element={<PlaceholderPage title="About Royal Bridal" />} />
          <Route path="contact" element={<PlaceholderPage title="Contact Our Concierge" />} />
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
