import { Router } from "express";
import { customerController } from "../controllers/customer.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  customerIdSchema,
  customerListSchema,
} from "../validators/customer.validator.js";
const router = Router();
router.use(requireAdmin);
router.get(
  "/",
  validate(customerListSchema),
  asyncHandler(customerController.list),
);
router.get(
  "/:id",
  validate(customerIdSchema),
  asyncHandler(customerController.get),
);
router.get(
  "/:id/orders",
  validate(customerIdSchema),
  asyncHandler(customerController.orders),
);
export default router;
