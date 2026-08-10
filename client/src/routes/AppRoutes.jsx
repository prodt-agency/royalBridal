import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loader from "@/components/common/Loader/Loader";
import Layout from "@/components/Layout/Layout";

const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));

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
          <Route path="products/:slug" element={<PlaceholderPage />} />
          <Route path="cart" element={<PlaceholderPage />} />
          <Route path="*" element={<PlaceholderPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
