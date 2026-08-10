import { useQuery } from "@tanstack/react-query";
import {productService} from "../services/product.service";

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(params),
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: productService.getFeaturedProducts,
  });
};

export const useLatestProducts = () => {
  return useQuery({
    queryKey: ["latest-products"],
    queryFn: productService.getLatestProducts,
  });
};

export const useProduct = (slug) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
  });
};
