import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Container from "@/components/common/Container/Container";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import useCartStore, { selectCartTotal } from "@/store/cartStore";
import { getImageUrl } from "@/utils/image";

function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const remove = useCartStore((state) => state.removeItem);
  const update = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartStore(selectCartTotal);

  if (!items.length) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Your shopping bag is empty"
          description="Explore our exquisite bridal collection to add your favourite pieces."
          actionText="Browse Collection"
          onAction={() => navigate("/products")}
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14 lg:py-16">
      <Seo
        title="Your Bag | Royal Bridal"
        description="Review your selected pieces in your Royal Bridal shopping bag."
      />
      <div className="flex flex-col justify-between gap-4 border-b border-[#ded5cd] pb-7 sm:flex-row sm:items-baseline">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#9b6b35]">Royal Bridal</p><h1 className="mt-2 font-serif text-4xl tracking-[-.025em] text-stone-900 sm:text-5xl">Your Shopping Bag</h1>
          <p className="mt-1 text-sm text-stone-500">
            {items.reduce((sum, i) => sum + i.quantity, 0)} {items.reduce((sum, i) => sum + i.quantity, 0) === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-[11px] font-semibold uppercase tracking-[.14em] text-stone-500 hover:text-[#7d2034] transition"
        >
          Clear All
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="divide-y divide-[#ded5cd]">
          {items.map((item) => {
            const lineTotal = Number(item.price) * item.quantity;
            return (
              <article
                className="flex gap-4 py-6 sm:gap-6 sm:py-7"
                key={`${item.id}-${item.size}`}
              >
                <Link
                  to={item.slug ? `/products/${item.slug}` : `/products`}
                  className="shrink-0 aspect-[4/5] w-24 overflow-hidden bg-[#eee4da] sm:w-28"
                >
                  {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="h-full w-full object-cover transition hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#e7d5c6]" />
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={item.slug ? `/products/${item.slug}` : `/products`}
                        className="font-serif text-lg sm:text-xl text-stone-900 hover:text-[#7d2034] transition"
                      >
                        {item.name}
                      </Link>
                      <span className="font-semibold text-stone-900 sm:text-lg">
                        ₹{lineTotal}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-3 text-sm text-stone-500">
                      {item.size && (
                        <span className="bg-[#f5ede5] px-2 py-0.5 text-xs font-medium text-stone-700">
                          Size: {item.size}
                        </span>
                      )}
                      <span>₹{item.price} each</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex min-h-10 items-center border border-stone-300">
                      <button
                        type="button"
                        onClick={() => update(item.id, item.size, item.quantity - 1)}
                        className="grid h-10 w-10 place-items-center text-stone-600 hover:text-black"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-7 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => update(item.id, item.size, item.quantity + 1)}
                        className="grid h-10 w-10 place-items-center text-stone-600 hover:text-black"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(item.id, item.size)}
                      className="inline-flex min-h-10 items-center gap-1 text-xs text-stone-500 hover:text-[#7d2034] transition"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={15} />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit border-y border-[#ded5cd] bg-[#f5ede5] p-6 sm:p-8 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl text-stone-900">Order Summary</h2>

          <div className="mt-6 space-y-3 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong className="text-base text-stone-900">₹{total}</strong>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="text-stone-500">Calculated at checkout</span>
            </div>
          </div>

          <div className="mt-6 border-t border-stone-300 pt-4 flex justify-between items-baseline">
            <span className="font-semibold text-stone-900">Estimated Total</span>
            <span className="font-serif text-2xl font-bold text-[#7d2034]">₹{total}</span>
          </div>

          <p className="mt-2 text-xs text-stone-500">Shipping is calculated at checkout.</p>

          <Link to="/checkout" className="mt-6 block">
            <Button className="w-full py-3.5 text-base flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight size={16} />
            </Button>
          </Link>

          <Link
            to="/products"
            className="mt-4 block text-center text-xs font-medium text-stone-600 hover:text-[#7d2034] underline underline-offset-4"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </Container>
  );
}

export default Cart;
