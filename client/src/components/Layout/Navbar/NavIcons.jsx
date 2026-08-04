import { Search, ShoppingBag } from "lucide-react";

function NavIcons({
  cartCount = 0,
  onSearch,
  onCart,
}) {
  return (
    <div className="flex items-center gap-5">
      <button
        onClick={onSearch}
        aria-label="Search"
      >
        <Search
          size={22}
          className="hover:text-rose-700 transition"
        />
      </button>

      <button
        onClick={onCart}
        aria-label="Shopping Cart"
        className="relative"
      >
        <ShoppingBag
          size={22}
          className="hover:text-rose-700 transition"
        />

        {cartCount > 0 && (
          <span
            className="
              absolute
              -top-2
              -right-2
              h-5
              w-5
              rounded-full
              bg-rose-700
              text-white
              text-xs
              flex
              items-center
              justify-center
            "
          >
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default NavIcons;