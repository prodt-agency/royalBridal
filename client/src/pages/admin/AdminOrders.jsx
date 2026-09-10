import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";

function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = Number(params.get("page") ?? 1);
  const search = params.get("search") || undefined;
  const status = params.get("status") || undefined;
  const paymentStatus = params.get("paymentStatus") || undefined;
  const paymentMethod = params.get("paymentMethod") || undefined;

  const loadOrders = useCallback(() => {
    adminService
      .getOrders({
        page,
        limit: 15,
        search,
        status,
        paymentStatus,
        paymentMethod,
      })
      .then((res) => {
        setOrders(res.data ?? []);
        setMeta(res.meta ?? { page: 1, totalPages: 1, total: 0 });
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, search, status, paymentStatus, paymentMethod]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, val]) => {
      if (val !== undefined && val !== "") next.set(key, val);
      else next.delete(key);
    });
    if (!Object.hasOwn(updates, "page")) next.delete("page");
    setParams(next);
  };

  return (
    <div className="space-y-6">
      <Seo title="Orders | Admin | Royal Bridal" />

      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Order Management
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-500">
          Track customer orders, fulfillment workflow, shipments, and payment captures.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid gap-3 sm:grid-cols-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="relative sm:col-span-1">
          <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
          <input
            value={params.get("search") ?? ""}
            onChange={(e) => updateParams({ search: e.target.value })}
            placeholder="Search order #, customer, phone..."
            className="w-full rounded-md border border-stone-300 pl-10 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7d2034]"
          />
        </div>

        <select
          value={params.get("status") ?? ""}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7d2034]"
        >
          <option value="">All Fulfillment Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RETURNED">Returned</option>
          <option value="REFUNDED">Refunded</option>
        </select>

        <select
          value={params.get("paymentStatus") ?? ""}
          onChange={(e) => updateParams({ paymentStatus: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7d2034]"
        >
          <option value="">All Payment Statuses</option>
          <option value="PENDING">Payment Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>

        <select
          value={params.get("paymentMethod") ?? ""}
          onChange={(e) => updateParams({ paymentMethod: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7d2034]"
        >
          <option value="">All Methods</option>
          <option value="COD">Cash on Delivery (COD)</option>
          <option value="RAZORPAY">Razorpay Online</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-8">
            <EmptyState
              title="Unable to load orders"
              description={error}
              actionText="Retry"
              onAction={loadOrders}
            />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No orders found"
              description="No customer orders match the selected filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase text-stone-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order Number</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Fulfillment</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50 transition">
                    <td className="px-5 py-4 font-semibold text-stone-900">
                      {o.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-stone-900">{o.customerName}</p>
                        <p className="text-xs text-stone-400">{o.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-stone-500">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 font-semibold text-stone-900">
                      ₹{o.totalAmount}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <span className="rounded bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
                        {o.paymentMethod} • {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <span
                        className={`rounded px-2.5 py-1 font-bold ${
                          o.orderStatus === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.orderStatus === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="rounded border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#7d2034] hover:text-[#7d2034] transition"
                      >
                        Manage
                      </Link>
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
              Showing Page {meta.page} of {meta.totalPages} ({meta.total} orders)
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

export default AdminOrders;
