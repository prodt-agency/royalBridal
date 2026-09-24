import { ConflictError, NotFoundError } from "../utils/app-error.js";
import { catalogRepository } from "../repositories/catalog.repository.js";
import { createSlug } from "../utils/slug.js";
import { getPagination, paginated } from "../utils/pagination.js";
import { storage } from "./storage/storage.service.js";
import { logger } from "../utils/logger.js";

const categoryData = (data) => ({
  ...data,
  ...(data.name ? { slug: createSlug(data.name) } : {}),
});
const uniqueSlug = async (name, currentId) => {
  const base = createSlug(name);
  let suffix = 1;
  let slug = base;
  while (true) {
    const found = await catalogRepository.findProductBySlug(slug);
    if (!found || found.id === currentId) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
};
const ensureSku = async (sku, currentId) => {
  const found = await catalogRepository.findProductBySku(sku);
  if (found && found.id !== currentId)
    throw new ConflictError("SKU is already in use.");
};
const productData = async (data, currentId) => {
  const { images, sizes, ...product } = data;
  const base = {
    ...product,
    ...(product.name
      ? { slug: await uniqueSlug(product.name, currentId) }
      : {}),
  };
  if (images)
    base.images = currentId
      ? { deleteMany: {}, create: images }
      : { create: images };
  if (sizes)
    base.sizes = currentId
      ? { deleteMany: {}, create: sizes }
      : { create: sizes };
  return base;
};
const productWhere = (query) => {
  const where = {
    deletedAt: null,
    active: query.active === undefined ? true : query.active,
  };
  if (query.search)
    where.OR = ["name", "sku", "description"].map((field) => ({
      [field]: { contains: query.search },
    }));
  if (query.category) where.category = { slug: query.category };
  if (query.featured !== undefined) where.featured = query.featured;
  if (query.minPrice !== undefined || query.maxPrice !== undefined)
    where.price = {
      ...(query.minPrice !== undefined && { gte: query.minPrice }),
      ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
    };
  if (query.size) where.sizes = { some: { size: query.size } };
  return where;
};
const sort = (query) => ({ [query.sort]: query.order });
const deleteRemovedCloudinaryImages = async (previousImages, nextImages) => {
  const retainedIds = new Set(
    (nextImages ?? []).map((image) => image.cloudinaryPublicId).filter(Boolean),
  );
  const removedIds = previousImages
    .map((image) => image.cloudinaryPublicId)
    .filter((publicId) => publicId && !retainedIds.has(publicId));
  await Promise.all(
    removedIds.map(async (publicId) => {
      try {
        await storage.delete(publicId);
      } catch (error) {
        // The database update already succeeded; log the orphan for manual cleanup.
        logger.error("cloudinary_image_cleanup_failed", { publicId, error });
      }
    }),
  );
};

export const catalogService = {
  categories: () => catalogRepository.listCategories(),
  createCategory: async (data) => {
    if (data.parentId && !(await catalogRepository.findCategory(data.parentId)))
      throw new NotFoundError("Parent category not found.");
    return catalogRepository.createCategory(categoryData(data));
  },
  updateCategory: async (id, data) => {
    if (!(await catalogRepository.findCategory(id)))
      throw new NotFoundError("Category not found.");
    return catalogRepository.updateCategory(id, categoryData(data));
  },
  deleteCategory: async (id) => {
    const category = await catalogRepository.categoryUsage(id);
    if (!category) throw new NotFoundError("Category not found.");
    if (category._count.children)
      throw new ConflictError(
        "Categories with child categories cannot be deleted.",
      );
    if (category._count.products)
      throw new ConflictError("Categories with products cannot be deleted.");
    return catalogRepository.deleteCategory(id);
  },
  products: async (query) => {
    const pagination = getPagination(query);
    const [data, total] = await catalogRepository.listProducts({
      where: productWhere(query),
      ...pagination,
      orderBy: sort(query),
    });
    return paginated(data, total, pagination);
  },
  product: async (slug) => {
    const product = await catalogRepository.findProduct(slug);
    if (!product) throw new NotFoundError("Product not found.");
    return product;
  },
  createProduct: async (data) => {
    if (!(await catalogRepository.findCategory(data.categoryId)))
      throw new NotFoundError("Category not found.");
    await ensureSku(data.sku);
    return catalogRepository.createProduct(await productData(data));
  },
  updateProduct: async (id, data) => {
    const existing = await catalogRepository.findProductById(id);
    if (!existing) throw new NotFoundError("Product not found.");
    if (
      data.categoryId &&
      !(await catalogRepository.findCategory(data.categoryId))
    )
      throw new NotFoundError("Category not found.");
    if (data.sku) await ensureSku(data.sku, id);
    const updated = await catalogRepository.updateProduct(
      id,
      await productData(data, id),
    );
    if (data.images)
      await deleteRemovedCloudinaryImages(existing.images, data.images);
    return updated;
  },
  deleteProduct: async (id, adminId) => {
    if (!(await catalogRepository.findProductById(id)))
      throw new NotFoundError("Product not found.");
    return catalogRepository.softDeleteProduct(id, adminId);
  },
  restoreProduct: async (id) => {
    const product = await catalogRepository.findProductById(id);
    if (!product) throw new NotFoundError("Product not found.");
    if (!product.deletedAt) throw new ConflictError("Product is not deleted.");
    return catalogRepository.restoreProduct(id);
  },
};
