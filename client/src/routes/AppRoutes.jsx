import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loader from "@/components/common/Loader/Loader";
import Layout from "@/components/Layout/Layout";

const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrderSuccess = lazy(() => import("@/pages/OrderSuccess"));

function RouteLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Loader size="lg" />
    </div>
  );
}
function PlaceholderPage() {
  return (
    <section className="grid min-h-[50vh] place-items-center px-5 text-center">
      <p className="font-serif text-3xl">This page is coming soon.</p>
    </section>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="*" element={<PlaceholderPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
