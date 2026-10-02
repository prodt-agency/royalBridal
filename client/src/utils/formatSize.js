/**
 * Order lines for products whose category has no size variants (Kaleere) store a
 * null size. Rendering that raw would show "Size: " with nothing after it, so
 * order views fall back to an explicit label.
 */
export const formatOrderSize = (size) => {
  if (size === null || size === undefined) return "No size";
  const trimmed = String(size).trim();
  return trimmed === "" ? "No size" : trimmed;
};

export default formatOrderSize;
