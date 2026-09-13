import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';

const reserveAll = async (tx, orderId, items) => {
  const requestedItems = items.map((item) => Prisma.sql`(
    ${randomUUID()}, ${orderId}, ${item.productId}, ${item.size}, ${item.quantity}
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
        AND product_size.size = requested.size
        AND product_size."stock" >= requested.quantity
      RETURNING product_size."productId" AS product_id, product_size.size
    )
    INSERT INTO "InventoryMovement" ("id", "orderId", "productId", "size", "quantity", "type", "createdAt")
    SELECT requested.id, requested.order_id, requested.product_id, requested.size, requested.quantity, 'RESERVE', CURRENT_TIMESTAMP
    FROM requested
    JOIN updated_products ON updated_products.id = requested.product_id
    JOIN updated_sizes ON updated_sizes.product_id = requested.product_id AND updated_sizes.size = requested.size
  `;

  if (Number(reservedCount) !== items.length) {
    throw new Error('INVENTORY_UNAVAILABLE');
  }
};

export const inventoryRepository = {
  movement: (tx, data) => tx.inventoryMovement.create({ data }),
  reserveAll,
  reserve: async (tx, orderId, item) => {
    const movement = await tx.inventoryMovement.findUnique({ where: { orderId_productId_size_type: { orderId, productId: item.productId, size: item.size, type: 'RESERVE' } } });
    if (movement) return;
    const product = await tx.product.updateMany({ where: { id: item.productId, active: true, deletedAt: null, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity }, reservedStock: { increment: item.quantity } } });
    if (!product.count) throw new Error('INVENTORY_UNAVAILABLE');
    const size = await tx.productSize.updateMany({ where: { productId: item.productId, size: item.size, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity }, reservedStock: { increment: item.quantity } } });
    if (!size.count) throw new Error('INVENTORY_UNAVAILABLE');
    await tx.inventoryMovement.create({ data: { orderId, productId: item.productId, size: item.size, quantity: item.quantity, type: 'RESERVE' } });
  },
  transition: async (tx, orderId, item, type) => {
    const prior = await tx.inventoryMovement.findUnique({ where: { orderId_productId_size_type: { orderId, productId: item.productId, size: item.size, type } } });
    if (prior) return;
    const productData = type === 'COMMIT' ? { reservedStock: { decrement: item.quantity } } : { stock: { increment: item.quantity }, reservedStock: { decrement: item.quantity } };
    await Promise.all([tx.product.update({ where: { id: item.productId }, data: productData }), tx.productSize.update({ where: { productId_size: { productId: item.productId, size: item.size } }, data: productData })]);
    await tx.inventoryMovement.create({ data: { orderId, productId: item.productId, size: item.size, quantity: item.quantity, type } });
  },
};
