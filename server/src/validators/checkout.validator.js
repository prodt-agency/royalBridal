import { z } from "zod";
// `size` is optional here because whether it is required depends on the product's
// category, which is only known after the products are loaded. The conditional
// requirement is enforced in checkoutService against the category's size rule.
//
// `null` is the project's "no size" value (see OrderItem.selectedSize and
// InventoryMovement.size, both nullable), and the client sends it explicitly for
// size-free categories such as Kaleere, so the field is nullish rather than just
// optional. A present value must still be a real, non-empty size: the category
// rule rejects a missing or unknown size for sized categories afterwards.
const item = z.object({
  productId: z.coerce.number().int().positive(),
  size: z.string().trim().min(1).max(40).nullish(),
  quantity: z.coerce.number().int().min(1).max(10),
});
export const checkoutSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120),
      email: z.string().email().max(254).optional(),
      phone: z
        .string()
        .trim()
        .regex(/^[0-9+ -]{8,20}$/),
      addressLine1: z.string().trim().min(5).max(255),
      addressLine2: z.string().trim().max(255).optional(),
      city: z.string().trim().min(2).max(80),
      state: z.string().trim().min(2).max(80),
      pincode: z
        .string()
        .trim()
        .regex(/^[0-9A-Za-z -]{4,12}$/),
      notes: z.string().trim().max(2000).optional(),
      shippingMethod: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
      paymentMethod: z.enum(["COD", "RAZORPAY"]),
      items: z.array(item).min(1).max(20),
    })
    .superRefine((body, ctx) => {
      if (!body.email && !body.phone)
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Email or phone is required.",
        });
    }),
  params: z.object({}),
  query: z.object({}),
});
