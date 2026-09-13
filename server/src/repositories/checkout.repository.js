import { prisma } from '../lib/prisma.js';

const checkoutTransactionOptions = {
  isolationLevel: 'Serializable',
  maxWait: 5_000,
  timeout: 15_000,
};

export const checkoutRepository = {
  transaction: (callback) => prisma.$transaction(callback, checkoutTransactionOptions),
  productsByIds: (tx, ids) => tx.product.findMany({ where: { id: { in: ids }, active: true, deletedAt: null }, include: { sizes: true } }),
  findCustomer: (tx, email, phone) => tx.customer.findFirst({ where: { OR: [{ phone }, ...(email ? [{ email }] : [])] } }),
  upsertCustomer: async (tx, data) => {
    const current = await tx.customer.findFirst({ where: { OR: [{ phone: data.phone }, ...(data.email ? [{ email: data.email }] : [])] } });
    return current
      ? tx.customer.update({ where: { id: current.id }, data: { name: data.name, email: data.email ?? current.email, phone: data.phone } })
      : tx.customer.create({ data: { name: data.name, email: data.email, phone: data.phone } });
  },
  // Checkout only needs the payment record after creation. Avoid loading the
  // customer, every item/product, and the timeline while the transaction is open.
  createOrder: (tx, data) => tx.order.create({ data, include: { payment: true } }),
};
