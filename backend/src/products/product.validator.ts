import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  category: z.string().trim().min(1, "Category is required"),
  unitPrice: z.coerce.number().nonnegative("Unit price cannot be negative"),
  currentStock: z.coerce
    .number()
    .int()
    .nonnegative("Current stock cannot be negative")
    .default(0),
  minStockAlert: z.coerce
    .number()
    .int()
    .nonnegative("Minimum stock alert cannot be negative")
    .default(0),
  warehouse: z.string().trim().min(1, "Warehouse location is required"),
});

export const updateProductSchema = createProductSchema
  .omit({ currentStock: true })
  .partial();

export const stockMovementSchema = z.object({
  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than 0"),
  type: z.enum(["IN", "OUT"]),
  reason: z.string().trim().min(1, "Reason is required"),
});