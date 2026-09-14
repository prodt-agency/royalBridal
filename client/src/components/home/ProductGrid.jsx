import EmptyState from "@/components/common/EmptyState/EmptyState";
import ProductCard from "@/components/home/ProductCard";

function ProductGrid({ products, loading }) {
  if (loading)
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-7 md:gap-y-10">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] animate-pulse bg-[#eee4da]" />
            <div className="mt-4 h-4 w-2/3 animate-pulse bg-[#eee4da]" />
          </div>
        ))}
      </div>
    );
  if (!products.length)
    return (
      <EmptyState
        title="Our collection is being prepared"
        description="Please return shortly to explore the latest pieces."
      />
    );
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-7 md:gap-y-12">
      <>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </>
    </div>
  );
}

export default ProductGrid;
