import { Search, ShoppingBag } from "lucide-react";

function NavIcons({
  cartCount = 0,
  onSearch,
  onCart,
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        onClick={onSearch}
        aria-label="Search"
        className="grid h-11 w-11 place-items-center text-[#24181a] transition hover:text-[#7d2034]"
      >
        <Search
          size={22}
          className="transition"
        />
      </button>

      <button
        onClick={onCart}
        aria-label="Shopping Cart"
        className="relative grid h-11 w-11 place-items-center text-[#24181a] transition hover:text-[#7d2034]"
      >
        <ShoppingBag
          size={22}
          className="transition"
        />

        {cartCount > 0 && (
          <span
            className="
              absolute
              top-0
              right-0
              h-4
              w-4
              rounded-full
              bg-[#7d2034]
              text-white
              text-[10px]
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
