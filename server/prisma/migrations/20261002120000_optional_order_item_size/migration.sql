-- Kaleere products have no size variants, so their order lines and inventory
-- movements carry no size. Both columns become optional; existing size-based
-- rows keep their values untouched.
ALTER TABLE "OrderItem" ALTER COLUMN "selectedSize" DROP NOT NULL;
ALTER TABLE "InventoryMovement" ALTER COLUMN "size" DROP NOT NULL;

-- Postgres treats NULLs as distinct in a unique index, so the existing
-- @@unique([orderId, productId, size, type]) no longer prevents duplicate
-- size-free movements for the same order line. This partial unique index closes
-- that gap without weakening the constraint for sized lines.
CREATE UNIQUE INDEX "InventoryMovement_orderId_productId_type_no_size_key"
  ON "InventoryMovement" ("orderId", "productId", "type")
  WHERE "size" IS NULL;