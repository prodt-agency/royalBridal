import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import {
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/adminUi";
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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

      <AdminPageHeader
        title="Order Management"
        subtitle="Track customer orders, fulfillment workflow, shipments, and payment captures."
      />

      {/* Filter Bar */}
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative min-w-0 sm:col-span-1">
          <Search size={16} className="absolute top-3 left-3.5 text-stone-400" />
          <input
            value={params.get("search") ?? ""}
            onChange={(e) => updateParams({ search: e.target.value })}
            placeholder="Search order #, customer..."
            className={`${adminInputClass} pl-10`}
          />
        </div>

        <select
          value={params.get("status") ?? ""}
          onChange={(e) => updateParams({ status: e.target.value })}
          aria-label="Filter by fulfillment status"
          className={adminSelectClass}
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
          aria-label="Filter by payment status"
          className={adminSelectClass}
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
          aria-label="Filter by payment method"
          className={adminSelectClass}
        >
          <option value="">All Methods</option>
          <option value="COD">Cash on Delivery (COD)</option>
          <option value="RAZORPAY">Razorpay Online</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-4 sm:p-8">
            <EmptyState
              title="Unable to load orders"
              description={error}
              actionText="Retry"
              onAction={loadOrders}
            />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-4 sm:p-8">
            <EmptyState
              title="No orders found"
              description="No customer orders match the selected filters."
            />
          </div>
        ) : (
          <>
            {/* Mobile / small-screen card list */}
            <ul className="divide-y divide-stone-100 lg:hidden">
              {orders.map((o) => (
                <li key={o.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="inline-block py-1 font-semibold text-stone-900"
                    >
                      {o.orderNumber}
                    </Link>
                    <AdminStatusBadge status={o.orderStatus} />
                  </div>

                  <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="text-sm break-words text-stone-900">
                      {o.customerName}
                    </p>
                    <p className="text-sm font-semibold whitespace-nowrap text-stone-900">
                      ₹{o.totalAmount}
                    </p>
                  </div>

                  <p className="text-xs text-stone-400">
                    <a
                      href={`tel:${o.phone}`}
                      className="inline-block px-1 py-1.5 hover:text-[#7d2034]"
                    >
                      {o.phone}
                    </a>
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-stone-500">
                      {formatDate(o.createdAt)}
                    </span>
                    <span className="rounded bg-stone-100 px-2 py-0.5 font-medium whitespace-nowrap text-stone-700">
                      {o.paymentMethod} • {o.paymentStatus}
                    </span>
                  </div>

                  <Link
                    to={`/admin/orders/${o.id}`}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                  >
                    Manage Order
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold tracking-wider text-stone-500 uppercase">
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
                    <tr key={o.id} className="transition hover:bg-stone-50">
                      <td className="px-5 py-4 font-semibold whitespace-nowrap text-stone-900">
                        {o.orderNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-medium break-words text-stone-900">
                            {o.customerName}
                          </p>
                          <p className="text-xs whitespace-nowrap text-stone-400">
                            {o.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap text-stone-500">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-5 py-4 font-semibold whitespace-nowrap text-stone-900">
                        ₹{o.totalAmount}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span className="rounded bg-stone-100 px-2 py-0.5 font-medium whitespace-nowrap text-stone-700">
                          {o.paymentMethod} • {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <AdminStatusBadge status={o.orderStatus} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="inline-block rounded border border-stone-300 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-stone-700 transition hover:border-[#7d2034] hover:text-[#7d2034]"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && (
          <AdminPagination
            meta={meta}
            noun="orders"
            onPrev={() => updateParams({ page: String(page - 1) })}
            onNext={() => updateParams({ page: String(page + 1) })}
          />
        )}
      </div>
    </div>
  );
}

export default AdminOrders;