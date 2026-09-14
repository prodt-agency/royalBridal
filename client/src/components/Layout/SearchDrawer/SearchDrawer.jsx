import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import {productService} from "@/services/product.service";
import useUIStore from "@/store/uiStore";
import { getImageUrl } from "@/utils/image";

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
        className={`absolute inset-0 bg-[#24181a]/45 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        aria-label="Close search"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-[#fbf8f5] px-5 py-6 shadow-2xl transition-transform duration-300 sm:px-8 sm:py-8 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#9b6b35]">The collection</p><p className="mt-1 font-serif text-3xl text-[#24181a]">Find your piece</p></div>
          <button className="grid h-11 w-11 place-items-center" aria-label="Close search" onClick={close}>
            <X />
          </button>
        </div>
        <label className="mt-8 flex min-h-14 items-center gap-3 border-b border-[#9b6b35] pb-2 text-[#7d2034]">
          <Search size={20} />
          <span className="sr-only">Search jewellery</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border-0 bg-transparent text-base outline-none"
            placeholder="Search bridal jewellery"
          />
        </label>
        <div className="mt-7 flex-1 overflow-y-auto">
          {loading && <Loader />}
          {!loading && !query && <p className="pt-2 text-sm leading-6 text-stone-500">Search by product name or collection to find the piece you have in mind.</p>}
          {!loading && query && products.length === 0 && (
            <EmptyState
              title="No pieces found"
              description="Try a different search term."
            />
          )}
          {products.map((product) => (
            <a
              className="group flex gap-4 border-b border-[#e4dbd3] py-4 transition hover:bg-[#f5ede5]"
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={close}
            >
              <img
                className="h-20 w-16 shrink-0 object-cover"
                loading="lazy"
                src={getImageUrl(product.images?.[0]?.imageUrl)}
                alt={product.name}
              />
              <span className="py-1">
                {product.category?.name && <span className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#9b6b35]">{product.category.name}</span>}
                <b className="mt-1 block font-serif text-lg font-normal text-[#24181a]">{product.name}</b>
                <span className="mt-1 block text-sm font-semibold text-stone-700">
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
