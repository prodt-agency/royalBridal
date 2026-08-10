import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";

function TestCatalog() {
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();

  console.log("Products Query:", productsQuery);
  console.log("Categories Query:", categoriesQuery);

  if (
    productsQuery.isLoading ||
    categoriesQuery.isLoading
  ) {
    return <h2>Loading...</h2>;
  }

  if (productsQuery.error) {
    return <h2>Products Error</h2>;
  }

  if (categoriesQuery.error) {
    return <h2>Categories Error</h2>;
  }

  return (
    <div>
      <h1>Catalog Connected</h1>
    </div>
  );
}

export default TestCatalog;