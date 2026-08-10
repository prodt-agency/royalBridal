import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import {productService} from "@/services/product.service";
import useUIStore from "@/store/uiStore";

function SearchDrawer() {
  const { searchDrawerOpen: isOpen, closeSearchDrawer } = useUIStore();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query.trim()) return undefined;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await productService.search(query);
        setProducts(Array.isArray(data) ? data : (data.products ?? []));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);
  const close = () => {
    setQuery("");
    setProducts([]);
    closeSearchDrawer();
  };
  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "visible" : "invisible"}`}
      aria-hidden={!isOpen}
    >
      <button
        className={`absolute inset-0 bg-black/40 transition ${isOpen ? "opacity-100" : "opacity-0"}`}
        aria-label="Close search"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className={`absolute right-0 top-0 h-full w-full max-w-xl bg-white p-6 shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <p className="font-serif text-2xl">Find your piece</p>
          <button aria-label="Close search" onClick={close}>
            <X />
          </button>
        </div>
        <label className="mt-7 flex items-center gap-3 border-b border-stone-400 pb-3">
          <Search size={19} />
          <span className="sr-only">Search jewellery</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full outline-none"
            placeholder="Search bridal jewellery"
          />
        </label>
        <div className="mt-8">
          {loading && <Loader />}
          {!loading && query && products.length === 0 && (
            <EmptyState
              title="No pieces found"
              description="Try a different search term."
            />
          )}
          {products.map((product) => (
            <a
              className="flex gap-4 border-b border-stone-100 py-4"
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={close}
            >
              <img
                className="h-16 w-16 object-cover"
                loading="lazy"
                src={product.images?.[0]?.imageUrl}
                alt=""
              />
              <span>
                <b className="block text-sm">{product.name}</b>
                <span className="text-sm text-stone-500">
                  ₹{product.salePrice ?? product.price}
                </span>
              </span>
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default SearchDrawer;
