import { useEffect, useState } from "react";

import Container from "@/components/common/Container/Container";
import SectionHeading from "@/components/common/SectionHeading/SectionHeading";
import ProductGrid from "@/components/home/ProductGrid";

import { productService } from "@/services/product.service";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState("");

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [totalPages, setTotalPages] = useState(1);

  async function loadCategories() {
    try {
      const data = await productService.getCategories();

      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories(data?.categories || []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function loadProducts() {
    try {
      setLoading(true);

      const data = await productService.getProducts({
        page,
        limit: 12,
        category: selectedCategory || undefined,
        search: search || undefined,
        sort,
        order,
      });

      setProducts(data?.products || []);

      if (data?.pagination?.totalPages) {
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, search, sort, order]);

  return (
    <section className="py-14">
      <Container>
        <SectionHeading
          eyebrow="Royal Bridal"
          title="All Products"
          description="Explore our bridal collection."
        />

        {/* Filters */}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="rounded-lg border p-3"
          />

          <select
            value={selectedCategory}
            onChange={(e) => {
              setPage(1);
              setSelectedCategory(e.target.value);
            }}
            className="rounded-lg border p-3"
          >
            <option value="">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.slug}
              >
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={`${sort}-${order}`}
            onChange={(e) => {
              const value = e.target.value;

              setPage(1);

              switch (value) {
                case "latest":
                  setSort("createdAt");
                  setOrder("desc");
                  break;

                case "price-low":
                  setSort("price");
                  setOrder("asc");
                  break;

                case "price-high":
                  setSort("price");
                  setOrder("desc");
                  break;

                case "name":
                  setSort("name");
                  setOrder("asc");
                  break;

                default:
                  break;
              }
            }}
            className="rounded-lg border p-3"
          >
            <option value="latest">
              Latest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="name">
              Name A-Z
            </option>
          </select>
        </div>

        {/* Products */}

        <ProductGrid
          products={products}
          loading={loading}
        />

        {/* Pagination */}

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page}
            {totalPages > 1 && ` of ${totalPages}`}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </Container>
    </section>
  );
}

export default Products;