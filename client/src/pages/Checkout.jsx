import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowLeft } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Container from "@/components/common/Container/Container";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import useCartStore, { selectCartTotal } from "@/store/cartStore";
import { getErrorMessage } from "@/utils/apiError";
import { loadRazorpay } from "@/lib/razorpay";
import { getImageUrl } from "@/utils/image";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
  shippingMethod: "STANDARD",
  paymentMethod: "COD",
};

function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore(selectCartTotal);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shippingCost = form.shippingMethod === "EXPRESS" ? 250 : 0;
  const grandTotal = subtotal + shippingCost;

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const orderPayload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        notes: form.notes.trim() || undefined,
        shippingMethod: form.shippingMethod,
        paymentMethod: form.paymentMethod,
        items: items.map((item) => ({
          productId: Number(item.id),
          size: item.size || "Standard",
          quantity: Number(item.quantity),
        })),
      };

      const createdOrder = await orderService.checkout(orderPayload);
      const orderId = createdOrder.id ?? createdOrder.order?.id;
      const orderNumber = createdOrder.orderNumber ?? createdOrder.order?.orderNumber;

      if (form.paymentMethod === "RAZORPAY") {
        const paymentData = await paymentService.createOrder({
          orderId,
        });

        const RazorpaySDK = await loadRazorpay();
        const razorpayInstance = new RazorpaySDK({
          key: paymentData.keyId,
          amount: Number(paymentData.amount) * 100,
          currency: paymentData.currency || "INR",
          name: "Royal Bridal",
          description: `Order #${orderNumber}`,
          order_id: paymentData.orderId,
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: "#7d2034",
          },
          handler: async (response) => {
            try {
              setLoading(true);
              await paymentService.verify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clear();
              navigate(`/order-success?order=${orderNumber}`);
            } catch (verifyErr) {
              setError(
                getErrorMessage(verifyErr) ||
                  "Payment verification failed. Please check your order status."
              );
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setError("Payment cancelled. You can retry or choose Cash on Delivery.");
            },
          },
        });

        razorpayInstance.open();
      } else {
        clear();
        navigate(`/order-success?order=${orderNumber}`);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Your bag is empty"
          description="Please add items to your shopping bag before checking out."
          actionText="Browse Collection"
          onAction={() => navigate("/products")}
        />
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <Seo
        title="Checkout | Royal Bridal"
        description="Complete your Royal Bridal order securely."
      />
      <Link
        to="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#7d2034]"
      >
        <ArrowLeft size={16} /> Back to bag
      </Link>

      <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">Checkout</h1>

      <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Contact Details */}
          <section className="rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="font-serif text-xl text-stone-900 mb-4">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Full Name *
                </label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={update}
                  placeholder="e.g. Priya Sharma"
                  className="w-full rounded-md border border-stone-300 p-3 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Phone Number *
                </label>
                <input
                  required
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-md border border-stone-300 p-3 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder="e.g. priya@example.com"
                  className="w-full rounded-md border border-stone-300 p-3 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>
            </div>
          </section>

          {/* Delivery Address */}
          <section className="rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="font-serif text-xl text-stone-900 mb-4">Delivery Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Address Line 1 *
                </label>
                <input
                  required
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={update}
                  placeholder="House/Flat No., Building Name, Street"
                  className="w-full rounded-md border border-stone-300 p-3 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Address Line 2
                </label>
                <input
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={update}
                  placeholder="Landmark, Area (optional)"
                  className="w-full rounded-md border border-stone-300 p-3 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  City *
                </label>
                <input
                  required
                  name="city"
                  value={form.city}
                  onChange={update}
                  placeholder="City"
                  className="w-full rounded-md border border-stone-300 p-3 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  State *
                </label>
                <input
                  required
                  name="state"
                  value={form.state}
                  onChange={update}
                  placeholder="State"
                  className="w-full rounded-md border border-stone-300 p-3 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Pincode *
                </label>
                <input
                  required
                  name="pincode"
                  value={form.pincode}
                  onChange={update}
                  placeholder="6-digit PIN code"
                  className="w-full rounded-md border border-stone-300 p-3 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Order Notes / Customization Request
                </label>
                <textarea
                  rows={2}
                  name="notes"
                  value={form.notes}
                  onChange={update}
                  placeholder="Any special instructions for delivery or sizing..."
                  className="w-full rounded-md border border-stone-300 p-3 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>
            </div>
          </section>

          {/* Shipping Method */}
          <section className="rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="font-serif text-xl text-stone-900 mb-4">Shipping Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  form.shippingMethod === "STANDARD"
                    ? "border-[#7d2034] bg-[#7d2034]/5"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value="STANDARD"
                  checked={form.shippingMethod === "STANDARD"}
                  onChange={update}
                  className="mt-1 accent-[#7d2034]"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium text-stone-900">
                    <Truck size={18} className="text-[#7d2034]" /> Standard Delivery
                  </div>
                  <p className="mt-1 text-xs text-stone-500">4-7 business days</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">Free</p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  form.shippingMethod === "EXPRESS"
                    ? "border-[#7d2034] bg-[#7d2034]/5"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value="EXPRESS"
                  checked={form.shippingMethod === "EXPRESS"}
                  onChange={update}
                  className="mt-1 accent-[#7d2034]"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium text-stone-900">
                    <Truck size={18} className="text-[#7d2034]" /> Express Delivery
                  </div>
                  <p className="mt-1 text-xs text-stone-500">2-3 business days</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900">₹250</p>
                </div>
              </label>
            </div>
          </section>

          {/* Payment Method */}
          <section className="rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="font-serif text-xl text-stone-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                  form.paymentMethod === "COD"
                    ? "border-[#7d2034] bg-[#7d2034]/5"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={form.paymentMethod === "COD"}
                    onChange={update}
                    className="accent-[#7d2034]"
                  />
                  <Banknote size={20} className="text-[#7d2034]" />
                  <div>
                    <span className="font-medium text-stone-900">Cash on Delivery (COD)</span>
                    <p className="text-xs text-stone-500">Pay cash upon receiving your parcel</p>
                  </div>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                  form.paymentMethod === "RAZORPAY"
                    ? "border-[#7d2034] bg-[#7d2034]/5"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={form.paymentMethod === "RAZORPAY"}
                    onChange={update}
                    className="accent-[#7d2034]"
                  />
                  <CreditCard size={20} className="text-[#7d2034]" />
                  <div>
                    <span className="font-medium text-stone-900">
                      Online Payment (UPI, Cards, NetBanking)
                    </span>
                    <p className="text-xs text-stone-500">Fast & 100% secure with Razorpay</p>
                  </div>
                </div>
                <ShieldCheck size={18} className="text-emerald-600" />
              </label>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="h-fit rounded-lg bg-[#f9f5f0] p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-stone-900">Order Summary</h2>

          <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-stone-200 pr-1">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-3 py-3 text-sm">
                <div className="h-14 w-12 shrink-0 overflow-hidden bg-stone-100">
                  {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#e7d5c6]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-stone-900">{item.name}</p>
                  <p className="text-xs text-stone-500">
                    Qty: {item.quantity} {item.size ? `• Size ${item.size}` : ""}
                  </p>
                  <p className="text-xs font-semibold text-stone-800">
                    ₹{Number(item.price) * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2.5 border-t border-stone-300 pt-4 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong className="text-stone-900">₹{subtotal}</strong>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? "font-medium text-emerald-700" : "text-stone-900"}>
                {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-stone-300 pt-4 flex justify-between items-baseline">
            <span className="font-semibold text-stone-900">Total Payable</span>
            <span className="font-serif text-2xl font-bold text-[#7d2034]">₹{grandTotal}</span>
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="mt-6 w-full py-3.5 text-base"
          >
            {form.paymentMethod === "RAZORPAY" ? "Proceed to Pay" : "Confirm Order"}
          </Button>

          <p className="mt-4 text-center text-xs text-stone-500">
            By placing your order you agree to Royal Bridal's terms and shipping policies.
          </p>
        </aside>
      </form>
    </Container>
  );
}

export default Checkout;
