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
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";

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
        <p className="mt-1">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 rounded bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
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

  return (
    <div className="space-y-8">
      <Seo title="Dashboard | Admin | Royal Bridal" />

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Executive Overview
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-500">
          Store performance, customer insights, and recent fulfillment activity.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Revenue
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <IndianRupee size={20} />
            </div>
          </div>
          <p className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            ₹{Number(totalRevenue).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-stone-500">All-time settled revenue</p>
        </div>

        {/* Orders Today */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Today's Orders
            </span>
            <div className="rounded-lg bg-[#7d2034]/10 p-2 text-[#7d2034]">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            {todayOrders}
          </p>
          <p className="mt-1 text-xs text-stone-500">Placed today</p>
        </div>

        {/* Products */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Active Products
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Package size={20} />
            </div>
          </div>
          <p className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            {activeProducts}{" "}
            <span className="text-sm font-normal text-stone-400">/ {totalProducts} total</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
            {lowStockProducts > 0 && (
              <span className="font-semibold text-amber-600">
                {lowStockProducts} low stock
              </span>
            )}
          </div>
        </div>

        {/* Customers */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Customers
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users size={20} />
            </div>
          </div>
          <p className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            {totalCustomers}
          </p>
          <p className="mt-1 text-xs text-stone-500">Registered client accounts</p>
        </div>
      </div>

      {/* Orders By Status Grid */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-stone-900 mb-4">
          Orders by Fulfillment Status
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "PACKED",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
            "RETURNED",
          ].map((status) => {
            const count = ordersByStatus[status] || 0;
            return (
              <Link
                key={status}
                to={`/admin/orders?status=${status}`}
                className="rounded-lg border border-stone-200 p-3 text-center transition hover:border-[#7d2034] hover:bg-stone-50"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 truncate">
                  {status}
                </p>
                <p className="mt-1 text-xl font-bold text-stone-900">{count}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 p-6">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">Recent Orders</h2>
            <p className="text-xs text-stone-500">Latest customer orders across the platform</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#7d2034] hover:underline"
          >
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase font-semibold text-stone-500 tracking-wider">
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
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-stone-400">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition">
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-stone-900">{order.customerName}</p>
                        <p className="text-xs text-stone-400">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="rounded bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span
                        className={`rounded px-2.5 py-1 font-bold ${
                          order.orderStatus === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.orderStatus === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="rounded border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 hover:border-[#7d2034] hover:text-[#7d2034] transition"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
