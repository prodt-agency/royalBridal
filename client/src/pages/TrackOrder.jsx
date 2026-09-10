import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  PackageCheck,
  XCircle,
} from "lucide-react";
import Container from "@/components/common/Container/Container";
import Button from "@/components/common/Button/Button";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import { orderService } from "@/services/order.service";
import { getErrorMessage } from "@/utils/apiError";

const STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PROCESSING", label: "In Production", icon: Package },
  { key: "PACKED", label: "Packed", icon: PackageCheck },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

const ORDER_FLOW_INDEX = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  PACKED: 3,
  SHIPPED: 4,
  DELIVERED: 5,
};

function TrackOrder() {
  const [params, setParams] = useSearchParams();
  const [orderQuery, setOrderQuery] = useState(params.get("order") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlOrder = params.get("order");
    if (!urlOrder) return;
    let live = true;
    orderService
      .track(urlOrder.trim())
      .then((data) => {
        if (live) setOrder(data);
      })
      .catch((err) => {
        if (live) {
          setOrder(null);
          setError(
            getErrorMessage(err) ||
              "Order not found. Please check your order reference number.",
          );
        }
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [params]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderQuery.trim()) {
      setParams({ order: orderQuery.trim() });
    }
  };

  const isTerminalNegative =
    order && ["CANCELLED", "RETURNED", "REFUNDED"].includes(order.orderStatus);
  const currentStepIndex =
    order && ORDER_FLOW_INDEX[order.orderStatus] !== undefined
      ? ORDER_FLOW_INDEX[order.orderStatus]
      : 0;

  return (
    <Container className="py-14 max-w-3xl">
      <Seo
        title="Track Your Order | Royal Bridal"
        description="Track the status of your Royal Bridal order."
      />

      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-[#9b6b35]">
          Real-time status
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-stone-900">
          Track Your Order
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Enter your order reference number (e.g. RB-2026-00001) to view status
          and timeline.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex gap-3 max-w-lg mx-auto"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-3.5 text-stone-400"
          />
          <input
            required
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Enter Order Number"
            className="w-full rounded-full border border-stone-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#7d2034]"
          />
        </div>
        <Button type="submit" loading={loading} className="rounded-full px-6">
          Track
        </Button>
      </form>

      {loading && (
        <div className="mt-16 text-center">
          <Loader size="lg" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-12">
          <EmptyState
            title="Order Not Found"
            description={error}
            actionText="Browse Collection"
            onAction={() => (window.location.href = "/products")}
          />
        </div>
      )}

      {!loading && order && (
        <div className="mt-12 space-y-8">
          {/* Order Header Card */}
          <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div>
                <p className="text-xs text-stone-500 font-medium">
                  Order Number
                </p>
                <p className="text-lg font-bold font-serif text-stone-900">
                  {order.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Placed On</p>
                <p className="text-sm font-semibold text-stone-900">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Status</p>
                <span
                  className={`inline-block rounded px-3 py-1 text-xs font-bold ${
                    order.orderStatus === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-800"
                      : isTerminalNegative
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Progress Stepper */}
            {isTerminalNegative ? (
              <div className="mt-8 rounded-lg bg-red-50 p-5 flex items-center gap-4 text-red-800">
                <XCircle size={28} className="shrink-0" />
                <div>
                  <p className="font-semibold">
                    This order has been {order.orderStatus.toLowerCase()}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    If you have questions, please reach out to our bridal
                    concierge team.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-10">
                <div className="relative flex justify-between">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 h-1 w-full bg-stone-200 z-0">
                    <div
                      className="h-full bg-[#7d2034] transition-all duration-500"
                      style={{
                        width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {STEPS.map((step, index) => {
                    const isDone = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center text-center z-10"
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                            isDone
                              ? "border-[#7d2034] bg-[#7d2034] text-white"
                              : "border-stone-300 bg-white text-stone-400"
                          } ${isCurrent ? "ring-4 ring-[#7d2034]/20" : ""}`}
                        >
                          <Icon size={16} />
                        </div>
                        <span
                          className={`mt-2 text-[11px] sm:text-xs font-medium max-w-18 ${
                            isCurrent
                              ? "font-bold text-[#7d2034]"
                              : isDone
                                ? "text-stone-900"
                                : "text-stone-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline Notes if available */}
            {Array.isArray(order.timeline) && order.timeline.length > 0 && (
              <div className="mt-10 border-t border-stone-200 pt-6">
                <h3 className="text-sm font-semibold text-stone-900 mb-4">
                  Activity Timeline
                </h3>
                <ol className="relative border-l border-stone-200 ml-3 space-y-4">
                  {order.timeline.map((entry, idx) => (
                    <li key={entry.id || idx} className="mb-4 ml-6">
                      <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7d2034] text-white ring-4 ring-white">
                        <CheckCircle2 size={12} />
                      </span>
                      <p className="text-xs font-semibold text-stone-900">
                        Status updated to {entry.status}
                      </p>
                      {entry.note && (
                        <p className="text-xs text-stone-600 mt-0.5">
                          {entry.note}
                        </p>
                      )}
                      <time className="text-[10px] text-stone-400">
                        {new Date(entry.createdAt).toLocaleString("en-IN")}
                      </time>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Items Summary */}
            <div className="mt-8 border-t border-stone-200 pt-6">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">
                Order Items
              </h3>
              <div className="divide-y divide-stone-100">
                {order.orderItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium text-stone-900">
                        {item.product?.name ?? `Item #${item.productId}`}
                      </p>
                      <p className="text-xs text-stone-500">
                        Size: {item.selectedSize} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-stone-800">
                      ₹{Number(item.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between border-t border-stone-100 pt-3 text-sm font-bold text-stone-900">
                <span>Total Amount Paid</span>
                <span className="font-serif text-lg text-[#7d2034]">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default TrackOrder;
