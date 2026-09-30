import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  RotateCcw,
  Eye,
  Sparkles,
} from "lucide-react";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import {
  adminInputClass,
  adminPrimaryActionClass,
  adminSelectClass,
} from "@/components/admin/adminUi";
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
  const active =
    params.get("active") !== null ? params.get("active") === "true" : undefined;

  const loadCategories = useCallback(() => {
    adminService
      .getCategories()
      .then((data) => {
        setCategories(Array.isArray(data) ? data : (data?.data ?? []));
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
    if (
      !window.confirm(
        "Are you sure you want to deactivate/delete this product?",
      )
    )
      return;
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

      <AdminPageHeader
        title="Product Catalog"
        subtitle="Manage jewellery listings, pricing, sizes, inventory and visibility."
        actions={
          <Link to="/admin/products/new" className={adminPrimaryActionClass}>
            <Plus size={16} className="shrink-0" /> Add Product
          </Link>
        }
      />

      {/* Filters Bar */}
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <div className="relative min-w-0">
          <Search
            size={16}
            className="absolute top-3 left-3.5 text-stone-400"
          />
          <input
            value={params.get("search") ?? ""}
            onChange={(e) => updateParams({ search: e.target.value })}
            placeholder="Search by name, SKU..."
            className={`${adminInputClass} pl-10`}
          />
        </div>

        <select
          value={params.get("category") ?? ""}
          onChange={(e) => updateParams({ category: e.target.value })}
          aria-label="Filter by category"
          className={adminSelectClass}
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
          aria-label="Filter by status"
          className={adminSelectClass}
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Archived / Inactive</option>
        </select>
      </div>

      {/* Products List */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-4 sm:p-8">
            <EmptyState
              title="Unable to load products"
              description={error}
              actionText="Retry"
              onAction={loadProducts}
            />
          </div>
        ) : products.length === 0 ? (
          <div className="p-4 sm:p-8">
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or create a new product."
              actionText="Add New Product"
              onAction={() => (window.location.href = "/admin/products/new")}
            />
          </div>
        ) : (
          <>
            {/* Mobile / small-screen card list */}
            <ul className="divide-y divide-stone-100 lg:hidden">
              {products.map((p) => {
                const img = p.images?.[0]?.imageUrl;
                const isActive = p.active && !p.deletedAt;
                return (
                  <li key={p.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="h-16 w-14 shrink-0 overflow-hidden rounded bg-stone-100">
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
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium break-words text-stone-900">
                            {p.name}
                            {p.featured && (
                              <Sparkles
                                size={13}
                                className="ml-1.5 inline text-amber-500"
                              />
                            )}
                          </p>
                          <AdminStatusBadge
                            status={isActive ? "ACTIVE" : "ARCHIVED"}
                          />
                        </div>
                        <p className="truncate text-xs text-stone-400">
                          /{p.slug}
                        </p>
                        <p className="mt-1 text-xs break-words text-stone-600">
                          {p.category?.name || "—"}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div className="min-w-0">
                        <dt className="text-stone-400">Price</dt>
                        <dd className="font-semibold break-words text-stone-900">
                          ₹{p.salePrice ?? p.price}
                          {p.salePrice && (
                            <span className="ml-1 font-normal text-stone-400 line-through">
                              ₹{p.price}
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-stone-400">SKU</dt>
                        <dd className="font-mono break-all text-stone-700">
                          {p.sku}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-stone-400">Stock</dt>
                        <dd
                          className={`font-semibold ${
                            p.stock <= 2 ? "text-amber-600" : "text-stone-700"
                          }`}
                        >
                          {p.stock} units
                        </dd>
                        {p.sizes?.length > 0 && (
                          <p className="text-[10px] text-stone-400">
                            {p.sizes.length} sizes configured
                          </p>
                        )}
                      </div>
                    </dl>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`/products/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                      >
                        <Eye size={15} className="shrink-0" /> View
                      </a>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-[#7d2034]"
                      >
                        Edit
                      </Link>
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          disabled={actionLoading === p.id}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-40"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestore(p.id)}
                          disabled={actionLoading === p.id}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-600 disabled:opacity-40"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold tracking-wider text-stone-500 uppercase">
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
                    const isActive = p.active && !p.deletedAt;
                    return (
                      <tr key={p.id} className="transition hover:bg-stone-50">
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
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 font-medium text-stone-900">
                                <span className="break-words">{p.name}</span>
                                {p.featured && (
                                  <span title="Featured" className="shrink-0">
                                    <Sparkles size={13} className="text-amber-500" />
                                  </span>
                                )}
                              </div>
                              <span className="block truncate text-xs text-stone-400">
                                /{p.slug}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-medium whitespace-nowrap text-stone-600">
                          {p.sku}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-stone-600">
                          {p.category?.name || "—"}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
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
                            className={`font-semibold whitespace-nowrap ${
                              p.stock <= 2
                                ? "text-amber-600"
                                : "text-stone-700"
                            }`}
                          >
                            {p.stock} units
                          </span>
                          {p.sizes?.length > 0 && (
                            <p className="text-[10px] whitespace-nowrap text-stone-400">
                              {p.sizes.length} sizes configured
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs">
                          <AdminStatusBadge
                            status={isActive ? "ACTIVE" : "ARCHIVED"}
                          />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/products/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View on store"
                              className="rounded p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                            >
                              <Eye size={15} />
                            </a>
                            <Link
                              to={`/admin/products/${p.id}/edit`}
                              title="Edit product"
                              className="rounded p-2 text-stone-600 hover:bg-stone-100 hover:text-[#7d2034]"
                            >
                              <Edit2 size={15} />
                            </Link>
                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id)}
                                disabled={actionLoading === p.id}
                                title="Deactivate product"
                                className="rounded p-2 text-stone-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRestore(p.id)}
                                disabled={actionLoading === p.id}
                                title="Restore product"
                                className="rounded p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
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
          </>
        )}

        {/* Pagination */}
        {!loading && (
          <AdminPagination
            meta={meta}
            noun="products"
            onPrev={() => updateParams({ page: String(page - 1) })}
            onNext={() => updateParams({ page: String(page + 1) })}
          />
        )}
      </div>
    </div>
  );
}

export default AdminProducts;