import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { requireAdmin, requireRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  orderCancelSchema,
  orderIdSchema,
  orderListSchema,
  orderStatusSchema,
  orderUpdateSchema,
} from "../validators/order.validator.js";
const router = Router();
router.use(requireAdmin);
router.get("/", validate(orderListSchema), asyncHandler(orderController.list));
router.get("/:id", validate(orderIdSchema), asyncHandler(orderController.get));
router.patch(
  "/:id",
  requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  validate(orderUpdateSchema),
  asyncHandler(orderController.update),
);
router.patch(
  "/:id/status",
  requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  validate(orderStatusSchema),
  asyncHandler(orderController.status),
);
router.patch(
  "/:id/cancel",
  requireRole("SUPER_ADMIN", "ADMIN"),
  validate(orderCancelSchema),
  asyncHandler(orderController.cancel),
);
export default router;
