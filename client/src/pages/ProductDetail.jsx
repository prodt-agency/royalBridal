import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ShoppingBag, ArrowLeft } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Container from "@/components/common/Container/Container";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Loader from "@/components/common/Loader/Loader";
import ProductGrid from "@/components/home/ProductGrid";
import Seo from "@/components/Seo";
import { productService } from "@/services/product.service";
import useCartStore from "@/store/cartStore";
import { getErrorMessage } from "@/utils/apiError";
import { getImageUrl } from "@/utils/image";

function ProductDetail() {
  const { slug } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;

    productService
      .getProductBySlug(slug)
      .then((data) => {
        if (!live) return;
        setProduct(data);
        setError("");
        const initialSize = data.sizes?.[0]?.size ?? (data.sizes?.length === 0 ? "Standard" : "");
        setSize(initialSize);

        if (data.category?.slug) {
          return productService
            .getProducts({ category: data.category.slug, limit: 5 })
            .then((items) => ({ data, items }));
        }
        return { data, items: { data: [] } };
      })
      .then((result) => {
        if (live && result) {
          const list = result.items?.data ?? [];
          setRelated(list.filter((item) => item.id !== result.data.id).slice(0, 4));
        }
      })
      .catch((requestError) => {
        if (live) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Product not found"
          description={error || "We couldn't find the piece you're looking for."}
          actionText="Back to Collection"
          onAction={() => window.history.back()}
        />
      </Container>
    );
  }

  const images = product.images ?? [];
  const price = product.salePrice ?? product.price;
  const isOnSale = Boolean(product.salePrice && Number(product.salePrice) < Number(product.price));
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const currentSizeObj = hasSizes ? product.sizes.find((s) => s.size === size) : null;
  const availableStock = currentSizeObj ? currentSizeObj.stock : (product.stock ?? 0);
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    const chosenSize = hasSizes ? size : "Standard";
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(price),
      image: images[0]?.imageUrl,
      size: chosenSize,
      stock: availableStock,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <>
      <Seo
        title={`${product.name} | Royal Bridal`}
        description={product.description ?? product.name}
      />
      <Container className="py-12">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#7d2034]"
        >
          <ArrowLeft size={16} /> Back to collection
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-4/5 overflow-hidden bg-[#ead9cb]">
              {isOnSale && (
                <span className="absolute top-4 left-4 z-10 rounded bg-[#7d2034] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Sale
                </span>
              )}
              {images[selectedImage] ? (
                <img
                  src={getImageUrl(images[selectedImage].imageUrl)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full bg-[radial-gradient(circle_at_50%_40%,#f8eedf,transparent_32%),linear-gradient(145deg,#cda77d,#7d2034)]" />
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={image.id ?? image.imageUrl}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-16 overflow-hidden border-2 transition ${
                      index === selectedImage
                        ? "border-[#7d2034]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getImageUrl(image.imageUrl)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <article className="flex flex-col">
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="text-xs font-bold uppercase tracking-[.2em] text-[#9b6b35] hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-stone-900">
              {product.name}
            </h1>
            <p className="mt-1 text-xs text-stone-400">SKU: {product.sku}</p>

            <div className="mt-4 flex items-baseline gap-3">
              <p className="text-2xl sm:text-3xl font-semibold text-stone-900">
                ₹{price}
              </p>
              {isOnSale && (
                <p className="text-base text-stone-400 line-through">
                  ₹{product.price}
                </p>
              )}
            </div>

            {product.description && (
              <p className="mt-6 leading-7 text-stone-600">
                {product.description}
              </p>
            )}

            {hasSizes && (
              <fieldset className="mt-7">
                <div className="flex items-center justify-between">
                  <legend className="text-sm font-semibold text-stone-900">
                    Select Size
                  </legend>
                  {currentSizeObj && (
                    <span className="text-xs text-stone-500">
                      {currentSizeObj.stock > 0
                        ? `${currentSizeObj.stock} in stock`
                        : "Out of stock"}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((entry) => {
                    const isSelected = size === entry.size;
                    const out = entry.stock <= 0;
                    return (
                      <button
                        type="button"
                        key={entry.size}
                        disabled={out}
                        onClick={() => setSize(entry.size)}
                        className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                          isSelected
                            ? "border-[#7d2034] bg-[#7d2034] text-white"
                            : out
                            ? "border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed line-through"
                            : "border-stone-300 bg-white text-stone-800 hover:border-stone-400"
                        }`}
                      >
                        {entry.size}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="flex w-fit items-center rounded-full border border-stone-300">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="px-4 py-3 text-lg font-medium text-stone-700 hover:text-black disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-8 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(Math.min(availableStock, 10), value + 1)
                    )
                  }
                  className="px-4 py-3 text-lg font-medium text-stone-700 hover:text-black disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <Button
                className="flex-1 py-3 text-base"
                disabled={isOutOfStock || (hasSizes && !size)}
                onClick={handleAddToCart}
              >
                {added ? (
                  <span className="inline-flex items-center gap-2">
                    <Check size={18} /> Added to bag
                  </span>
                ) : isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBag size={18} /> Add to bag
                  </span>
                )}
              </Button>
            </div>
          </article>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-stone-200 pt-16">
            <h2 className="mb-8 font-serif text-3xl text-stone-900">
              You may also love
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </Container>
    </>
  );
}

export default ProductDetail;
