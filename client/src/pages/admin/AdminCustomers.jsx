import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import AdminModal from "@/components/admin/AdminModal";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  adminInputClass,
  adminSecondaryActionClass,
} from "@/components/admin/adminUi";
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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

  const goToPage = (value) => {
    const next = new URLSearchParams(params);
    next.set("page", String(value));
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

      <AdminPageHeader
        title="Customer Management"
        subtitle="View registered brides, contact details, and their purchase history."
      />

      {/* Search Bar */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md min-w-0">
          <Search size={16} className="absolute top-3 left-3.5 text-stone-400" />
          <input
            value={params.get("search") ?? ""}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search by customer name, phone, email..."
            className={`${adminInputClass} pl-10`}
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-4 sm:p-8">
            <EmptyState
              title="Unable to load customers"
              description={error}
              actionText="Retry"
              onAction={loadCustomers}
            />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-4 sm:p-8">
            <EmptyState
              title="No customers found"
              description="No registered clients match the search criteria."
            />
          </div>
        ) : (
          <>
            {/* Mobile / small-screen card list */}
            <ul className="divide-y divide-stone-100 lg:hidden">
              {customers.map((c) => (
                <li key={c.id} className="p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7d2034]/10 text-xs font-bold text-[#7d2034]">
                      {c.name?.slice(0, 1) || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold break-words text-stone-900">
                        {c.name}
                      </p>                      <a
                        href={`tel:${c.phone}`}
                        className="inline-block break-all px-1 py-1 text-[#7d2034] underline-offset-2 hover:underline"
                      >
                        {c.phone}
                      </a>
                    </div>
                  </div>

                  <p className="mt-1.5 text-xs break-all text-stone-600">
                    {c.email || "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Registered {formatDate(c.createdAt)}
                  </p>

                  <button
                    type="button"
                    onClick={() => openCustomerOrders(c)}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                  >
                    View Orders
                  </button>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold tracking-wider text-stone-500 uppercase">
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
                    <tr key={c.id} className="transition hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7d2034]/10 text-xs font-bold text-[#7d2034]">
                            {c.name?.slice(0, 1) || "U"}
                          </div>
                          <span className="font-semibold break-words text-stone-900">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap text-stone-600">
                        <a href={`tel:${c.phone}`} className="hover:text-[#7d2034]">
                          {c.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-xs break-all text-stone-600">
                        {c.email || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap text-stone-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openCustomerOrders(c)}
                          className="inline-block rounded border border-stone-300 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-stone-700 transition hover:border-[#7d2034] hover:text-[#7d2034]"
                        >
                          View Orders
                        </button>
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
            noun="customers"
            onPrev={() => goToPage(page - 1)}
            onNext={() => goToPage(page + 1)}
          />
        )}
      </div>

      {/* Orders History Modal */}
      <AdminModal
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        size="lg"
        labelledBy="customer-orders-title"
        title={`${selectedCustomer?.name ?? ""}'s Orders`}
        description={
          selectedCustomer
            ? `${selectedCustomer.phone} • ${selectedCustomer.email || "No email"}`
            : ""
        }
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className={adminSecondaryActionClass}
            >
              Close
            </button>
          </div>
        }
      >
        {ordersLoading ? (
          <div className="py-12 text-center">
            <Loader />
          </div>
        ) : customerOrders.length === 0 ? (
          <p className="py-8 text-center text-xs text-stone-400">
            No orders recorded for this customer yet.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {customerOrders.map((o) => (
              <li
                key={o.id}
                className="flex flex-col gap-2 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <div className="min-w-0">
                  <p className="font-bold break-words text-stone-900">
                    {o.orderNumber}
                  </p>
                  <p className="text-stone-400">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")} •{" "}
                    {o.paymentMethod}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span className="font-bold whitespace-nowrap text-stone-800">
                    ₹{o.totalAmount}
                  </span>
                  <span className="rounded bg-stone-100 px-2 py-0.5 font-semibold whitespace-nowrap text-stone-700">
                    {o.orderStatus}
                  </span>
                  <Link
                    to={`/admin/orders/${o.id}`}
                    onClick={() => setSelectedCustomer(null)}
                    className="font-semibold text-[#7d2034] hover:underline"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminModal>
    </div>
  );
}

export default AdminCustomers;