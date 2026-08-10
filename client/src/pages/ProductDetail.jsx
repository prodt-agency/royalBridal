import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "@/components/common/Button/Button";
import Container from "@/components/common/Container/Container";
import Loader from "@/components/common/Loader/Loader";
import ProductGrid from "@/components/home/ProductGrid";
import Seo from "@/components/Seo";
import { productService } from "@/services/product.service";
import useCartStore from "@/store/cartStore";
import { getErrorMessage } from "@/utils/apiError";
function ProductDetail() {
  const { slug } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    productService
      .getProductBySlug(slug)
      .then((data) => {
        if (!live) return;
        setProduct(data);
        setSize(data.sizes?.[0]?.size ?? "");
        return productService
          .getProducts({ category: data.category?.slug, limit: 4 })
          .then((items) => ({ data, items }));
      })
      .then(
        (result) =>
          live &&
          result &&
          setRelated(
            (result.items.data ?? []).filter(
              (item) => item.id !== result.data.id,
            ),
          ),
      )
      .catch((requestError) => live && setError(getErrorMessage(requestError)));
    return () => {
      live = false;
    };
  }, [slug]);
  if (error)
    return (
      <Container className="py-20">
        <p>{error}</p>
      </Container>
    );
  if (!product) return <Loader size="lg" className="m-auto my-24" />;
  const images = product.images ?? [];
  const price = product.salePrice ?? product.price;
  return (
    <>
      <Seo
        title={`${product.name} | Royal Bridal`}
        description={product.description ?? product.name}
      />
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="aspect-4/5 bg-[#ead9cb]">
              {images[selectedImage] && (
                <img
                  src={images[selectedImage].imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="mt-3 flex gap-3">
              {images.map((image, index) => (
                <button
                  key={image.id ?? image.imageUrl}
                  onClick={() => setSelectedImage(index)}
                  className={`h-20 w-16 overflow-hidden border ${index === selectedImage ? "border-[#7d2034]" : "border-transparent"}`}
                >
                  <img
                    src={image.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          <article>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9b6b35]">
              {product.category?.name}
            </p>
            <h1 className="mt-3 font-serif text-4xl">{product.name}</h1>
            <p className="mt-5 text-2xl font-semibold">₹{price}</p>
            {product.salePrice && (
              <p className="mt-1 text-sm text-stone-500 line-through">
                ₹{product.price}
              </p>
            )}
            <p className="mt-6 leading-7 text-stone-600">
              {product.description}
            </p>
            <fieldset className="mt-7">
              <legend className="text-sm font-semibold">
                Choose your size
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes?.map((entry) => (
                  <button
                    type="button"
                    key={entry.size}
                    onClick={() => setSize(entry.size)}
                    className={`rounded-full border px-4 py-2 text-sm ${size === entry.size ? "border-[#7d2034] bg-[#7d2034] text-white" : "border-stone-300"}`}
                  >
                    {entry.size}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-7 flex gap-4">
              <div className="flex items-center rounded-full border">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="px-4 py-3"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(product.stock ?? 10, value + 1),
                    )
                  }
                  className="px-4 py-3"
                >
                  +
                </button>
              </div>
              <Button
                className="flex-1"
                disabled={!size}
                onClick={() =>
                  addItem({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price,
                    image: images[0]?.imageUrl,
                    size,
                    stock: product.stock,
                    quantity,
                  })
                }
              >
                Add to cart
              </Button>
            </div>
          </article>
        </div>
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 font-serif text-3xl">You may also love</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </Container>
    </>
  );
}
export default ProductDetail;
