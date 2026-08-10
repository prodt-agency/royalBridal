import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "@/components/common/Container/Container";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import ProductGrid from "@/components/home/ProductGrid";
import SectionHeading from "@/components/common/SectionHeading/SectionHeading";
import Seo from "@/components/Seo";
import { productService } from "@/services/product.service";
import { getErrorMessage } from "@/utils/apiError";

function Products() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = {
    page: Number(params.get("page") ?? 1),
    limit: 12,
    search: params.get("search") ?? undefined,
    category: params.get("category") ?? undefined,
    sort: params.get("sort") ?? "createdAt",
    order: params.get("order") ?? "desc",
  };
  useEffect(() => {
    productService
      .getCategories()
      .then((data) =>
        setCategories(Array.isArray(data) ? data : (data?.data ?? [])),
      )
      .catch(() => setCategories([]));
  }, []);
  useEffect(() => {
    let live = true;
    const requestParams = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      category: query.category,
      sort: query.sort,
      order: query.order,
    };
    productService
      .getProducts(requestParams)
      .then((data) => {
        if (live) {
          setProducts(data?.data ?? []);
          setMeta(data?.meta ?? { page: 1, totalPages: 1 });
          setError("");
        }
      })
      .catch((requestError) => live && setError(getErrorMessage(requestError)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [
    query.page,
    query.limit,
    query.search,
    query.category,
    query.sort,
    query.order,
  ]);
  const change = (updates) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    if (!Object.hasOwn(updates, "page")) next.delete("page");
    setParams(next);
  };
  return (
    <section className="py-14">
      <Seo
        title="Shop Bridal Jewellery | Royal Bridal"
        description="Explore Royal Bridal's curated jewellery collection."
      />
      <Container>
        <SectionHeading
          eyebrow="Royal Bridal"
          title="The collection"
          description="Discover pieces chosen for the moments you will remember forever."
        />
        <div className="mb-9 grid gap-3 md:grid-cols-3">
          <input
            aria-label="Search products"
            value={params.get("search") ?? ""}
            onChange={(event) => change({ search: event.target.value })}
            placeholder="Search the collection"
            className="rounded-full border border-stone-300 px-5 py-3 outline-none focus:border-[#7d2034]"
          />
          <select
            aria-label="Filter category"
            value={params.get("category") ?? ""}
            onChange={(event) => change({ category: event.target.value })}
            className="rounded-full border border-stone-300 px-5 py-3"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort products"
            value={`${query.sort}:${query.order}`}
            onChange={(event) => {
              const [sort, order] = event.target.value.split(":");
              change({ sort, order });
            }}
            className="rounded-full border border-stone-300 px-5 py-3"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="price:asc">Price: low to high</option>
            <option value="price:desc">Price: high to low</option>
            <option value="name:asc">Name: A to Z</option>
          </select>
        </div>
        {error ? (
          <EmptyState
            title="We couldn't load the collection"
            description={error}
            actionText="Try again"
            onAction={() => change({ page: String(query.page) })}
          />
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}{" "}
        {!loading && !error && meta.totalPages > 1 && (
          <nav
            aria-label="Product pages"
            className="mt-10 flex items-center justify-center gap-4"
          >
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => change({ page: String(query.page - 1) })}
              className="rounded-full border px-5 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              disabled={!meta.hasNextPage}
              onClick={() => change({ page: String(query.page + 1) })}
              className="rounded-full border px-5 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </Container>
    </section>
  );
}
export default Products;
