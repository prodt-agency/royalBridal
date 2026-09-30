import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import AdminModal from "@/components/admin/AdminModal";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import {
  adminCardClass,
  adminDestructiveActionClass,
  adminFieldLabel,
  adminPrimaryActionClass,
  adminSecondaryActionClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/adminUi";
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

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/admin/orders"
            aria-label="Back to orders"
            className="shrink-0 rounded-full border border-stone-300 p-3 text-stone-600 hover:bg-stone-100"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="font-serif text-2xl font-bold break-all text-stone-900 sm:text-3xl">
                {order.orderNumber}
              </h1>
              <AdminStatusBadge status={order.orderStatus} />
            </div>
            <p className="mt-1 text-xs break-words text-stone-500">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {order.orderStatus !== "CANCELLED" && (
          <button
            type="button"
            onClick={() => setCancelModal(true)}
            className={`${adminDestructiveActionClass} w-full sm:w-auto`}
          >
            Cancel Order
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Column */}
        <div className="min-w-0 space-y-6">
          {/* Order Items */}
          <div className={adminCardClass}>
            <h2 className="mb-4 font-serif text-lg font-bold text-stone-900">
              Ordered Items ({order.orderItems?.length || 0})
            </h2>

            <ul className="divide-y divide-stone-100">
              {(order.orderItems ?? []).map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-3.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium break-words text-stone-900">
                      {item.product?.name ?? `Product #${item.productId}`}
                    </p>
                    <p className="text-xs break-words text-stone-500">
                      Size:{" "}
                      <span className="font-semibold text-stone-700">
                        {item.selectedSize}
                      </span>{" "}
                      • Qty: {item.quantity} • Unit: ₹{item.price}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold whitespace-nowrap text-stone-900">
                    ₹{Number(item.price) * item.quantity}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm text-stone-600">
              <div className="flex justify-between gap-3">
                <span className="min-w-0 break-words">
                  Shipping ({order.shippingMethod})
                </span>
                <span className="shrink-0 whitespace-nowrap">
                  {Number(order.shippingAmount) === 0
                    ? "FREE"
                    : `₹${order.shippingAmount}`}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-stone-100 pt-2 text-base font-bold text-stone-900">
                <span>Total Amount</span>
                <span className="font-serif text-xl whitespace-nowrap text-[#7d2034]">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className={`${adminCardClass} min-w-0`}>
              <h3 className="mb-3 font-serif text-base font-bold text-stone-900">
                Customer Information
              </h3>
              <div className="space-y-1.5 text-xs text-stone-600">
                <p className="break-words">
                  <strong className="text-stone-800">Name:</strong>{" "}
                  {order.customerName}
                </p>
                <p className="break-all">
                  <strong className="text-stone-800">Phone:</strong>{" "}
                  <a
                    href={`tel:${order.phone}`}
                    className="inline-block px-1 py-1.5 text-[#7d2034]"
                  >
                    {order.phone}
                  </a>
                </p>
                <p className="break-all">
                  <strong className="text-stone-800">Email:</strong>{" "}
                  {order.email || "—"}
                </p>
                {order.notes && (
                  <p className="rounded bg-amber-50 p-2 pt-2 break-words text-amber-800">
                    <strong>Note:</strong> {order.notes}
                  </p>
                )}
              </div>
            </div>

            <div className={`${adminCardClass} min-w-0`}>
              <h3 className="mb-3 font-serif text-base font-bold text-stone-900">
                Shipping Address
              </h3>
              <address className="space-y-1 text-xs break-words text-stone-600 not-italic">
                <p>{order.addressLine1}</p>
                {order.addressLine2 && <p>{order.addressLine2}</p>}
                <p>
                  {order.city}, {order.state} - {order.pincode}
                </p>
              </address>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className={adminCardClass}>
            <h3 className="mb-4 font-serif text-base font-bold text-stone-900">
              Status Activity Log
            </h3>
            {Array.isArray(order.timeline) && order.timeline.length > 0 ? (
              <ol className="relative ml-3 space-y-4 border-l border-stone-200">
                {order.timeline.map((item, idx) => (
                  <li key={item.id || idx} className="mb-4 ml-6">
                    <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7d2034] text-white ring-4 ring-white">
                      <CheckCircle2 size={12} />
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold text-stone-900">
                        {item.status}
                      </p>
                      {item.admin && (
                        <span className="text-[10px] break-words text-stone-400">
                          by {item.admin.name}
                        </span>
                      )}
                    </div>
                    {item.note && (
                      <p className="mt-0.5 text-xs break-words text-stone-600">
                        {item.note}
                      </p>
                    )}
                    <time className="text-[10px] break-words text-stone-400">
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
        <div className="min-w-0 space-y-6">
          {/* Transition Form */}
          <div className={adminCardClass}>
            <h3 className="mb-4 font-serif text-base font-bold text-stone-900">
              Update Fulfillment Status
            </h3>

            {availableNext.length === 0 ? (
              <p className="text-xs break-words text-stone-500">
                This order is in a terminal state ({order.orderStatus}). No
                further transitions allowed.
              </p>
            ) : (
              <form onSubmit={handleStatusChange} className="space-y-3">
                <div>
                  <label htmlFor="next-status" className={adminFieldLabel}>
                    Next Status
                  </label>
                  <select
                    id="next-status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className={adminSelectClass}
                  >
                    {availableNext.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status-note" className={adminFieldLabel}>
                    Timeline Note (Optional)
                  </label>
                  <textarea
                    id="status-note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Courier tracking # or dispatch info"
                    className={adminTextareaClass}
                  />
                </div>

                <Button type="submit" loading={transitioning} className="w-full py-2 text-xs font-semibold">
                  Apply Status Update
                </Button>
              </form>
            )}
          </div>

          {/* Payment Card */}
          <div className={adminCardClass}>
            <h3 className="mb-3 font-serif text-base font-bold text-stone-900">
              Payment Details
            </h3>
            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between gap-3">
                <span>Method</span>
                <strong className="break-all text-stone-900">
                  {order.paymentMethod}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>Status</span>
                <span
                  className={`font-semibold ${
                    order.paymentStatus === "PAID"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.payment?.razorpayPaymentId && (
                <div className="border-t border-stone-100 pt-2">
                  <p className="text-stone-400">Razorpay Payment ID</p>
                  <p className="font-mono text-[11px] break-all text-stone-800">
                    {order.payment.razorpayPaymentId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <AdminModal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        labelledBy="cancel-order-title"
        title="Cancel Order"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setCancelModal(false)}
              className={adminSecondaryActionClass}
            >
              Keep Order
            </button>
            <button
              type="submit"
              form="cancel-order-form"
              disabled={cancelling}
              className={`${adminPrimaryActionClass} !bg-red-700 hover:!bg-red-800`}
            >
              {cancelling ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        }
      >
        <p className="mb-4 text-xs break-words text-stone-600">
          Are you sure you want to cancel order #{order.orderNumber}? Any
          reserved stock will be automatically released.
        </p>

        <form id="cancel-order-form" onSubmit={handleCancelOrder} className="space-y-4">
          <div>
            <label htmlFor="cancel-reason" className={adminFieldLabel}>
              Reason for Cancellation
            </label>
            <textarea
              id="cancel-reason"
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation / address unreachable"
              className={`${adminTextareaClass} focus:border-red-700`}
            />
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

export default AdminOrderDetail;