import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Truck, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Container from "@/components/common/Container/Container";
import Loader from "@/components/common/Loader/Loader";
import Seo from "@/components/Seo";
import { orderService } from "@/services/order.service";

function OrderSuccess() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));

  useEffect(() => {
    if (!orderNumber) return;
    let live = true;
    orderService
      .track(orderNumber)
      .then((data) => {
        if (live) setOrder(data);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [orderNumber]);

  return (
    <Container className="py-16 max-w-3xl">
      <Seo
        title="Order Confirmed | Royal Bridal"
        description="Your Royal Bridal order is confirmed."
      />

      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={36} />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[.25em] text-[#9b6b35]">
          Thank you for choosing Royal Bridal
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-stone-900">
          Your order is confirmed!
        </h1>
        {orderNumber && (
          <p className="mt-3 text-stone-600">
            Order Reference: <strong className="text-[#7d2034]">{orderNumber}</strong>
          </p>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader />
        </div>
      ) : order ? (
        <div className="mt-10 rounded-lg border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
            <div>
              <p className="text-xs font-medium text-stone-500">Order Date</p>
              <p className="text-sm font-semibold text-stone-900">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">Payment</p>
              <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-800">
                {order.paymentMethod} • {order.paymentStatus}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">Order Status</p>
              <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-stone-100 py-4">
            {order.orderItems?.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 text-sm">
                <div>
                  <p className="font-medium text-stone-900">
                    {item.product?.name ?? `Product #${item.productId}`}
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

          {/* Delivery & Total */}
          <div className="border-t border-stone-200 pt-4 space-y-2 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Shipping ({order.shippingMethod})</span>
              <span>{Number(order.shippingAmount) === 0 ? "FREE" : `₹${order.shippingAmount}`}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-stone-900 border-t border-stone-100 pt-2">
              <span>Total Amount</span>
              <span className="font-serif text-xl text-[#7d2034]">₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-[#f9f5f0] p-4 text-xs text-stone-700">
            <p className="font-semibold text-stone-900">Delivery Address</p>
            <p className="mt-1">
              {order.customerName} • {order.phone}
            </p>
            <p>
              {order.addressLine1}
              {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city}, {order.state} - {order.pincode}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        {orderNumber && (
          <Link to={`/track-order?order=${orderNumber}`}>
            <Button variant="secondary" className="border border-stone-300">
              <Truck size={16} className="mr-2" /> Track Order Status
            </Button>
          </Link>
        )}
        <Link to="/products">
          <Button className="flex items-center gap-2">
            Continue Shopping <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </Container>
  );
}

export default OrderSuccess;
