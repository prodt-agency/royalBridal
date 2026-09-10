import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";

function AdminCustomers() {
  const [params, setParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const page = Number(params.get("page") ?? 1);
  const search = params.get("search") || undefined;

  const loadCustomers = useCallback(() => {
    adminService
      .getCustomers({ page, limit: 15, search })
      .then((res) => {
        setCustomers(res.data ?? []);
        setMeta(res.meta ?? { page: 1, totalPages: 1, total: 0 });
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setCustomers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const updateSearch = (val) => {
    const next = new URLSearchParams(params);
    if (val) next.set("search", val);
    else next.delete("search");
    next.delete("page");
    setParams(next);
  };

  const openCustomerOrders = async (customer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    try {
      const res = await adminService.getCustomerOrders(customer.id, { limit: 20 });
      setCustomerOrders(res.data ?? []);
    } catch {
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Seo title="Customers | Admin | Royal Bridal" />

      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Customer Management
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-500">
          View registered brides, contact details, and their purchase history.
        </p>
      </div>

      {/* Search Bar */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
          <input
            value={params.get("search") ?? ""}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search by customer name, phone, email..."
            className="w-full rounded-md border border-stone-300 pl-10 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7d2034]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-8">
            <EmptyState
              title="Unable to load customers"
              description={error}
              actionText="Retry"
              onAction={loadCustomers}
            />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No customers found"
              description="No registered clients match the search criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase text-stone-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50 transition">
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7d2034]/10 text-[#7d2034] text-xs font-bold">
                          {c.name?.slice(0, 1) || "U"}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-stone-600">
                      {c.phone}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-600">
                      {c.email || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openCustomerOrders(c)}
                        className="rounded border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#7d2034] hover:text-[#7d2034] transition"
                      >
                        View Orders
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-200 px-6 py-4 text-xs text-stone-600">
            <span>
              Showing Page {meta.page} of {meta.totalPages} ({meta.total} customers)
            </span>
            <div className="flex gap-2">
              <button
                disabled={!meta.hasPreviousPage}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set("page", String(page - 1));
                  setParams(next);
                }}
                className="rounded border border-stone-300 px-3 py-1.5 font-medium disabled:opacity-40 hover:bg-stone-50"
              >
                Previous
              </button>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set("page", String(page + 1));
                  setParams(next);
                }}
                className="rounded border border-stone-300 px-3 py-1.5 font-medium disabled:opacity-40 hover:bg-stone-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders History Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  {selectedCustomer.name}'s Orders
                </h2>
                <p className="text-xs text-stone-500">
                  {selectedCustomer.phone} • {selectedCustomer.email || "No email"}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {ordersLoading ? (
                <div className="py-12 text-center">
                  <Loader />
                </div>
              ) : customerOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-stone-400">
                  No orders recorded for this customer yet.
                </p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {customerOrders.map((o) => (
                    <div key={o.id} className="flex justify-between items-center py-3 text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{o.orderNumber}</p>
                        <p className="text-stone-400">
                          {new Date(o.createdAt).toLocaleDateString("en-IN")} • {o.paymentMethod}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-800">₹{o.totalAmount}</span>
                        <span className="rounded bg-stone-100 px-2 py-0.5 font-semibold text-stone-700">
                          {o.orderStatus}
                        </span>
                        <Link
                          to={`/admin/orders/${o.id}`}
                          onClick={() => setSelectedCustomer(null)}
                          className="text-[#7d2034] font-semibold hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded border border-stone-300 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
