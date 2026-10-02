import { ConflictError } from '../utils/app-error.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';

const unavailable = (error, items) => {
  if (error.message !== 'INVENTORY_UNAVAILABLE') throw error;
  const item = items[0];
  // Size-free categories (Kaleere) reserve against the product's aggregate stock.
  const scope = item.size == null ? 'the available quantity' : `size ${item.size}`;
  throw new ConflictError(`Insufficient stock for product ${item.productId} (${scope}).`);
};

export const inventoryService = {
  reserveAll: async (tx, orderId, items) => {
    try {
      await inventoryRepository.reserveAll(tx, orderId, items);
    } catch (error) {
      unavailable(error, items);
    }
  },
  reserve: async (tx, orderId, item) => {
    try {
      await inventoryRepository.reserve(tx, orderId, item);
    } catch (error) {
      unavailable(error, [item]);
    }
  },
  commit: (tx, orderId, item) => inventoryRepository.transition(tx, orderId, item, 'COMMIT'),
  release: (tx, orderId, item) => inventoryRepository.transition(tx, orderId, item, 'RELEASE'),
  return: (tx, orderId, item) => inventoryRepository.transition(tx, orderId, item, 'RETURN'),
  refund: (tx, orderId, item) => inventoryRepository.transition(tx, orderId, item, 'REFUND'),
};
