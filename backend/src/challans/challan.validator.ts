import { z } from "zod";

export const createChallanSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),

  status: z.enum(["DRAFT", "CONFIRMED"]).default("DRAFT"),

  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1, "At least one product is required"),
});

export const updateChallanStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});