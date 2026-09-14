import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/utils/image";

function ProductCard({ product }) {
  const image = product.images?.[0]?.imageUrl;
  const price = product.salePrice ?? product.price;
  const isOnSale = Boolean(
    product.salePrice && Number(product.salePrice) < Number(product.price),
  );

  return (
    <article className="group">
      <Link
        to={`/products/${product.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7d2034]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eee4da]">
          {isOnSale && (
            <span className="absolute top-3 left-3 z-10 bg-[#7d2034] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-white">
              Sale
            </span>
          )}
          {image ? (
            <img
              src={getImageUrl(image)}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
            />
          ) : (
            <div className="h-full bg-[radial-gradient(circle_at_50%_40%,#f8eedf,transparent_32%),linear-gradient(145deg,#cda77d,#7d2034)]" />
          )}
        </div>
        <div className="flex items-start justify-between gap-3 pt-4">
          <div>
            {product.category?.name && (
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9b6b35]">
                {product.category.name}
              </p>
            )}
            <h3 className="mt-1 min-h-[2.5rem] font-serif text-lg leading-tight text-stone-900 transition group-hover:text-[#7d2034] sm:text-xl">
              {product.name}
            </h3>
          </div>
          <ShoppingBag size={16} className="mt-1 shrink-0 text-[#7d2034]" aria-hidden="true" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-sm font-semibold text-[#24181a]">₹{price}</p>
          {isOnSale && (
            <p className="text-xs text-stone-400 line-through">
              ₹{product.price}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
