import crypto from 'node:crypto';
import { ConflictError, NotFoundError } from '../utils/app-error.js';
import { checkoutRepository } from '../repositories/checkout.repository.js';
import { inventoryService } from './inventory.service.js';

const shipping = Object.freeze({ STANDARD: 0, EXPRESS: 250 });
const number = () => `RB-${new Date().getFullYear()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

const groupItems = (items) => {
  const grouped = new Map();
  items.forEach((item) => {
    const key = `${item.productId}:${item.size}`;
    grouped.set(key, { ...item, quantity: (grouped.get(key)?.quantity ?? 0) + item.quantity });
  });
  return [...grouped.values()];
};

export const checkoutService = {
  create: async (payload) => {
    const items = groupItems(payload.items);
    if (items.some((item) => item.quantity > 10)) {
      throw new ConflictError('Maximum quantity per product size is 10.');
    }

    return checkoutRepository.transaction(async (tx) => {
      const products = await checkoutRepository.productsByIds(tx, items.map((item) => item.productId));
      if (products.length !== new Set(items.map((item) => item.productId)).size) {
        throw new NotFoundError('One or more products are unavailable.');
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      const lines = items.map((item) => {
        const product = productsById.get(item.productId);
        const size = product.sizes.find((entry) => entry.size === item.size);
        if (!size) throw new NotFoundError(`Size ${item.size} is unavailable.`);
        return { ...item, price: Number(product.salePrice ?? product.price) };
      });

      const customer = await checkoutRepository.upsertCustomer(tx, payload);
      const subtotal = lines.reduce((total, item) => total + item.price * item.quantity, 0);
      const shippingAmount = shipping[payload.shippingMethod];
      const totalAmount = subtotal + shippingAmount;
      const order = await checkoutRepository.createOrder(tx, {
        orderNumber: number(),
        customerId: customer.id,
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2,
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        notes: payload.notes,
        shippingMethod: payload.shippingMethod,
        shippingAmount,
        totalAmount,
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        orderItems: { create: lines.map((item) => ({ productId: item.productId, selectedSize: item.size, quantity: item.quantity, price: item.price })) },
        payment: { create: { method: payload.paymentMethod, status: 'PENDING', amount: totalAmount } },
        timeline: { create: { status: 'PENDING', note: 'Order created.' } },
      });

      await inventoryService.reserveAll(tx, order.id, lines);
      return { order, customer, amount: totalAmount, payment: order.payment };
    });
  },
};
