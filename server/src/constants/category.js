import { createSlug } from '../utils/slug.js';

/**
 * Size-variant rules for Royal Bridal.
 *
 * Bridal Chuda, Short Chuda and Bangles are made to measure and therefore carry
 * ProductSize variants. Kaleere is a fixed, one-piece design and has none.
 *
 * The rule is written as "sizes are required unless the category is explicitly
 * size-free" rather than as an allowlist of sized categories. An allowlist would
 * silently drop validation for any category added later, which is the unsafe
 * direction to fail in. Matching is by slug (the project's category identifier),
 * with the name as a fallback for objects that only carry one.
 */
export const SIZE_FREE_CATEGORY_SLUGS = Object.freeze(['kaleere']);

/** Sizes offered by default when a size-bearing category has none configured. */
export const DEFAULT_PRODUCT_SIZES = Object.freeze(['2.2', '2.4', '2.6', '2.8', '2.10']);

/** Stock assigned to each auto-generated default size. */
export const DEFAULT_PRODUCT_SIZE_STOCK = 5;

const slugFor = (category) => {
  if (!category) return '';
  if (typeof category === 'string') return createSlug(category);
  return category.slug || createSlug(category.name || '');
};

export const requiresSize = (category) =>
  !SIZE_FREE_CATEGORY_SLUGS.includes(slugFor(category));

/** Default size rows for a newly size-bearing product. */
export const defaultSizeRows = () =>
  DEFAULT_PRODUCT_SIZES.map((size) => ({
    size,
    stock: DEFAULT_PRODUCT_SIZE_STOCK,
  }));