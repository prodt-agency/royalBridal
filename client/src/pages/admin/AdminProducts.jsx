import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, RotateCcw, Eye, Sparkles } from "lucide-react";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";
import { getImageUrl } from "@/utils/image";

function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const page = Number(params.get("page") ?? 1);
  const search = params.get("search") || undefined;
  const category = params.get("category") || undefined;
  const active = params.get("active") !== null ? params.get("active") === "true" : undefined;

  const loadCategories = useCallback(() => {
    adminService
      .getCategories()
      .then((data) => {
        setCategories(Array.isArray(data) ? data : data?.data ?? []);
      })
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(() => {
    adminService
      .getProducts({ page, limit: 15, search, category, active })
      .then((res) => {
        setProducts(res.data ?? []);
        setMeta(res.meta ?? { page: 1, totalPages: 1, total: 0 });
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, search, category, active]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, val]) => {
      if (val !== undefined && val !== "") next.set(key, val);
      else next.delete(key);
    });
    if (!Object.hasOwn(updates, "page")) next.delete("page");
    setParams(next);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate/delete this product?")) return;
    setActionLoading(id);
    try {
      await adminService.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id) => {
    setActionLoading(id);
    try {
      await adminService.restoreProduct(id);
      loadProducts();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Seo title="Products | Admin | Royal Bridal" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Product Catalog
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Manage jewellery listings, pricing, sizes, inventory and visibility.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#7d2034] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow hover:bg-[#681a2b] transition"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="grid gap-3 sm:grid-cols-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
          <input
            value={params.get("search") ?? ""}
            onChange={(e) => updateParams({ search: e.target.value })}
            placeholder="Search by name, SKU..."
            className="w-full rounded-md border border-stone-300 pl-10 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7d2034]"
          />
        </div>

        <select
          value={params.get("category") ?? ""}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7d2034]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={params.get("active") ?? ""}
          onChange={(e) => updateParams({ active: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7d2034]"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Archived / Inactive</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-8">
            <EmptyState
              title="Unable to load products"
              description={error}
              actionText="Retry"
              onAction={loadProducts}
            />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or create a new product."
              actionText="Add New Product"
              onAction={() => window.location.href = "/admin/products/new"}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase text-stone-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">SKU</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {products.map((p) => {
                  const img = p.images?.[0]?.imageUrl;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-stone-100">
                            {img ? (
                              <img
                                src={getImageUrl(img)}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-stone-200" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-stone-900">
                              <span>{p.name}</span>
                              {p.featured && (
                                <span title="Featured">
                                  <Sparkles size={13} className="text-amber-500" />
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-stone-400">/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono font-medium text-stone-600">
                        {p.sku}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-stone-600">
                        {p.category?.name || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs">
                          <span className="font-semibold text-stone-900">
                            ₹{p.salePrice ?? p.price}
                          </span>
                          {p.salePrice && (
                            <span className="ml-1.5 text-stone-400 line-through">
                              ₹{p.price}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span
                          className={`font-semibold ${
                            p.stock <= 2 ? "text-amber-600" : "text-stone-700"
                          }`}
                        >
                          {p.stock} units
                        </span>
                        {p.sizes?.length > 0 && (
                          <p className="text-[10px] text-stone-400">
                            {p.sizes.length} sizes configured
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span
                          className={`rounded px-2.5 py-1 text-[11px] font-bold ${
                            p.active && !p.deletedAt
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-200 text-stone-700"
                          }`}
                        >
                          {p.active && !p.deletedAt ? "ACTIVE" : "ARCHIVED"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View on store"
                            className="rounded p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                          >
                            <Eye size={15} />
                          </a>
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            title="Edit product"
                            className="rounded p-1.5 text-stone-600 hover:bg-stone-100 hover:text-[#7d2034]"
                          >
                            <Edit2 size={15} />
                          </Link>
                          {p.active && !p.deletedAt ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id)}
                              disabled={actionLoading === p.id}
                              title="Deactivate product"
                              className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRestore(p.id)}
                              disabled={actionLoading === p.id}
                              title="Restore product"
                              className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
                            >
                              <RotateCcw size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-200 px-6 py-4 text-xs text-stone-600">
            <span>
              Showing Page {meta.page} of {meta.totalPages} ({meta.total} products)
            </span>
            <div className="flex gap-2">
              <button
                disabled={!meta.hasPreviousPage}
                onClick={() => updateParams({ page: String(page - 1) })}
                className="rounded border border-stone-300 px-3 py-1.5 font-medium disabled:opacity-40 hover:bg-stone-50"
              >
                Previous
              </button>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => updateParams({ page: String(page + 1) })}
                className="rounded border border-stone-300 px-3 py-1.5 font-medium disabled:opacity-40 hover:bg-stone-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;
