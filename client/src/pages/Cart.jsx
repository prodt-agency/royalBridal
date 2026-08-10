import { Link } from "react-router-dom";
import Button from "@/components/common/Button/Button";
import Container from "@/components/common/Container/Container";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import useCartStore, { selectCartTotal } from "@/store/cartStore";
function Cart() {
  const items = useCartStore((state) => state.items);
  const remove = useCartStore((state) => state.removeItem);
  const update = useCartStore((state) => state.updateQuantity);
  const total = useCartStore(selectCartTotal);
  if (!items.length)
    return (
      <Container className="py-20">
        <EmptyState
          title="Your bag is waiting"
          description="Add something beautiful to begin."
          actionText="Browse collection"
          onAction={() => {
            window.location.href = "/products";
          }}
        />
      </Container>
    );
  return (
    <Container className="py-12">
      <Seo
        title="Your Bag | Royal Bridal"
        description="Review your Royal Bridal bag."
      />
      <h1 className="font-serif text-4xl">Your bag</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y">
          {items.map((item) => (
            <article
              className="flex gap-4 py-5"
              key={`${item.id}-${item.size}`}
            >
              <img
                src={item.image}
                alt=""
                className="h-28 w-24 bg-stone-100 object-cover"
              />
              <div className="flex-1">
                <h2 className="font-serif text-xl">{item.name}</h2>
                <p className="text-sm text-stone-500">Size {item.size}</p>
                <p className="mt-2">₹{item.price}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() =>
                      update(item.id, item.size, item.quantity - 1)
                    }
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      update(item.id, item.size, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                  <button
                    onClick={() => remove(item.id, item.size)}
                    className="ml-3 text-sm underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="h-fit bg-[#f5ede5] p-6">
          <h2 className="font-serif text-2xl">Order summary</h2>
          <div className="mt-5 flex justify-between">
            <span>Subtotal</span>
            <strong>₹{total}</strong>
          </div>
          <p className="mt-3 text-sm text-stone-500">
            Shipping is calculated at checkout.
          </p>
          <Link to="/checkout">
            <Button className="mt-6 w-full">Checkout</Button>
          </Link>
        </aside>
      </div>
    </Container>
  );
}
export default Cart;
