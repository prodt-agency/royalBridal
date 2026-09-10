import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";

const STATUS_OPTIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED", "REFUNDED"],
  CANCELLED: [],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
};

function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = useCallback(() => {
    adminService
      .getOrder(id)
      .then((data) => {
        setOrder(data);
        const nextAvailable = STATUS_OPTIONS[data.orderStatus] || [];
        setNewStatus(nextAvailable[0] || "");
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    setTransitioning(true);
    try {
      await adminService.updateOrderStatus(id, {
        status: newStatus,
        note: note.trim() || undefined,
      });
      setNote("");
      loadOrder();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setTransitioning(false);
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      await adminService.cancelOrder(id, {
        note: cancelReason.trim() || "Order cancelled by admin",
      });
      setCancelModal(false);
      setCancelReason("");
      loadOrder();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order Not Found"
        description={error || "The requested order could not be retrieved."}
        actionText="Back to Orders"
        onAction={() => window.history.back()}
      />
    );
  }

  const availableNext = STATUS_OPTIONS[order.orderStatus] || [];

  return (
    <div className="max-w-5xl space-y-6">
      <Seo title={`Order ${order.orderNumber} | Admin | Royal Bridal`} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="rounded-full border border-stone-300 p-2 text-stone-600 hover:bg-stone-100"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {order.orderNumber}
              </h1>
              <span
                className={`rounded px-2.5 py-1 text-xs font-bold ${
                  order.orderStatus === "DELIVERED"
                    ? "bg-emerald-100 text-emerald-800"
                    : order.orderStatus === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {order.orderStatus !== "CANCELLED" && (
          <button
            type="button"
            onClick={() => setCancelModal(true)}
            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Cancel Order
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Order Items */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-stone-900 mb-4">
              Ordered Items ({order.orderItems?.length || 0})
            </h2>

            <div className="divide-y divide-stone-100">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3.5 text-sm">
                  <div>
                    <p className="font-medium text-stone-900">
                      {item.product?.name ?? `Product #${item.productId}`}
                    </p>
                    <p className="text-xs text-stone-500">
                      Size: <span className="font-semibold text-stone-700">{item.selectedSize}</span> • Qty: {item.quantity} • Unit: ₹{item.price}
                    </p>
                  </div>
                  <span className="font-semibold text-stone-900">
                    ₹{Number(item.price) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-stone-200 pt-4 space-y-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Shipping ({order.shippingMethod})</span>
                <span>{Number(order.shippingAmount) === 0 ? "FREE" : `₹${order.shippingAmount}`}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 text-base border-t border-stone-100 pt-2">
                <span>Total Amount</span>
                <span className="font-serif text-xl text-[#7d2034]">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-stone-900 mb-3">
                Customer Information
              </h3>
              <div className="text-xs space-y-1.5 text-stone-600">
                <p>
                  <strong className="text-stone-800">Name:</strong> {order.customerName}
                </p>
                <p>
                  <strong className="text-stone-800">Phone:</strong> {order.phone}
                </p>
                <p>
                  <strong className="text-stone-800">Email:</strong> {order.email || "—"}
                </p>
                {order.notes && (
                  <p className="pt-2 text-amber-800 bg-amber-50 p-2 rounded">
                    <strong>Note:</strong> {order.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-stone-900 mb-3">
                Shipping Address
              </h3>
              <div className="text-xs space-y-1 text-stone-600">
                <p>{order.addressLine1}</p>
                {order.addressLine2 && <p>{order.addressLine2}</p>}
                <p>
                  {order.city}, {order.state} - {order.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-base font-bold text-stone-900 mb-4">
              Status Activity Log
            </h3>
            {Array.isArray(order.timeline) && order.timeline.length > 0 ? (
              <ol className="relative border-l border-stone-200 ml-3 space-y-4">
                {order.timeline.map((item, idx) => (
                  <li key={item.id || idx} className="mb-4 ml-6">
                    <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7d2034] text-white ring-4 ring-white">
                      <CheckCircle2 size={12} />
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-stone-900">
                        {item.status}
                      </p>
                      {item.admin && (
                        <span className="text-[10px] text-stone-400">
                          by {item.admin.name}
                        </span>
                      )}
                    </div>
                    {item.note && (
                      <p className="text-xs text-stone-600 mt-0.5">{item.note}</p>
                    )}
                    <time className="text-[10px] text-stone-400">
                      {new Date(item.createdAt).toLocaleString("en-IN")}
                    </time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-stone-400">No activity recorded yet.</p>
            )}
          </div>
        </div>

        {/* Right Sidebar: Status Transition & Payment Info */}
        <div className="space-y-6">
          {/* Transition Form */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-base font-bold text-stone-900 mb-4">
              Update Fulfillment Status
            </h3>

            {availableNext.length === 0 ? (
              <p className="text-xs text-stone-500">
                This order is in a terminal state ({order.orderStatus}). No further transitions allowed.
              </p>
            ) : (
              <form onSubmit={handleStatusChange} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                    Next Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-md border border-stone-300 p-2 text-xs outline-none focus:border-[#7d2034]"
                  >
                    {availableNext.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                    Timeline Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Courier tracking # or dispatch info"
                    className="w-full rounded-md border border-stone-300 p-2 text-xs outline-none focus:border-[#7d2034]"
                  />
                </div>

                <Button
                  type="submit"
                  loading={transitioning}
                  className="w-full py-2 text-xs font-semibold"
                >
                  Apply Status Update
                </Button>
              </form>
            )}
          </div>

          {/* Payment Card */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-base font-bold text-stone-900 mb-3">
              Payment Details
            </h3>
            <div className="text-xs space-y-2 text-stone-600">
              <div className="flex justify-between">
                <span>Method</span>
                <strong className="text-stone-900">{order.paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span
                  className={`font-semibold ${
                    order.paymentStatus === "PAID" ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.payment?.razorpayPaymentId && (
                <div className="pt-2 border-t border-stone-100">
                  <p className="text-stone-400">Razorpay Payment ID</p>
                  <p className="font-mono text-[11px] text-stone-800">
                    {order.payment.razorpayPaymentId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="font-serif text-lg font-bold text-red-700">Cancel Order</h2>
            <p className="text-xs text-stone-600">
              Are you sure you want to cancel order #{order.orderNumber}? Any reserved stock will be automatically released.
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer requested cancellation / address unreachable"
                  className="w-full rounded-md border border-stone-300 p-2.5 text-xs outline-none focus:border-red-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModal(false)}
                  className="rounded border border-stone-300 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="rounded bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderDetail;
