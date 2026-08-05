import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const image = product.images?.[0]?.imageUrl;
  return <article className="group"><Link to={`/products/${product.slug}`}><div className="aspect-4/5 overflow-hidden bg-[#e7d5c6]">{image ? <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="h-full bg-[radial-gradient(circle_at_50%_40%,#f8eedf,transparent_32%),linear-gradient(145deg,#cda77d,#7d2034)]" />}</div><div className="flex items-start justify-between gap-3 pt-4"><div><h3 className="font-serif text-lg text-stone-900">{product.name}</h3><p className="mt-1 text-sm text-stone-500">{product.category?.name}</p></div><ShoppingBag size={18} className="mt-1 text-[#7d2034]" /></div><p className="mt-2 text-sm font-semibold text-stone-800">₹{product.salePrice ?? product.price}</p></Link></article>;
}

export default ProductCard;
