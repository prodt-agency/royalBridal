import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  ArrowRight,
} from "lucide-react";
import Loader from "@/components/common/Loader/Loader";
import Seo from "@/components/Seo";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const FULFILMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(() => {
    adminService
      .getDashboard()
      .then((res) => {
        setData(res);
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-sm text-red-700">
        <p className="font-semibold">Failed to load dashboard overview</p>
        <p className="mt-1 break-words">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 min-h-11 rounded bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    todayOrders = 0,
    ordersByStatus = {},
    totalCustomers = 0,
    totalProducts = 0,
    activeProducts = 0,
    lowStockProducts = 0,
    recentOrders = [],
  } = data || {};

  const statCards = [
    {
      key: "revenue",
      label: "Total Revenue",
      value: `₹${Number(totalRevenue).toLocaleString("en-IN")}`,
      hint: "All-time settled revenue",
      iconBg: "bg-emerald-50 text-emerald-600",
      icon: <IndianRupee size={20} className="shrink-0" />,
    },
    {
      key: "orders",
      label: "Today's Orders",
      value: String(todayOrders),
      hint: "Placed today",
      iconBg: "bg-[#7d2034]/10 text-[#7d2034]",
      icon: <ShoppingBag size={20} className="shrink-0" />,
    },
    {
      key: "products",
      label: "Active Products",
      value: (
        <>
          {activeProducts}{" "}
          <span className="text-sm font-normal text-stone-400">
            / {totalProducts} total
          </span>
        </>
      ),
      hint:
        lowStockProducts > 0 ? (
          <span className="font-semibold text-amber-600">
            {lowStockProducts} low stock
          </span>
        ) : null,
      iconBg: "bg-amber-50 text-amber-600",
      icon: <Package size={20} className="shrink-0" />,
    },
    {
      key: "customers",
      label: "Total Customers",
      value: String(totalCustomers),
      hint: "Registered client accounts",
      iconBg: "bg-blue-50 text-blue-600",
      icon: <Users size={20} className="shrink-0" />,
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <Seo title="Dashboard | Admin | Royal Bridal" />

      <AdminPageHeader
        title="Executive Overview"
        subtitle="Store performance, customer insights, and recent fulfillment activity."
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                {card.label}
              </span>
              <div className={`shrink-0 rounded-lg p-2 ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <p className="mt-3 font-serif text-2xl font-bold break-words text-stone-900 sm:mt-4 sm:text-3xl">
              {card.value}
            </p>
            <p className="mt-1 min-h-4 text-xs break-words text-stone-500">
              {card.hint ?? "\u00A0"}
            </p>
          </div>
        ))}
      </div>

      {/* Orders By Status Grid */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-stone-900">
          Orders by Fulfillment Status
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {FULFILMENT_STATUSES.map((status) => {
            const count = ordersByStatus[status] || 0;
            return (
              <Link
                key={status}
                to={`/admin/orders?status=${status}`}
                className="min-w-0 rounded-lg border border-stone-200 p-3 text-center transition hover:border-[#7d2034] hover:bg-stone-50"
              >
                <p className="truncate text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                  {status}
                </p>
                <p className="mt-1 text-xl font-bold text-stone-900">{count}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-4 sm:p-6">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Recent Orders
            </h2>
            <p className="text-xs text-stone-500">
              Latest customer orders across the platform
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex shrink-0 items-center gap-1 px-1 py-1.5 text-xs font-semibold text-[#7d2034] hover:underline"
          >
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="px-6 py-10 text-center text-xs text-stone-400">
            No orders placed yet.
          </p>
        ) : (
          <>
            {/* Mobile / small-screen card list */}
            <ul className="divide-y divide-stone-100 lg:hidden">
              {recentOrders.map((order) => (
                <li key={order.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="inline-block py-1 font-semibold text-stone-900"
                    >
                      {order.orderNumber}
                    </Link>
                    <AdminStatusBadge status={order.orderStatus} />
                  </div>
                  <p className="mt-1 text-sm break-words text-stone-900">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-stone-400">
                    <a
                      href={`tel:${order.phone}`}
                      className="inline-block px-1 py-1.5 hover:text-[#7d2034]"
                    >
                      {order.phone}
                    </a>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-stone-900">
                      ₹{order.totalAmount}
                    </span>
                    <span className="text-xs text-stone-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                  >
                    Manage
                  </Link>
                </li>
              ))}
            </ul>

            {/* Tablet / desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold tracking-wider text-stone-500 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Order Number</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Payment</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-stone-50">
                      <td className="px-6 py-4 font-semibold whitespace-nowrap text-stone-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="font-medium break-words text-stone-900">
                            {order.customerName}
                          </p>
                          <p className="text-xs whitespace-nowrap text-stone-400">
                            {order.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap text-stone-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-semibold whitespace-nowrap text-stone-900">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="rounded bg-stone-100 px-2 py-0.5 font-medium whitespace-nowrap text-stone-700">
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <AdminStatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
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
      </div>
    </div>
  );
}

export default AdminDashboard;