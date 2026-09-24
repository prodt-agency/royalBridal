-- Store Cloudinary's stable deletion identifier for new product images.
-- Existing local/legacy image rows remain unchanged.
ALTER TABLE "ProductImage" ADD COLUMN "cloudinaryPublicId" TEXT;
