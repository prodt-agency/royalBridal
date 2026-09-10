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
      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-4/5 overflow-hidden bg-[#e7d5c6]">
          {isOnSale && (
            <span className="absolute top-2 left-2 z-10 rounded bg-[#7d2034] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              Sale
            </span>
          )}
          {image ? (
            <img
              src={getImageUrl(image)}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full bg-[radial-gradient(circle_at_50%_40%,#f8eedf,transparent_32%),linear-gradient(145deg,#cda77d,#7d2034)]" />
          )}
        </div>
        <div className="flex items-start justify-between gap-3 pt-4">
          <div>
            <h3 className="font-serif text-lg text-stone-900 transition group-hover:text-[#7d2034]">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              {product.category?.name}
            </p>
          </div>
          <ShoppingBag size={18} className="mt-1 shrink-0 text-[#7d2034]" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-sm font-semibold text-stone-800">₹{price}</p>
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
