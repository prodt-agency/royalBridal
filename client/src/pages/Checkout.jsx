import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button/Button";
import Container from "@/components/common/Container/Container";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import useCartStore, { selectCartTotal } from "@/store/cartStore";
import { getErrorMessage } from "@/utils/apiError";
import { loadRazorpay } from "@/lib/razorpay";
const initial = {
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
  const total = useCartStore(selectCartTotal);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const checkout = await orderService.checkout({
        ...form,
        items: items.map((item) => ({
          productId: item.id,
          size: item.size,
          quantity: item.quantity,
        })),
      });
      if (form.paymentMethod === "RAZORPAY") {
        const payment = await paymentService.createOrder({
          orderId: checkout.order.id,
        });
        const Razorpay = await loadRazorpay();
        new Razorpay({
          key: payment.keyId,
          amount: Number(payment.amount) * 100,
          currency: payment.currency,
          order_id: payment.orderId,
          handler: async (response) => {
            await paymentService.verify(response);
            clear();
            navigate(`/order-success?order=${checkout.order.orderNumber}`);
          },
        }).open();
      } else {
        clear();
        navigate(`/order-success?order=${checkout.order.orderNumber}`);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };
  if (!items.length)
    return (
      <Container className="py-20">
        <EmptyState
          title="Your bag is empty"
          description="Add a piece before checking out."
        />
      </Container>
    );
  return (
    <Container className="py-12">
      <Seo
        title="Checkout | Royal Bridal"
        description="Complete your Royal Bridal order."
      />
      <h1 className="font-serif text-4xl">Checkout</h1>
      <form
        onSubmit={submit}
        className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(initial)
            .filter(
              ([name]) =>
                ![
                  "shippingMethod",
                  "paymentMethod",
                  "notes",
                  "addressLine2",
                ].includes(name),
            )
            .map(([name]) => (
              <input
                key={name}
                required={name !== "email"}
                name={name}
                value={form[name]}
                onChange={update}
                placeholder={name.replace(/([A-Z])/g, " $1")}
                className="rounded-lg border p-3"
              />
            ))}
          <input
            name="addressLine2"
            value={form.addressLine2}
            onChange={update}
            placeholder="Address line 2 (optional)"
            className="rounded-lg border p-3 sm:col-span-2"
          />
          <textarea
            name="notes"
            value={form.notes}
            onChange={update}
            placeholder="Order notes (optional)"
            className="rounded-lg border p-3 sm:col-span-2"
          />
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 font-semibold">Payment method</legend>
            <label className="mr-5">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={form.paymentMethod === "COD"}
                onChange={update}
              />{" "}
              Cash on delivery
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="RAZORPAY"
                checked={form.paymentMethod === "RAZORPAY"}
                onChange={update}
              />{" "}
              Pay online
            </label>
          </fieldset>
        </div>
        <aside className="h-fit bg-[#f5ede5] p-6">
          <h2 className="font-serif text-2xl">Order total</h2>
          <p className="mt-4 text-2xl">₹{total}</p>
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="mt-6 w-full">
            Place order
          </Button>
        </aside>
      </form>
    </Container>
  );
}
export default Checkout;
