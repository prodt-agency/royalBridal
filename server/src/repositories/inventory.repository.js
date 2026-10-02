import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';

/** Product lines with no size (Kaleere) have no ProductSize row to update. */
const hasSize = (item) => item.size !== null && item.size !== undefined;

const reserveAll = async (tx, orderId, items) => {
  const requestedItems = items.map((item) => Prisma.sql`(
    ${randomUUID()}, ${orderId}, ${item.productId}, ${item.size ?? null}, ${item.quantity}
  )`);

  const reservedCount = await tx.$executeRaw`
    WITH requested (id, order_id, product_id, size, quantity) AS (
      VALUES ${Prisma.join(requestedItems)}
    ),
    product_totals AS (
      SELECT product_id, SUM(quantity)::int AS quantity
      FROM requested
      GROUP BY product_id
    ),
    updated_products AS (
      UPDATE "Product" AS product
      SET
        "stock" = product."stock" - totals.quantity,
        "reservedStock" = product."reservedStock" + totals.quantity
      FROM product_totals AS totals
      WHERE product.id = totals.product_id
        AND product.active = true
        AND product."deletedAt" IS NULL
        AND product."stock" >= totals.quantity
      RETURNING product.id
    ),
    updated_sizes AS (
      UPDATE "ProductSize" AS product_size
      SET
        "stock" = product_size."stock" - requested.quantity,
        "reservedStock" = product_size."reservedStock" + requested.quantity
      FROM requested
      WHERE product_size."productId" = requested.product_id
        AND product_size.size IS NOT DISTINCT FROM requested.size
        AND product_size."stock" >= requested.quantity
      RETURNING product_size."productId" AS product_id, product_size.size
    )
    INSERT INTO "InventoryMovement" ("id", "orderId", "productId", "size", "quantity", "type", "createdAt")
    SELECT requested.id, requested.order_id, requested.product_id, requested.size, requested.quantity, 'RESERVE', CURRENT_TIMESTAMP
    FROM requested
    JOIN updated_products ON updated_products.id = requested.product_id
    LEFT JOIN updated_sizes ON updated_sizes.product_id = requested.product_id
      AND updated_sizes.size IS NOT DISTINCT FROM requested.size
      AND requested.size IS NULL
    UNION ALL
    SELECT requested.id, requested.order_id, requested.product_id, requested.size, requested.quantity, 'RESERVE', CURRENT_TIMESTAMP
    FROM requested
    JOIN updated_products ON updated_products.id = requested.product_id
    JOIN updated_sizes ON updated_sizes.product_id = requested.product_id
      AND updated_sizes.size IS NOT DISTINCT FROM requested.size
  `;

  if (Number(reservedCount) !== items.length) {
    throw new Error('INVENTORY_UNAVAILABLE');
  }
};

export const inventoryRepository = {
  movement: (tx, data) => tx.inventoryMovement.create({ data }),
  reserveAll,
  reserve: async (tx, orderId, item) => {
    const size = hasSize(item) ? item.size : null;
    const prior = await tx.inventoryMovement.findFirst({ where: { orderId, productId: item.productId, size, type: 'RESERVE' } });
    if (prior) return;
    const product = await tx.product.updateMany({ where: { id: item.productId, active: true, deletedAt: null, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity }, reservedStock: { increment: item.quantity } } });
    if (!product.count) throw new Error('INVENTORY_UNAVAILABLE');
    if (size !== null) {
      const sizeRow = await tx.productSize.updateMany({ where: { productId: item.productId, size, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity }, reservedStock: { increment: item.quantity } } });
      if (!sizeRow.count) throw new Error('INVENTORY_UNAVAILABLE');
    }
    await tx.inventoryMovement.create({ data: { orderId, productId: item.productId, size, quantity: item.quantity, type: 'RESERVE' } });
  },
  transition: async (tx, orderId, item, type) => {
    const size = hasSize(item) ? item.size : null;
    const prior = await tx.inventoryMovement.findFirst({ where: { orderId, productId: item.productId, size, type } });
    if (prior) return;
    const productData = type === 'COMMIT' ? { reservedStock: { decrement: item.quantity } } : { stock: { increment: item.quantity }, reservedStock: { decrement: item.quantity } };
    await Promise.all([
      tx.product.update({ where: { id: item.productId }, data: productData }),
      // Categories without size variants have no ProductSize row to update.
      ...(size === null ? [] : [tx.productSize.update({ where: { productId_size: { productId: item.productId, size } }, data: productData })]),
    ]);
    await tx.inventoryMovement.create({ data: { orderId, productId: item.productId, size, quantity: item.quantity, type } });
  },
};