/**
 * Size-variant rules for Royal Bridal. Mirrors `server/src/constants/category.js`
 * so the storefront and the API agree on which categories carry sizes.
 *
 * Bridal Chuda, Short Chuda and Bangles carry ProductSize variants. Kaleere is a
 * fixed one-piece design and has none, so it is added to the bag without a size.
 *
 * Sizes are required unless the category is explicitly size-free. An allowlist
 * would silently skip validation for a category added later, which is the unsafe
 * direction to fail in. Matching is by category slug, with the name as fallback.
 */
export const SIZE_FREE_CATEGORY_SLUGS = ["kaleere"];

export const DEFAULT_PRODUCT_SIZES = ["2.2", "2.4", "2.6", "2.8", "2.10"];

export const DEFAULT_PRODUCT_SIZE_STOCK = 5;

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const slugFor = (category) => {
  if (!category) return "";
  if (typeof category === "string") return slugify(category);
  return category.slug || slugify(category.name || "");
};

/** True when a product in this category must be ordered with a size variant. */
export const requiresSize = (category) =>
  !SIZE_FREE_CATEGORY_SLUGS.includes(slugFor(category));

/** Default size rows for a newly size-bearing product. */
export const defaultSizeRows = () =>
  DEFAULT_PRODUCT_SIZES.map((size) => ({
    size,
    stock: DEFAULT_PRODUCT_SIZE_STOCK,
  }));